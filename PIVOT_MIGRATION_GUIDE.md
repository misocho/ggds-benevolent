# GGDS Pivot Migration Guide
## From Crowdfunding Platform to Contribution Tracking System

**Version**: 2.0
**Date**: 2025-10-23
**Status**: Active Migration

---

## 🎯 Overview

This guide outlines the step-by-step process for pivoting the GGDS Benevolent Fund from a crowdfunding platform to a contribution tracking and disbursement system.

### Migration Principles
1. ✅ **PRESERVE** - Comment out, don't delete
2. ✅ **REUSE** - Leverage existing components
3. ✅ **TEST** - Verify each step before proceeding
4. ✅ **BACKUP** - Always backup before major changes

---

## 📋 Pre-Migration Checklist

- [ ] Backup entire codebase (`git commit -m "Pre-pivot backup"`)
- [ ] Backup database (if exists)
- [ ] Create new branch: `git checkout -b pivot-v2`
- [ ] Read PROJECT_PLAN.md v2.0 thoroughly
- [ ] Review this entire guide
- [ ] Set up local development environment

---

## 🗂️ Phase 0: Database Model Updates

### Step 1: Update Member Model

**File**: `ggds-backend/app/models/member.py`

**Changes Needed**:
```python
# ADD these new fields to Member model:
member_id = Column(String(20), unique=True, nullable=False)  # Format: GGDS-0001
profile_completed = Column(Boolean, default=False)
profile_data = Column(JSON, nullable=True)  # Immutable after completion
on_probation = Column(Boolean, default=False)
is_first_login = Column(Boolean, default=True)

# KEEP existing fields:
# first_name, middle_name, surname, email, phone, etc.
```

**Migration Script**:
```bash
alembic revision -m "Add member_id and profile fields to Member"
```

### Step 2: Create Contribution Model

**File**: `ggds-backend/app/models/contribution.py` (NEW FILE)

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class ContributionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    amount = Column(Float, nullable=False)
    contribution_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=False)
    status = Column(Enum(ContributionStatus), default=ContributionStatus.PENDING)
    payment_reference = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)

    # Relationships
    case = relationship("Case", back_populates="contributions")
    member = relationship("Member", back_populates="contributions")
```

### Step 3: Create Probation Model

**File**: `ggds-backend/app/models/probation.py` (NEW FILE)

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Probation(Base):
    __tablename__ = "probations"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    reason = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False)

    # Relationships
    member = relationship("Member", back_populates="probations")
    case = relationship("Case", back_populates="probations")
```

### Step 4: Update Case Model

**File**: `ggds-backend/app/models/case.py`

**Changes Needed**:
```python
import enum

class RelationshipType(str, enum.Enum):
    MOTHER = "mother"
    FATHER = "father"
    SPOUSE = "spouse"
    SON = "son"
    DAUGHTER = "daughter"

class CaseStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"
    COMPLETED = "completed"

# ADD these new fields to Case model:
case_number = Column(Integer, unique=True, nullable=False)  # Auto-increment
relationship = Column(Enum(RelationshipType), nullable=False)  # Immediate family only
total_amount_required = Column(Float, nullable=False)
total_amount_collected = Column(Float, default=0.0)
disbursement_date = Column(DateTime, nullable=True)
confirmed_receipt = Column(Boolean, default=False)
verification_notes = Column(Text, nullable=True)  # Admin only

# UPDATE status field:
status = Column(Enum(CaseStatus), default=CaseStatus.PENDING)

# ADD relationships:
contributions = relationship("Contribution", back_populates="case")
probations = relationship("Probation", back_populates="case")
```

### Step 5: Create Database Migrations

```bash
# Navigate to backend
cd ggds-backend

# Generate migration
alembic revision --autogenerate -m "Pivot v2.0: Add contribution and probation models"

# Review the migration file in alembic/versions/
# Make manual adjustments if needed

# Apply migration
alembic upgrade head

# Verify tables created
# Use psql or database GUI to check
```

---

## 🎨 Phase 1: Frontend Restructuring

### Step 1: Comment Out Registration Page

**File**: `ggds-benevolent-fund/app/register/page.js`

**Action**:
```javascript
// PIVOT v2.0: Self-registration removed - Admin creates accounts
// This page is preserved for potential future use
// Commented out on: 2025-10-23

/*
export default function RegisterPage() {
  // ... existing code ...
}
*/

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Registration Temporarily Unavailable
        </h1>
        <p className="text-gray-600 mb-6">
          New member accounts are now created by administrators.
          Please contact admin@ggds.org for assistance.
        </p>
        <a href="/signin" className="text-primary-500 hover:text-primary-600 font-medium">
          Go to Sign In
        </a>
      </div>
    </div>
  );
}
```

