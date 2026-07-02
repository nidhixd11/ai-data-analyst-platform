from __future__ import annotations

import faiss
import numpy as np


class FaissIndex:
    """FAISS vector index wrapper."""

    def __init__(self, dimension: int = 768) -> None:
        self.index = faiss.IndexFlatL2(dimension)

    def add(self, embeddings: list[list[float]]) -> None:
        vectors = np.array(embeddings, dtype="float32")
        self.index.add(vectors)

    def search(
        self,
        query_embedding: list[float],
        k: int = 5,
    ) -> list[int]:
        query = np.array([query_embedding], dtype="float32")

        distances, indices = self.index.search(query, k)

        return indices[0].tolist()
