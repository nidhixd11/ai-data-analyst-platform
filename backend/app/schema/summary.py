from typing import Any

import pandas as pd


class SchemaSummaryBuilder:
    def build(self, df: pd.DataFrame) -> dict[str, Any]:
        summary = {
            "rows": len(df),
            "columns": len(df.columns),
            "schema": [],
        }

        for col in df.columns:
            column_info = {
                "name": col,
                "dtype": str(df[col].dtype),
                "null_percent": round(
                    (df[col].isnull().sum() / len(df)) * 100, 2
                ),
            }

            if pd.api.types.is_numeric_dtype(df[col]):
                column_info["min"] = (
                    None if df[col].dropna().empty else df[col].min()
                )
                column_info["max"] = (
                    None if df[col].dropna().empty else df[col].max()
                )

            column_info["top_values"] = (
                df[col]
                .dropna()
                .value_counts()
                .head(5)
                .index
                .tolist()
            )

            summary["schema"].append(column_info)

        return summary