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
from app.models.user import User, UserRole
from app.utils.security import get_password_hash

def seed_database():
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(
            User.email == 'lifeline@ggdi.net'
        ).first()

        if existing_admin:
            print('ℹ Admin user lifeline@ggdi.net already exists')
        else:
            # Create admin user
            admin_user = User(
                email='lifeline@ggdi.net',
                hashed_password=get_password_hash('adminggds'),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print('✓ Created admin user: lifeline@ggdi.net')

        print('')
        print('✓ Database seeded successfully!')
        print('')
        print('Login Credentials:')
        print('==================')
        print('Email: lifeline@ggdi.net')
        print('Password: adminggds')
        print('Role: ADMIN')

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
