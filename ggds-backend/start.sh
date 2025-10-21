#!/bin/bash

# GGDS Backend - Quick Start Script

echo "🚀 Starting GGDS Benevolent Fund Backend..."

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found! Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update DATABASE_URL and SECRET_KEY in .env"
    exit 1
fi

# Start the server
echo "📡 Starting FastAPI server on http://localhost:8000"
echo "📚 API Docs will be available at http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
