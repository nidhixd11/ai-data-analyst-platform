from typing import Any

import pandas as pd


class DatasetChunker:
    """T-115 row-window and column-summary chunker."""

    def chunk(self, df: pd.DataFrame, window_size: int = 10) -> list[dict[str, Any]]:
        chunks = []

        for start in range(0, len(df), window_size):
            end = min(start + window_size, len(df))

            chunk = {
                "metadata": {
                    "start_row": start,
                    "end_row": end - 1,
                    "row_count": end - start,
                },
                "rows": df.iloc[start:end].to_dict(orient="records"),
            }

            chunks.append(chunk)

        return chunks