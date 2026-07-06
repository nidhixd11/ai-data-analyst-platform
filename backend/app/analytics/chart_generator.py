from pandas.api.types import (
    is_datetime64_any_dtype,
    is_numeric_dtype,
)

from app.schema.chart import ChartConfig


class ChartGenerator:

    def generate(self, df):

        charts = []

        numeric_cols = []
        categorical_cols = []
        datetime_cols = []

        # -----------------------------
        # Detect column types
        # -----------------------------
        for col in df.columns:

            if is_datetime64_any_dtype(df[col]):
                datetime_cols.append(col)

            elif is_numeric_dtype(df[col]):
                numeric_cols.append(col)

            else:
                categorical_cols.append(col)

        # ----------------------------------
        # Choose the best numeric column
        # ----------------------------------

        preferred = [
            "revenue",
            "sales",
            "profit",
            "amount",
            "price",
            "salary",
            "marks",
            "temperature",
        ]

        selected_numeric = numeric_cols[0] if numeric_cols else None

        for col in numeric_cols:
            if any(word in col.lower() for word in preferred):
                selected_numeric = col
                break

        # ---------------------------------------------------
        # RULE 1
        # Datetime + Numeric = Line Chart
        # ---------------------------------------------------
        if datetime_cols and numeric_cols:

            if selected_numeric is None:
                return charts

            x = datetime_cols[0]
            y = numeric_cols[0]

            chart_df = (
                df[[x, y]]
                .sort_values(x)
            )

            charts.append(
                ChartConfig(
                    title=f"{y} over {x}",
                    chart_type="line",
                    x_axis=x,
                    y_axis=y,
                    data=chart_df.to_dict("records"),
                )
            )

            return charts

         # ---------------------------------------------------
        # RULE 2
        # Two numeric columns = Scatter
        # ---------------------------------------------------
        if len(numeric_cols) >= 2:

            x = numeric_cols[0]
            y = numeric_cols[1]

            chart_df = df[[x, y]]

            charts.append(
                ChartConfig(
                    title=f"{y} vs {x}",
                    chart_type="scatter",
                    x_axis=x,
                    y_axis=y,
                    data=chart_df.to_dict("records"),
                )
            )

            return charts

        # ---------------------------------------------------
        # RULE 3
        # Category + Numeric = Bar Chart
        # ---------------------------------------------------
        if categorical_cols and numeric_cols:

            if selected_numeric is None:
                return charts

            x = categorical_cols[0]
            y = selected_numeric

            grouped = (
                df.groupby(x)[y]
                .mean()
                .reset_index()
            )

            charts.append(
                ChartConfig(
                    title=f"Average {y} by {x}",
                    chart_type="bar",
                    x_axis=x,
                    y_axis=y,
                    data=grouped.to_dict("records"),
                )
            )

            return charts

        # ---------------------------------------------------
        # RULE 4
        # One numeric column = Histogram
        # ---------------------------------------------------
        if len(numeric_cols) == 1:

            col = numeric_cols[0]

            chart_df = df[[col]]

            charts.append(
                ChartConfig(
                    title=f"Distribution of {col}",
                    chart_type="histogram",
                    x_axis=col,
                    y_axis="Frequency",
                    data=chart_df.to_dict("records"),
                )
            )

        return charts
