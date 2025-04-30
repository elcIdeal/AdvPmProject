#!/bin/bash

echo "▶️ Starting backend..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
cd ..

echo "▶️ Starting frontend..."
cd frontend/src
npm run start
