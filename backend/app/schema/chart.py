from typing import Any

from pydantic import BaseModel


class ChartConfig(BaseModel):
    title: str
    chart_type: str
    x_axis: str
    y_axis: str
    data: list[dict[str, Any]]
