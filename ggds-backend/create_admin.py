#!/usr/bin/env python3
"""Create an admin user for GGDS Benevolent Fund"""

from app.database import SessionLocal
from app.models import User
from app.models.user import UserRole
from app.utils.security import get_password_hash
import uuid

def create_admin_user():
    db = SessionLocal()

    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == 'admin@ggds.com').first()

        if admin:
            print('⚠️  Admin user already exists!')
            print(f'Email: admin@ggds.com')
            print(f'Role: {admin.role}')
        else:
            # Create admin user
            admin_user = User(
                id=uuid.uuid4(),
                email='admin@ggds.com',
                hashed_password=get_password_hash('Admin123!'),
                role=UserRole.ADMIN,
                is_active=True
            )

            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            print('✅ Admin user created successfully!')
            print(f'Email: admin@ggds.com')
            print(f'Password: Admin123!')
            print(f'Role: {admin_user.role}')
            print(f'User ID: {admin_user.id}')
    finally:
        db.close()

if __name__ == '__main__':
    create_admin_user()
