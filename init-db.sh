#!/bin/bash
# ============================================
# Initialize Database - Create All Tables
# ============================================
# Run this script to create all database tables
# from SQLAlchemy models (bypasses migrations)
#

set -e

echo "Creating database tables from models..."

# Run Python script to create all tables
docker-compose exec -T backend python -c "
from app.database import Base, engine
from app.models import *

# Create all tables
Base.metadata.create_all(bind=engine)
print('✓ All tables created successfully!')
"

echo "✓ Database initialized!"
echo ""
echo "Now you can run the application without migration errors."
