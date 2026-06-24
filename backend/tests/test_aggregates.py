"""Tests for aggregate computation."""

import pandas as pd
import pytest
from app.retriever.aggregates import AggregateComputer


@pytest.fixture
def sample_df():
    """Sample DataFrame for testing."""
    return pd.DataFrame(
        {
            "product": ["A", "B", "A", "B"],
            "region": ["North", "North", "South", "South"],
            "sales": [1000, 1500, 2000, 2500],
        }
    )


def test_sum_by_column(sample_df):
    """Test summing a column."""
    computer = AggregateComputer(sample_df)
    result = computer.sum_by_column("sales")
    assert result == 7000


def test_avg_by_column(sample_df):
    """Test average."""
    computer = AggregateComputer(sample_df)
    result = computer.avg_by_column("sales")
    assert result == 1750.0


def test_count(sample_df):
    """Test row count."""
    computer = AggregateComputer(sample_df)
    result = computer.count()
    assert result == 4


def test_group_by_sum(sample_df):
    """Test group by with sum."""
    computer = AggregateComputer(sample_df)
    result = computer.group_by("product", "sales", "sum")
    assert result == {"A": 3000, "B": 4000}


def test_group_by_count(sample_df):
    """Test group by with count."""
    computer = AggregateComputer(sample_df)
    result = computer.group_by("region", "sales", "count")
    assert result == {"North": 2, "South": 2}
