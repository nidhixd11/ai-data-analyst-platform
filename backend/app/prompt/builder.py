from typing import List, Dict, Any, Optional


# This is the exact template from your design document.
# The {placeholders} get replaced with real data at runtime.
PROMPT_TEMPLATE = """You are a careful data analyst. Answer only using the uploaded data context.

Schema and stats:
{schema_summary}

Relevant context:
{retrieved_context}

Conversation so far:
{chat_history}

User question:
{user_question}

Instructions:
- Give a concise answer.
- Say so when the data is insufficient.
- Do not invent columns or values.
- If useful, suggest a chart type."""


class PromptBuilder:
    """
    Assembles the final prompt string that gets sent to the LLM.

    Think of this as the person who writes the briefing document
    before a meeting. It takes raw ingredients:
        - schema_summary  → what the dataset looks like
        - retrieved_chunks → the relevant data found by the retriever
        - chat_history    → what's been said in this session so far
        - user_question   → what the user just asked

    And combines them into one clean, structured prompt string.
    """

    def _format_schema(self, schema_summary: Dict[str, Any]) -> str:
        """
        Converts the schema dictionary into readable text for the LLM.

        Example input:
            {
                "columns": ["region", "sales"],
                "dtypes": {"region": "object", "sales": "int64"},
                "null_pct": {"region": 0.0, "sales": 2.5},
                "row_count": 500
            }

        Example output:
            Rows: 500
            Columns: region (object, 0.0% null), sales (int64, 2.5% null)
        """
        if not schema_summary:
            return "No schema available."

        lines = []

        # Row count
        if "row_count" in schema_summary:
            lines.append(f"Rows: {schema_summary['row_count']}")

        # Column details
        columns = schema_summary.get("columns", [])
        dtypes = schema_summary.get("dtypes", {})
        null_pct = schema_summary.get("null_pct", {})

        if columns:
            col_descriptions = []
            for col in columns:
                dtype = dtypes.get(col, "unknown")
                null = null_pct.get(col, 0.0)
                col_descriptions.append(f"{col} ({dtype}, {null}% null)")
            lines.append(f"Columns: {', '.join(col_descriptions)}")

        # Any extra stats (ranges, top values etc.)
        if "stats" in schema_summary:
            lines.append(f"Stats: {schema_summary['stats']}")

        return "\n".join(lines) if lines else "No schema available."

    def _format_chunks(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Converts retrieved chunks into readable text for the LLM.

        Each chunk has a 'text' field with the actual data rows.
        We number them so the LLM can reference them if needed.

        Example output:
            [Chunk 1] region: North | sales: 5000 | date: 2024-01-01
            [Chunk 2] region: South | sales: 3000 | date: 2024-01-02
        """
        if not chunks:
            return "No relevant context found."

        formatted = []
        for i, chunk in enumerate(chunks, start=1):
            text = chunk.get("text", "").strip()
            if text:
                formatted.append(f"[Chunk {i}] {text}")

        return "\n".join(formatted) if formatted else "No relevant context found."

    def _format_history(self, chat_history: List[Dict[str, str]]) -> str:
        """
        Converts the conversation history into readable text for the LLM.

        Example input:
            [
                {"role": "user", "content": "What are total sales?"},
                {"role": "assistant", "content": "Total sales are 14000."}
            ]

        Example output:
            User: What are total sales?
            Assistant: Total sales are 14000.
        """
        if not chat_history:
            return "No previous conversation."

        lines = []
        for turn in chat_history:
            role = turn.get("role", "unknown").capitalize()
            content = turn.get("content", "").strip()
            if content:
                lines.append(f"{role}: {content}")

        return "\n".join(lines) if lines else "No previous conversation."

    def build(
        self,
        user_question: str,
        schema_summary: Dict[str, Any],
        retrieved_chunks: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Main method — call this to get the final prompt string.

        Arguments:
            user_question    → what the user just typed
            schema_summary   → the dataset profile from schema/ module
            retrieved_chunks → relevant chunks from T-117 keyword retriever
            chat_history     → list of previous turns (optional)

        Returns:
            A single string — the complete prompt ready to send to the LLM.
        """
        if chat_history is None:
            chat_history = []

        # Format each ingredient
        schema_text = self._format_schema(schema_summary)
        context_text = self._format_chunks(retrieved_chunks)
        history_text = self._format_history(chat_history)

        # Fill the template
        prompt = PROMPT_TEMPLATE.format(
            schema_summary=schema_text,
            retrieved_context=context_text,
            chat_history=history_text,
            user_question=user_question,
        )

        return prompt


# Shared instance — same pattern as session_store and keyword_retriever
prompt_builder = PromptBuilder()
