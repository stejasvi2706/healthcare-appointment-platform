FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml README.md ./
COPY appointment_worker ./appointment_worker

RUN pip install --no-cache-dir .

CMD ["python", "-m", "appointment_worker.main"]
