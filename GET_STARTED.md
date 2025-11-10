# 🚀 GGDS Pivot - Getting Started Guide

**Welcome to the GGDS Benevolent Fund Platform v2.0 Pivot!**

This guide will help you understand the pivot and get started with implementation.

---

## 📚 Essential Documents (Read First!)

### 1. **PROJECT_PLAN.md** - The Master Plan
- Complete overview of the new contribution platform
- User personas and workflows
- All development phases
- Timeline and deliverables
- **👉 Start here!**

### 2. **PIVOT_MIGRATION_GUIDE.md** - Step-by-Step Instructions
- Detailed migration steps
- Code examples for every change
- Database model updates
- Frontend restructuring guide
- **👉 Follow this for implementation!**

### 3. **tasks.json** - Task Tracker
- 42 detailed tasks across 6 phases
- Dependencies and priorities
- Estimated hours per task
- **👉 Track your progress here!**

---

## 🎯 Quick Summary: What's Changing?

### FROM (Old Model)
- Members self-register
- Crowdfunding for deprived members
- Open-ended fundraising

### TO (New Model)
- Admin creates member accounts
- Contribution tracking for bereaved members
- Fixed contribution amounts per case
- Immediate family only (parents, spouse, children - NO siblings)
- Probation for non-contributors
- Disbursement workflow

---

## 📝 The Story (User Flows)

### Flow 1: Admin Creates Member
1. Admin enters: first name, middle name, surname, email, phone
2. System generates: Member ID (GGDS-0001, GGDS-0002, etc.) + initial password
3. System emails member with credentials
4. Member logs in and completes immutable profile

### Flow 2: Member Files Case
1. John's mother passes away
2. John logs in → Files case (immediate family only: parents, spouse, children)
3. Admin reviews → Approves
4. System notifies all 120 members
5. System creates contribution records with deadlines

### Flow 3: Members Contribute
1. Jane receives email about John's case (mother passed)
2. Jane logs in → Sees Case 5 requires contribution
3. Jane contributes required amount
4. System tracks: 119 members to go
5. Deadline approaches → Reminders sent
6. Deadline passes → Non-contributors flagged for probation

### Flow 4: Disbursement
1. All contributions collected
2. Admin disburses funds to John
3. John confirms receipt
4. System notifies all members → Case closed

---

## 🏁 Phase 0: Where to Start (This Week)

### Day 1-2: Database Models
**Tasks 1-5 in tasks.json**

Priority order:
1. Update `Member` model (add member_id, profile fields)
2. Create `Contribution` model
3. Create `Probation` model
4. Update `Case` model (case_number, immediate family enum)
5. Generate Alembic migration

**Files to modify**:
- `ggds-backend/app/models/member.py`
- `ggds-backend/app/models/contribution.py` (new)
- `ggds-backend/app/models/probation.py` (new)
- `ggds-backend/app/models/case.py`

**How to execute**:
```bash
cd ggds-backend

# 1. Update model files (see PIVOT_MIGRATION_GUIDE.md for code)
# 2. Generate migration
alembic revision --autogenerate -m "Pivot v2.0: Add contribution tracking"

# 3. Review migration in alembic/versions/
# 4. Test migration locally
alembic upgrade head

# 5. Verify tables
# Check your database for new tables and columns
```

### Day 3-5: Frontend Restructure
**Tasks 6-8 in tasks.json**

1. **Comment out registration** (Task 6)
   - File: `app/register/page.js`
   - Add notice: "Contact admin for account creation"

2. **Simplify homepage** (Task 7)
   - File: `app/page.js`
   - Keep: Sign In, FAQ, About, Contact
   - Remove: Crowdfunding sections

3. **Move case filing** (Task 8)
   - Old: `app/report-case/page.js`
   - New: `app/dashboard/cases/file/page.js`
   - Update to immediate family dropdown

---

## 📊 Project Stats

- **Total Tasks**: 42
- **Estimated Hours**: 105 hours (~3 weeks full-time)
- **Phases**: 6 (Pivot Prep → Deployment)
- **Critical Tasks**: 14
- **High Priority**: 17

---

## 🗺️ 4-Week Roadmap

### Week 1: Foundation
- ✅ Database models updated
- ✅ Frontend restructured
- ✅ Admin member creation (backend + frontend)
- ✅ Profile completion flow

### Week 2: Core Features
- ✅ Case filing with immediate family only
- ✅ Case approval creates contributions
- ✅ Contribution tracking
- ✅ Probation system

### Week 3: Polish & Notifications
- ✅ Email templates
- ✅ Notification triggers
- ✅ Disbursement workflow
- ✅ End-to-end testing

