from typing import Any

import pandas as pd


class DatasetProfiler:
    """T-112 dataset parser and profiler."""

    def profile(self, file_path: str) -> dict[str, Any]:
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)

        elif file_path.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)

        else:
            raise ValueError("Unsupported file type")

        return {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "null_counts": df.isnull().sum().to_dict(),
        }