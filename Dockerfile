FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

WORKDIR /app
COPY backend/ ./backend/

EXPOSE 8000

CMD ["python", "backend/main.py"] 