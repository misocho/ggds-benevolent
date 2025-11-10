#!/bin/bash
# Create initial database migration from models

set -e

echo "Creating initial migration from models..."

cd ggds-backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Backup old migrations
if [ -d "alembic/versions" ]; then
    echo "Backing up old migrations..."
    mkdir -p alembic/versions_old
    mv alembic/versions/*.py alembic/versions_old/ 2>/dev/null || true
fi

# Generate initial migration
echo "Generating initial migration from all models..."
alembic revision --autogenerate -m "initial schema"

echo "✓ Initial migration created!"
echo ""
echo "Next steps:"
echo "1. Review the generated migration in alembic/versions/"
echo "2. Commit and push"
echo "3. Deploy to server"
