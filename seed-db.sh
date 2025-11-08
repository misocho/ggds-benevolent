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

# Default passwords (change these in production!)
ADMIN_PASS="${ADMIN_PASSWORD:-Admin@123}"
USER_PASS="${USER_PASSWORD:-User@123}"

echo -e "${YELLOW}→${NC} Creating superuser and sample data..."

# Run Python script to seed database
docker-compose exec -T backend python -c "
import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.user import User
from app.utils.security import get_password_hash
from sqlalchemy import select

async def seed_database():
    # Get passwords from environment or use defaults
    admin_pass = os.getenv('ADMIN_PASSWORD', 'Admin' + '@' + '123')
    user_pass = os.getenv('USER_PASSWORD', 'User' + '@' + '123')

    async with async_session_maker() as session:
        try:
            # Check if superuser already exists
            result = await session.execute(
                select(User).where(User.email == 'admin@ggdi.net')
            )
            existing_admin = result.scalar_one_or_none()

            if existing_admin:
                print('ℹ Superuser admin@ggdi.net already exists')
            else:
                # Create superuser
                superuser = User(
                    email='admin@ggdi.net',
                    username='admin',
                    full_name='GGDS Administrator',
                    hashed_password=get_password_hash(admin_pass),
                    is_active=True,
                    is_superuser=True,
                    is_verified=True
                )
                session.add(superuser)
                print(f'✓ Created superuser: admin@ggdi.net')

            # Check if sample user exists
            result = await session.execute(
                select(User).where(User.email == 'user@ggdi.net')
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                print('ℹ Sample user user@ggdi.net already exists')
            else:
                # Create sample regular user
                sample_user = User(
                    email='user@ggdi.net',
                    username='sampleuser',
                    full_name='Sample User',
                    hashed_password=get_password_hash(user_pass),
                    is_active=True,
                    is_superuser=False,
                    is_verified=True
                )
                session.add(sample_user)
                print(f'✓ Created sample user: user@ggdi.net')

            await session.commit()
            print('')
            print('✓ Database seeded successfully!')
            print('')
            print('Default Login Credentials:')
            print('==========================')
            print('Superuser:')
            print('  Email: admin@ggdi.net')
            print('  Password: (default or ADMIN_PASSWORD env var)')
            print('')
            print('Sample User:')
            print('  Email: user@ggdi.net')
            print('  Password: (default or USER_PASSWORD env var)')

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
