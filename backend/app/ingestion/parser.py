from typing import Any

import pandas as pd


class DatasetProfiler:
    """T-112 dataset parser and profiler."""

    def _read_csv(self, file_path: str) -> pd.DataFrame:
        return pd.read_csv(file_path)

    def _read_excel(self, file_path: str) -> pd.DataFrame:
        return pd.read_excel(file_path, engine="openpyxl")

    def _load_dataframe(self, file_path: str) -> pd.DataFrame:
        if file_path.endswith(".csv"):
            return self._read_csv(file_path)
        if file_path.endswith(".xlsx"):
            return self._read_excel(file_path)
        if file_path.endswith(".xls"):
            return pd.read_excel(file_path)
        raise ValueError("Unsupported file type")

    def _normalise_dtype(self, dtype: str) -> str:
        """Normalise pandas dtype strings to frontend-expected values."""
        dtype = dtype.lower()
        if dtype.startswith("int") or dtype.startswith("uint"):
            return "int"
        if dtype.startswith("float"):
            return "float"
        if dtype.startswith("datetime"):
            return "datetime"
        if dtype == "bool":
            return "bool"
        return "string"

    def profile(self, file_path: str) -> dict[str, Any]:
        df = self._load_dataframe(file_path)

        columns_detail = [
            {
                "name": col,
                "dtype": self._normalise_dtype(str(dtype)),
                "null_pct": round(
                    df[col].isnull().sum() / len(df) * 100, 2
                ),
            }
            for col, dtype in df.dtypes.items()
        ]

        return {
            "rows": len(df),
            "columns": len(df.columns),
            "columns_detail": columns_detail,
            "null_counts": df.isnull().sum().to_dict(),
        }
