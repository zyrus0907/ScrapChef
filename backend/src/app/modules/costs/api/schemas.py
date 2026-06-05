from decimal import Decimal

from pydantic import BaseModel


class CostSummaryResponse(BaseModel):
    month: str
    total_saved: Decimal
    total_wasted: Decimal
    items_consumed: int
    items_wasted: int
    waste_rate: float
    net_savings: Decimal

    @classmethod
    def from_dto(cls, dto) -> "CostSummaryResponse":
        return cls(
            month=dto.month,
            total_saved=dto.total_saved,
            total_wasted=dto.total_wasted,
            items_consumed=dto.items_consumed,
            items_wasted=dto.items_wasted,
            waste_rate=dto.waste_rate,
            net_savings=dto.net_savings,
        )


class MonthlySnapshotResponse(BaseModel):
    month: str
    total_saved: Decimal
    total_wasted: Decimal
    items_consumed: int
    items_wasted: int
    net_savings: Decimal

    @classmethod
    def from_dto(cls, dto) -> "MonthlySnapshotResponse":
        return cls(
            month=dto.month,
            total_saved=dto.total_saved,
            total_wasted=dto.total_wasted,
            items_consumed=dto.items_consumed,
            items_wasted=dto.items_wasted,
            net_savings=dto.net_savings,
        )
