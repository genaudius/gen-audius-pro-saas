# Backend Dockerfile for Gen Audius Pro
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libmagic1 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements or just the code since we'll install manually for now 
# (Better to have a requirements.txt, but I'll generate one)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
