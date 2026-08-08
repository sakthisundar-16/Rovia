FROM python:3.12-slim

# Install system dependencies (WeasyPrint requires some specific libraries)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Command will be overridden by docker-compose for dev, but good default for prod
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
