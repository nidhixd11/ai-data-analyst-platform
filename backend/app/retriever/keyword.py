import re
from typing import Any


class KeywordRetriever:
    """
    Level 1 Column-Aware Keyword Retriever.

    How it works:
    1. Takes the user's question and a list of column names from their CSV
    2. Finds which column names appear in the question (keyword matching)
    3. Scores each chunk based on how many of those columns it contains
    4. Returns the most relevant chunks ranked by score
    """

    def __init__(self, top_k: int = 5):
        """
        top_k = how many chunks to return maximum.
        Default is 5 — enough context for the LLM without overwhelming it.
        """
        self.top_k = top_k

    def extract_keywords(self, question: str, columns: list[str]) -> list[str]:
        """
        Scans the user's question for words that match column names.

        Example:
            question = "what are the sales figures by region?"
            columns  = ["region", "product", "sales", "date"]
            returns  → ["sales", "region"]
        """
        # Lowercase everything so "Sales" and "sales" both match
        question_lower = question.lower()

        matched = []
        for col in columns:
            # Use word boundary matching so "date" doesn't match "update"
            pattern = r"\b" + re.escape(col.lower()) + r"\b"
            if re.search(pattern, question_lower):
                matched.append(col)

        return matched

    def score_chunk(self, chunk: dict[str, Any], keywords: list[str]) -> float:
        """
        Scores a single chunk based on how many matched keywords it contains.

        Each keyword found in the chunk's column metadata adds 1 point.
        Each keyword found in the chunk's text adds 0.5 points (less certain).

        Example:
            keywords = ["sales", "region"]
            chunk has columns ["region", "product", "sales", "date"]
            → both "sales" and "region" are in columns → score = 2
        """
        score = 0
        chunk_columns = [c.lower() for c in chunk.get("metadata", {}).get("columns", [])]
        chunk_text = chunk.get("text", "").lower()

        for keyword in keywords:
            keyword_lower = keyword.lower()
            # Strong signal — keyword is an actual column in this chunk
            if keyword_lower in chunk_columns:
                score += 1
            # Weaker signal — keyword just appears somewhere in the text
            elif keyword_lower in chunk_text:
                score += 0.5  # type: ignore

        return score

    def retrieve(
        self, question: str, chunks: list[dict[str, Any]], columns: list[str]
    ) -> list[dict[str, Any]]:
        """
        Main method — call this to get relevant chunks for a question.

        Arguments:
            question  → the user's natural language question
            chunks    → all chunks from the user's uploaded file
            columns   → column names from the user's CSV (from schema/session)

        Returns:
            A list of the top_k most relevant chunks, ranked by score.
            Each chunk includes its score so downstream code can use it.
        """
        if not chunks:
            return []

        # Step 1 — find which column names appear in the question
        keywords = self.extract_keywords(question, columns)

        # Step 2 — if no keywords matched, return the first top_k chunks as fallback
        # (better to return something than nothing)
        if not keywords:
            return chunks[: self.top_k]

        # Step 3 — score every chunk
        scored = []
        for chunk in chunks:
            score = self.score_chunk(chunk, keywords)
            if score > 0:
                scored.append({**chunk, "_score": score})

        # Step 4 — sort by score descending (highest relevance first)
        scored.sort(key=lambda x: x["_score"], reverse=True)

        # Step 5 — return only the top_k results
        return scored[: self.top_k]


# Shared instance — same pattern as session_store
keyword_retriever = KeywordRetriever(top_k=5)
