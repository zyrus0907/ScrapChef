from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.costs.application.dtos import CostSummary, MonthlySnapshot
from app.modules.pantry.infrastructure.models import PantryItemModel


class CostAnalyticsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ------------------------------------------------------------------
    # Shared value expression
    # ------------------------------------------------------------------

    @staticmethod
    def _value_expr():
        """Monetary value per row depending on status.

        consumed → full purchase_price (user got value from the food)
        wasted   → proportional value of remaining quantity when discarded
        """
        m = PantryItemModel
        wasted_val = case(
            (
                (m.quantity_purchased.isnot(None)) & (m.quantity_purchased > 0),
                func.coalesce(m.purchase_price, 0)
                * m.quantity
                / m.quantity_purchased,
            ),
            else_=func.coalesce(m.purchase_price, 0),
        )
        return case(
            (m.status == "consumed", func.coalesce(m.purchase_price, 0)),
            (m.status == "wasted", wasted_val),
            else_=0,
        )

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    async def get_monthly_summary(
        self, household_id: UUID, year: int, month: int
    ) -> CostSummary:
        m = PantryItemModel
        value = self._value_expr()

        rows = (
            await self._session.execute(
                select(
                    m.status,
                    func.count().label("cnt"),
                    func.sum(value).label("total"),
                )
                .where(m.household_id == household_id)
                .where(m.status.in_(["consumed", "wasted"]))
                .where(func.extract("year", m.updated_at) == year)
                .where(func.extract("month", m.updated_at) == month)
                .group_by(m.status)
            )
        ).all()

        consumed_count, consumed_val = 0, Decimal("0")
        wasted_count, wasted_val = 0, Decimal("0")
        for row in rows:
            if row.status == "consumed":
                consumed_count, consumed_val = row.cnt, Decimal(str(row.total or 0))
            elif row.status == "wasted":
                wasted_count, wasted_val = row.cnt, Decimal(str(row.total or 0))

        total = consumed_count + wasted_count
        return CostSummary(
            month=f"{year:04d}-{month:02d}",
            total_saved=consumed_val.quantize(Decimal("0.01")),
            total_wasted=wasted_val.quantize(Decimal("0.01")),
            items_consumed=consumed_count,
            items_wasted=wasted_count,
            waste_rate=round(wasted_count / total, 3) if total else 0.0,
            net_savings=(consumed_val - wasted_val).quantize(Decimal("0.01")),
        )

    async def get_history(
        self, household_id: UUID, months: int = 6
    ) -> list[MonthlySnapshot]:
        m = PantryItemModel
        value = self._value_expr()
        month_bucket = func.date_trunc("month", m.updated_at).label("bucket")
        cutoff = datetime.now(timezone.utc) - timedelta(days=months * 31)

        rows = (
            await self._session.execute(
                select(
                    month_bucket,
                    m.status,
                    func.count().label("cnt"),
                    func.sum(value).label("total"),
                )
                .where(m.household_id == household_id)
                .where(m.status.in_(["consumed", "wasted"]))
                .where(m.updated_at >= cutoff)
                .group_by(month_bucket, m.status)
                .order_by(month_bucket.desc())
            )
        ).all()

        # Pivot: month_key → {consumed, wasted}
        buckets: dict[str, dict] = {}
        for row in rows:
            key = row.bucket.strftime("%Y-%m")
            buckets.setdefault(
                key,
                {"saved": Decimal("0"), "wasted": Decimal("0"), "c_cnt": 0, "w_cnt": 0},
            )
            val = Decimal(str(row.total or 0))
            if row.status == "consumed":
                buckets[key]["saved"] = val
                buckets[key]["c_cnt"] = row.cnt
            else:
                buckets[key]["wasted"] = val
                buckets[key]["w_cnt"] = row.cnt

        return [
            MonthlySnapshot(
                month=key,
                total_saved=d["saved"].quantize(Decimal("0.01")),
                total_wasted=d["wasted"].quantize(Decimal("0.01")),
                items_consumed=d["c_cnt"],
                items_wasted=d["w_cnt"],
                net_savings=(d["saved"] - d["wasted"]).quantize(Decimal("0.01")),
            )
            for key, d in sorted(buckets.items(), reverse=True)
        ]
