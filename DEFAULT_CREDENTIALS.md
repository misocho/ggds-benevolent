# Default Login Credentials

After running `./deploy-manual.sh`, the database is automatically seeded with test users.

## 🔐 Superuser Account

**Email:** `admin@ggdi.net`
**Password:** `Admin@123`
**Role:** Administrator (full access)

Use this account to:
- Access admin dashboard
- Manage users and members
- Configure system settings
- Approve/reject cases

---

## 👤 Sample User Account

**Email:** `user@ggdi.net`
**Password:** `User@123`
**Role:** Regular user

Use this account to:
- Test member registration
- Submit cases
- View member dashboard

---

## 🔄 Customizing Passwords

You can customize the default passwords by setting environment variables before deployment:

```bash
export ADMIN_PASSWORD="YourSecureAdminPassword"
export USER_PASSWORD="YourSecureUserPassword"
./deploy-manual.sh
```

---

## ⚠️ Important Security Notes

1. **Change these passwords in production!**
2. These are default credentials for initial setup only
3. On first login, force users to change their passwords
4. Use strong, unique passwords for production deployments
5. Enable two-factor authentication (if implemented)

---

## 🔗 Login URL

After deployment, access the application at:

**Frontend:** http://167.172.112.115:3000
**Login Page:** http://167.172.112.115:3000/signin

---

## 📝 Testing Checklist

- [ ] Login with superuser account
- [ ] Access admin dashboard
- [ ] Create a new member
- [ ] Login with sample user account
- [ ] Submit a test case
- [ ] Verify email notifications (if configured)
- [ ] Test file uploads
- [ ] Check all dashboard features

---

**Last Updated:** 2025-11-08