### Step 2: Update Navigation/Links

**Files to Update**:
- `ggds-benevolent-fund/components/Header.js`
- `ggds-benevolent-fund/app/page.js`

**Action**: Remove/comment out registration links

**Before**:
```javascript
<Link href="/register">Register</Link>
```

**After**:
```javascript
{/* PIVOT v2.0: Registration link removed */}
{/* <Link href="/register">Register</Link> */}
```

### Step 3: Simplify Homepage

**File**: `ggds-benevolent-fund/app/page.js`

**Keep Only**:
- Hero section with platform description
- Sign In button (prominent)
- FAQ section
- About Us section
- Contact Us section

**Remove/Comment Out**:
- Crowdfunding appeals
- Member stories (if any)
- Donation prompts
- Registration CTAs

```javascript
// PIVOT v2.0: Homepage simplified
export default function HomePage() {
  return (
    <>
      <HeroSection />        {/* ✅ Keep - update messaging */}
      <SignInCTA />          {/* ✅ Keep */}
      <FAQSection />         {/* ✅ Keep */}
      <AboutSection />       {/* ✅ Keep */}
      <ContactSection />     {/* ✅ Keep */}

      {/* PIVOT v2.0: Removed crowdfunding sections */}
      {/* <FundraisingAppeals /> */}
      {/* <MemberStories /> */}
      {/* <DonateNowSection /> */}
    </>
  );
}
```

### Step 4: Move Report Case to Dashboard

**Old Location**: `ggds-benevolent-fund/app/report-case/page.js`
**New Location**: `ggds-benevolent-fund/app/dashboard/cases/file/page.js`

**Actions**:
1. Create new directory: `app/dashboard/cases/file/`
2. Copy `report-case/page.js` to new location
3. Comment out old file with redirect:

```javascript
// PIVOT v2.0: Case filing moved to dashboard
// File: app/report-case/page.js

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportCasePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/cases/file');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
```

4. Update case filing form to limit to immediate family:

```javascript
// In dashboard/cases/file/page.js
const IMMEDIATE_FAMILY = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
];

// Replace relationship field with dropdown
<select name="relationship" required>
  {IMMEDIATE_FAMILY.map(rel => (
    <option key={rel.value} value={rel.value}>
      {rel.label}
    </option>
  ))}
</select>
```

---

## 🔧 Phase 2: Backend API Development

### Step 1: Create Admin Member Creation Endpoint

**File**: `ggds-backend/app/routers/admin.py`

```python
from app.services.member_service import create_member_by_admin
from app.services.notification_service import send_welcome_email

@router.post("/members/create")
async def create_new_member(
    member_data: AdminCreateMemberRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Generate member ID
    last_member = db.query(Member).order_by(Member.id.desc()).first()
    member_number = (last_member.id + 1) if last_member else 1
    member_id = f"GGDS-{member_number:04d}"  # GGDS-0001, GGDS-0002, etc.

    # Generate initial password
    initial_password = generate_random_password()

    # Create user and member
    member = await create_member_by_admin(
        db=db,
        member_id=member_id,
        first_name=member_data.first_name,
        middle_name=member_data.middle_name,
        surname=member_data.surname,
        email=member_data.email,
        phone=member_data.phone,
        initial_password=initial_password
    )

    # Send welcome email with credentials
    await send_welcome_email(
        email=member.email,
        member_id=member_id,
        initial_password=initial_password
    )

    return {
        "message": "Member created successfully",
        "member_id": member_id,
        "email_sent": True
    }
```

### Step 2: Create Profile Completion Endpoint

**File**: `ggds-backend/app/routers/members.py`

```python
@router.post("/profile/complete")
async def complete_profile(
    profile_data: ProfileCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if member.profile_completed:
        raise HTTPException(
            status_code=400,
            detail="Profile already completed and cannot be modified"
        )

    # Save profile data
    member.profile_data = profile_data.dict()
    member.profile_completed = True
    member.is_first_login = False

    db.commit()
    db.refresh(member)

    return {"message": "Profile completed successfully", "profile_immutable": True}
```

### Step 3: Create Contribution Endpoints

**File**: `ggds-backend/app/routers/contributions.py` (NEW FILE)

