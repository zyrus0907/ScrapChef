from dataclasses import dataclass
from decimal import Decimal


@dataclass
class CostSummary:
    month: str                # "2026-06"
    total_saved: Decimal      # purchase value of consumed items
    total_wasted: Decimal     # proportional value of wasted items
    items_consumed: int
    items_wasted: int
    waste_rate: float         # wasted / (consumed + wasted)
    net_savings: Decimal      # total_saved - total_wasted


@dataclass
class MonthlySnapshot:
    month: str
    total_saved: Decimal
    total_wasted: Decimal
    items_consumed: int
    items_wasted: int
    net_savings: Decimal
