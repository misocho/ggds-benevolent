# Default Login Credentials

After running `./deploy-manual.sh`, the database is automatically seeded with a superuser account.

## 🔐 Superuser Account

**Email:** `lifeline@ggdi.net`
**Password:** `adminggds`
**Role:** Administrator (full access)

Use this account to:
- Access admin dashboard
- Manage users and members
- Configure system settings
- Approve/reject cases
- Create additional users

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

- [ ] Login with superuser account (lifeline@ggdi.net)
- [ ] Access admin dashboard
- [ ] Create a new member
- [ ] Create additional user accounts
- [ ] Submit a test case
- [ ] Verify email notifications (SMTP configured)
- [ ] Test file uploads (Digital Ocean Spaces)
- [ ] Check all dashboard features

---

**Last Updated:** 2025-11-08
