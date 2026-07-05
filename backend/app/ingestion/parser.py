from typing import Any

import pandas as pd


class DatasetProfiler:
    """T-112 dataset parser and profiler."""

    def _read_csv(self, file_path: str) -> pd.DataFrame:
        """Read a CSV file."""
        return pd.read_csv(file_path)

    def _read_excel(self, file_path: str) -> pd.DataFrame:
        """Read an Excel file using openpyxl."""
        return pd.read_excel(
            file_path,
            engine="openpyxl",
        )

    def _load_dataframe(self, file_path: str) -> pd.DataFrame:
        """
        Detect file type and route to the correct parser.
        """

        if file_path.endswith(".csv"):
            return self._read_csv(file_path)

        if file_path.endswith(".xlsx"):
            return self._read_excel(file_path)

        if file_path.endswith(".xls"):
            return pd.read_excel(file_path)

        raise ValueError("Unsupported file type")

    def profile(self, file_path: str) -> dict[str, Any]:
        df = self._load_dataframe(file_path)

        return {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "dtypes": {
                col: str(dtype)
                for col, dtype in df.dtypes.items()
            },
            "null_counts": df.isnull().sum().to_dict(),
        }
