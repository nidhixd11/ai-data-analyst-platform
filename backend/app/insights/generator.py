from typing import Any


class AutoInsightGenerator:
    """T-121 auto insight generator."""

    def generate(self, schema_summary: dict[str, Any]) -> list[str]:
        insights = []

        rows = schema_summary.get("rows", 0)
        columns = schema_summary.get("columns", 0)
        duplicate_rows = schema_summary.get("duplicate_rows", 0)
        null_percentage = schema_summary.get("null_percentage", 0.0)
        numeric_columns = schema_summary.get("numeric_columns", 0)

        insights.append(
            f"Dataset successfully profiled ({rows} rows × {columns} columns)."
        )

        if duplicate_rows == 0:
            insights.append("No duplicate rows detected.")
        else:
            insights.append(f"{duplicate_rows} duplicate rows detected.")

        if null_percentage == 0:
            insights.append("No missing values detected.")
        else:
            insights.append(
                f"{null_percentage:.1f}% missing values detected."
            )

        insights.append(
            f"{numeric_columns} numeric columns identified."
        )

        for column in schema_summary.get("schema", []):
            if column.get("null_percent", 0) > 20:
                insights.append(
                    f"Column '{column['name']}' has "
                    f"{column['null_percent']}% missing values."
                )

            if column.get("min") is not None and column.get("max") is not None:
                col_name = column["name"]
                col_min = column["min"]
                col_max = column["max"]
                col_mean = column.get("mean")
                if col_mean is not None:
                    insights.append(
                        f"{col_name} ranges from {col_min:.2f} to "
                        f"{col_max:.2f} with an average of {col_mean:.2f}."
                    )

        return insights