```python
from fastapi import APIRouter, Depends, HTTPException
from app.services.contribution_service import create_contribution, get_contributions_by_case

router = APIRouter(prefix="/api/contributions", tags=["contributions"])

@router.post("/")
async def make_contribution(
    contribution_data: ContributionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create contribution
    contribution = await create_contribution(
        db=db,
        case_id=contribution_data.case_id,
        member_id=current_user.member.id,
        amount=contribution_data.amount,
        payment_reference=contribution_data.payment_reference
    )

    # Check if case is fully funded
    case = db.query(Case).filter(Case.id == contribution_data.case_id).first()
    case.total_amount_collected += contribution_data.amount

    if case.total_amount_collected >= case.total_amount_required:
        # Notify admin
        await notify_admin_case_fully_funded(case.id)

    db.commit()

    return {"message": "Contribution recorded", "contribution_id": contribution.id}

@router.get("/by-case/{case_id}")
async def get_case_contributions(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # Admin only
):
    contributions = get_contributions_by_case(db, case_id)
    return {"contributions": contributions, "total": len(contributions)}
```

### Step 4: Update Case Approval Endpoint

**File**: `ggds-backend/app/routers/cases.py`

```python
@router.patch("/{case_id}/status")
async def update_case_status(
    case_id: int,
    status_update: CaseStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.status = status_update.status
    case.verification_notes = status_update.notes

    # If approved, create contribution records for all members
    if status_update.status == "approved":
        await create_contributions_for_all_members(db, case)
        await notify_all_members_case_approved(case)

    db.commit()

    return {"message": f"Case {case.case_number} status updated to {status_update.status}"}

async def create_contributions_for_all_members(db: Session, case: Case):
    """Create contribution records for all active members"""
    all_members = db.query(Member).filter(Member.is_active == True).all()
    contribution_deadline = datetime.now() + timedelta(days=7)  # 7 day deadline

    for member in all_members:
        if member.id != case.member_id:  # Don't create for case filer
            contribution = Contribution(
                case_id=case.id,
                member_id=member.id,
                amount=case.total_amount_required / len(all_members),  # Equal split
                deadline=contribution_deadline,
                status="pending",
                created_at=datetime.now()
            )
            db.add(contribution)

    db.commit()
```

---

## 📧 Phase 3: Notification System

### Email Templates Needed

1. **Welcome Email** (New Member)
   - Subject: "Welcome to GGDS Benevolent Fund"
   - Content: Member ID, initial password, instructions

2. **Case Approved** (All Members)
   - Subject: "New Case Approved - Contribution Required"
   - Content: Case details, contribution amount, deadline

3. **Contribution Received** (Contributing Member)
   - Subject: "Your Contribution Has Been Recorded"
   - Content: Case number, amount, thank you

4. **Probation Warning** (Member)
   - Subject: "Contribution Deadline Approaching"
   - Content: Pending contributions, consequences

5. **Disbursement Notification** (Case Filer)
   - Subject: "Funds Disbursed for Your Case"
   - Content: Amount, instructions to confirm

6. **Case Completed** (All Members)
   - Subject: "Case Completed - Thank You"
   - Content: Case summary, confirmation

**File**: `ggds-backend/app/services/notification_service.py` (UPDATE)

```python
import resend
from app.config import settings

async def send_welcome_email(email: str, member_id: str, initial_password: str):
    resend.api_key = settings.RESEND_API_KEY

    html_content = f"""
    <h2>Welcome to GGDS Benevolent Fund</h2>
    <p>Your account has been created by the administrator.</p>
    <p><strong>Member ID:</strong> {member_id}</p>
    <p><strong>Initial Password:</strong> {initial_password}</p>
    <p>Please log in and complete your profile at: {settings.FRONTEND_URL}/signin</p>
    <p><strong>Important:</strong> Your profile information is permanent once submitted.</p>
    """

    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": email,
        "subject": "Welcome to GGDS Benevolent Fund",
        "html": html_content
    })

async def notify_all_members_case_approved(case: Case):
    # Get all active members
    members = db.query(Member).filter(Member.is_active == True).all()

    for member in members:
        await send_case_approval_email(member.email, case)
```

---

## 🧪 Phase 4: Testing Checklist

### Unit Tests

- [ ] Test member ID generation (sequential, unique)
- [ ] Test initial password generation (secure)
- [ ] Test profile completion (immutability)
- [ ] Test case approval creates contributions
- [ ] Test contribution deadline calculations
- [ ] Test probation flagging logic
- [ ] Test disbursement workflow
- [ ] Test email sending (all types)