### Week 4: Deploy
- ✅ Staging deployment
- ✅ User acceptance testing
- ✅ Production deployment
- ✅ Go live!

---

## 🎬 Next Actions (Right Now!)

### Option A: Start Database Work
```bash
# 1. Create a new branch
git checkout -b pivot-v2

# 2. Read the database section in PIVOT_MIGRATION_GUIDE.md
# Focus on: "Phase 0: Database Model Updates"

# 3. Start with Task 1: Update Member model
# File: ggds-backend/app/models/member.py
```

### Option B: Start Frontend Work
```bash
# 1. Read the frontend section in PIVOT_MIGRATION_GUIDE.md
# Focus on: "Phase 1: Frontend Restructuring"

# 2. Start with Task 6: Comment out registration
# File: ggds-benevolent-fund/app/register/page.js
```

### Option C: Review Everything First
1. Read PROJECT_PLAN.md (20 min)
2. Skim PIVOT_MIGRATION_GUIDE.md (15 min)
3. Review tasks.json (10 min)
4. Come back and choose Option A or B

---

## 🆘 Need Help?

### Got Questions About...

**The Plan?**
→ Check PROJECT_PLAN.md sections:
- "Project Objectives" (page 1)
- "User Personas & Flows" (page 2-3)
- "Data Models" (page 10)

**How to Implement?**
→ Check PIVOT_MIGRATION_GUIDE.md sections:
- "Phase 0: Database Model Updates" (page 2)
- "Phase 1: Frontend Restructuring" (page 4)
- Code examples throughout

**What to Do Next?**
→ Check tasks.json:
- "tasks" array - ordered by phase
- "phases" object - see what's current
- Look for "status": "pending" & "priority": "critical"

**Stuck on Code?**
→ PIVOT_MIGRATION_GUIDE.md has full code examples for:
- All model changes
- All API endpoints
- Frontend components
- Email templates

---

## ✅ Pre-Flight Checklist

Before you start coding:

- [ ] Read PROJECT_PLAN.md (overview)
- [ ] Read PIVOT_MIGRATION_GUIDE.md (implementation)
- [ ] Understand the 3 user flows (John, Admin, Jane)
- [ ] Know immediate family rule (parents/spouse/children ONLY - NO siblings)
- [ ] Create new git branch: `git checkout -b pivot-v2`
- [ ] Backup current code: `git commit -m "Pre-pivot backup"`

---

## 🎯 Success Criteria

You'll know you're done when:

### Phase 0 Complete
- [ ] All 4 models updated
- [ ] Migration generated and tested
- [ ] Registration page commented out
- [ ] Homepage simplified
- [ ] Case filing moved to dashboard

### Full Pivot Complete
- [ ] Admin can create members (auto-generated ID)
- [ ] Members receive welcome email
- [ ] Members complete immutable profile
- [ ] Members file cases (immediate family only)
- [ ] Admin approves → All members notified
- [ ] Members contribute with deadline tracking
- [ ] Non-contributors flagged for probation
- [ ] Admin disburses → Member confirms
- [ ] All members notified on completion
- [ ] Multi-case support working

---

## 💡 Pro Tips

1. **Don't delete code** - Comment it out with `// PIVOT v2.0: ...`
2. **Test migrations locally** - Always test before production
3. **One phase at a time** - Don't jump ahead
4. **Update tasks.json** - Mark tasks as "in_progress" / "done"
5. **Commit frequently** - Small commits, clear messages
6. **Read code examples** - PIVOT_MIGRATION_GUIDE.md has full code
7. **Ask questions early** - Better to clarify than redo

---

## 📞 Support

**Project Lead**: Richard Moturi
**Email**: admin@ggds.org
**Phone**: +1 (817) 673-8035

---

## 🚀 Ready to Start?

Pick your starting point:

**👉 Backend Developer?**
→ Start with Task 1 (Update Member model)
→ File: `ggds-backend/app/models/member.py`
→ Guide: PIVOT_MIGRATION_GUIDE.md → "Step 1: Update Member Model"

**👉 Frontend Developer?**
→ Start with Task 6 (Comment out registration)
→ File: `ggds-benevolent-fund/app/register/page.js`
→ Guide: PIVOT_MIGRATION_GUIDE.md → "Step 1: Comment Out Registration Page"

**👉 Full Stack?**
→ Start with Database (Tasks 1-5)
→ Then Frontend (Tasks 6-8)
→ Follow the phase order in tasks.json

---

**Let's build something great for the GGDS community! 💚**

*"Together, we support each other in times of loss"*
