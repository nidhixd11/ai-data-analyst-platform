"""
Pandas Aggregates: Level 2 retrieval.
Computes aggregate functions (sum, avg, count, group_by) on retrieved data.
"""

import logging

import pandas as pd

logger = logging.getLogger(__name__)


class AggregateComputer:
    """Computes aggregate functions on pandas DataFrames."""

    def __init__(self, df: pd.DataFrame):
        """
        Initialize with a DataFrame.

        Args:
            df: Pandas DataFrame to aggregate
        """
        self.df = df
        logger.info(f"Initialized AggregateComputer with {len(df)} rows")

    def sum_by_column(self, column: str) -> float:
        """Sum a numeric column."""
        try:
            result = self.df[column].sum()
            logger.info(f"✓ SUM({column}) = {result}")
            return float(result)
        except Exception as e:
            logger.error(f"✗ SUM failed: {str(e)}")
            raise ValueError(f"Cannot sum column '{column}': {str(e)}")  # noqa: B904

    def avg_by_column(self, column: str) -> float:
        """Average of a numeric column."""
        try:
            result = self.df[column].mean()
            logger.info(f"✓ AVG({column}) = {result}")
            return float(result)
        except Exception as e:
            logger.error(f"✗ AVG failed: {str(e)}")
            raise ValueError(f"Cannot average column '{column}': {str(e)}")  # noqa: B904

    def count(self) -> int:
        """Row count."""
        result = len(self.df)
        logger.info(f"✓ COUNT() = {result}")
        return result

    def group_by(self, group_col: str, agg_col: str, agg_func: str = "sum") -> dict:  # type: ignore
        """
        Group by one column and aggregate another.

        Args:
            group_col: Column to group by
            agg_col: Column to aggregate
            agg_func: "sum", "avg", "count", "min", "max"

        Returns:
            Dict of group_value → aggregated_result
        """
        try:
            if agg_func == "sum":
                grouped = self.df.groupby(group_col)[agg_col].sum()
            elif agg_func == "avg":
                grouped = self.df.groupby(group_col)[agg_col].mean()
            elif agg_func == "count":
                grouped = self.df.groupby(group_col)[agg_col].count()
            elif agg_func == "min":
                grouped = self.df.groupby(group_col)[agg_col].min()
            elif agg_func == "max":
                grouped = self.df.groupby(group_col)[agg_col].max()
            else:
                raise ValueError(f"Unknown agg_func: {agg_func}")

            result = grouped.to_dict()
            logger.info(f"✓ GROUP BY {group_col} {agg_func.upper()}({agg_col}) = {result}")
            return result  # type: ignore
        except Exception as e:
            logger.error(f"✗ GROUP BY failed: {str(e)}")
            raise ValueError(f"Group by failed: {str(e)}")  # noqa: B904