### Integration Tests

- [ ] Admin creates member → Email sent → Member logs in
- [ ] Member completes profile → Cannot edit again
- [ ] Member files case → Admin sees pending
- [ ] Admin approves → All members notified → Contributions created
- [ ] Member contributes → Balance updated
- [ ] Deadline passes → Non-contributors flagged
- [ ] Admin disburses → Member confirms → All notified

### Manual Testing

- [ ] Create 3 test members via admin
- [ ] Have 1 member file a case
- [ ] Approve the case
- [ ] Have 2 members contribute
- [ ] Let deadline pass for 1 member
- [ ] Verify probation flag
- [ ] Disburse funds
- [ ] Confirm receipt
- [ ] Verify all emails sent

---

## 🚀 Phase 5: Deployment

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Database migrations ready
- [ ] Email service configured (Resend API key)
- [ ] Environment variables set

### Deployment Steps

```bash
# 1. Backup production database (if exists)
# Use Render dashboard or pg_dump

# 2. Deploy backend
git push origin pivot-v2
# Render auto-deploys on push (if configured)

# 3. Run migrations
# In Render console:
alembic upgrade head

# 4. Create admin account
python scripts/create_admin.py

# 5. Deploy frontend
cd ggds-benevolent-fund
npm run build
vercel --prod

# 6. Verify deployment
# - Check all endpoints
# - Test email sending
# - Test member creation
# - Test case workflow
```

### Post-Deployment

- [ ] Smoke test all critical flows
- [ ] Monitor error logs
- [ ] Test email delivery
- [ ] Create first real member account
- [ ] Send announcement to GGDS members

---

## 📊 Migration Progress Tracking

### Week 1: Database & Backend
- [ ] Day 1: Database models updated
- [ ] Day 2: Migrations created and tested
- [ ] Day 3: Admin member creation endpoint
- [ ] Day 4: Profile completion endpoint
- [ ] Day 5: Case approval updates
- [ ] Day 6: Contribution endpoints
- [ ] Day 7: Testing

### Week 2: Frontend & Integration
- [ ] Day 1: Comment out registration
- [ ] Day 2: Simplify homepage
- [ ] Day 3: Admin UI for member creation
- [ ] Day 4: Profile completion UI
- [ ] Day 5: Contribution UI
- [ ] Day 6: Testing
- [ ] Day 7: Integration testing

### Week 3: Notifications & Polish
- [ ] Day 1-2: Email templates
- [ ] Day 3-4: Notification triggers
- [ ] Day 5: End-to-end testing
- [ ] Day 6-7: Bug fixes

### Week 4: Deployment
- [ ] Day 1-2: Staging deployment
- [ ] Day 3-4: UAT
- [ ] Day 5-6: Production deployment
- [ ] Day 7: Monitoring & support

---

## ⚠️ Common Pitfalls & Solutions

### Problem: Member ID Conflicts
**Solution**: Use database sequence for auto-increment

### Problem: Profile Edited After Completion
**Solution**: Add `profile_completed` check in update endpoint

### Problem: Contribution Deadlines Not Calculated
**Solution**: Create contributions immediately on case approval

### Problem: Emails Not Sending
**Solution**: Check Resend API key, verify email templates

### Problem: Case Numbers Not Unique
**Solution**: Use database sequence with SERIAL type

---

## 📞 Support During Migration

**Questions?** Contact:
- Email: admin@ggds.org
- Phone: +1 (817) 673-8035

**Documentation**:
- PROJECT_PLAN.md v2.0
- This migration guide
- API documentation: `/docs` endpoint

---

## ✅ Final Checklist

Before declaring migration complete:

- [ ] All database models updated and migrated
- [ ] All backend endpoints implemented and tested
- [ ] All frontend pages updated/commented
- [ ] Email system working
- [ ] Admin can create members
- [ ] Members can complete profiles (immutable)
- [ ] Members can file cases
- [ ] Admin can approve/reject
- [ ] Contributions tracked
- [ ] Probation system working
- [ ] Disbursement workflow complete
- [ ] All notifications sending
- [ ] Production deployed
- [ ] Admin account created
- [ ] User documentation updated
- [ ] GGDS members notified

---

**Migration Guide Version**: 1.0
**Last Updated**: 2025-10-23
**Status**: Active

**Happy Migrating! 🚀**
