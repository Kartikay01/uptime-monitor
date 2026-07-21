FROM python:3.11-slim

WORKDIR /app

# SQLite database file is written here; mount this as a volume in
# docker-compose for persistence across restarts.
RUN mkdir -p /app/data

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]