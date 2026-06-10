from typing import Any


class AutoInsightGenerator:
    """T-121 auto insight generator."""

    def generate(self, schema_summary: dict[str, Any]) -> list[str]:
        insights = []

        if schema_summary.get("rows", 0) > 1000:
            insights.append(
                f"Dataset contains {schema_summary['rows']} rows."
            )

        for column in schema_summary.get("schema", []):
            if column.get("null_percent", 0) > 20:
                insights.append(
                    f"Column '{column['name']}' has "
                    f"{column['null_percent']}% missing values."
                )

        return insights