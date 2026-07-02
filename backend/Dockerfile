# ---------- Stage 1: builder ----------
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
  libgomp1 \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ---------- Stage 2: runtime ----------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH=/home/appuser/.local/bin:$PATH

# libgomp1 is needed at runtime (FAISS uses it); build-essential is not
RUN apt-get update && apt-get install -y \
  libgomp1 \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser
WORKDIR /app

COPY --from=builder /root/.local /home/appuser/.local
COPY . .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]