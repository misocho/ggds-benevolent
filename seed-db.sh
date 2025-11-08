#!/bin/bash
# ============================================
# Seed Database - Create Superuser & Sample Data
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - Database Seeding${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}→${NC} Creating superuser..."

# Run Python script to seed database
docker-compose exec -T backend python -c "
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.user import User
from app.utils.security import get_password_hash
from sqlalchemy import select

async def seed_database():
    async with async_session_maker() as session:
        try:
            # Check if superuser already exists
            result = await session.execute(
                select(User).where(User.email == 'lifeline@ggdi.net')
            )
            existing_admin = result.scalar_one_or_none()

            if existing_admin:
                print('ℹ Superuser lifeline@ggdi.net already exists')
            else:
                # Create superuser
                superuser = User(
                    email='lifeline@ggdi.net',
                    username='lifeline',
                    full_name='GGDS Lifeline',
                    hashed_password=get_password_hash('adminggds'),
                    is_active=True,
                    is_superuser=True,
                    is_verified=True
                )
                session.add(superuser)
                print('✓ Created superuser: lifeline@ggdi.net')

            await session.commit()
            print('')
            print('✓ Database seeded successfully!')
            print('')
            print('Login Credentials:')
            print('==================')
            print('Email: lifeline@ggdi.net')
            print('Password: adminggds')

        except Exception as e:
            print(f'❌ Error seeding database: {str(e)}')
            await session.rollback()
            raise

asyncio.run(seed_database())
"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Database Seeded!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
