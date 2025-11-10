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
from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def seed_database():
    db = SessionLocal()
    try:
        # Check if superuser already exists
        existing_admin = db.query(User).filter(
            User.email == 'lifeline@ggdi.net'
        ).first()

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
            db.add(superuser)
            db.commit()
            print('✓ Created superuser: lifeline@ggdi.net')

        print('')
        print('✓ Database seeded successfully!')
        print('')
        print('Login Credentials:')
        print('==================')
        print('Email: lifeline@ggdi.net')
        print('Password: adminggds')

    except Exception as e:
        print(f'❌ Error seeding database: {str(e)}')
        db.rollback()
        raise
    finally:
        db.close()

seed_database()
"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Database Seeded!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
