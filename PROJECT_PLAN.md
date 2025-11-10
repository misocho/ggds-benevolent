# GGDS Benevolent Fund - Project Plan (PIVOT v2.0)

## 📋 Project Overview

**Project Name**: GGDS Benevolent Fund - Contribution Platform
**Organization**: Grand Granite Diaspora Sacco (GGDS)
**Purpose**: Facilitate member contributions when a fellow member loses an immediate family member
**Status**: Pivot in Progress - Restructuring from Crowdfunding to Contribution Model
**Members**: ~120 active Sacco members

## 🔄 PIVOT SUMMARY

**Previous Model**: Crowdfunding platform for deprived members
**New Model**: Bereavement contribution tracking and disbursement platform

### Key Changes
- ❌ Self-registration removed → Admin-only account creation
- ✅ Case-based contribution system (Case 1, Case 2, etc.)
- ✅ Member contribution tracking with deadlines
- ✅ Probation flagging for non-contributors
- ✅ Fund disbursement and confirmation workflow
- ⚠️ Immediate family only (no extended family)

## 🎯 Project Objectives

1. **Admin-Managed Member Onboarding** - Admin creates accounts; members complete immutable profiles
2. **Case Filing System** - Members report immediate family bereavement (parents, spouse, children)
3. **Case Verification & Approval** - Admin reviews and approves/rejects cases
4. **Contribution Tracking** - Track all 120 members' contributions per case with deadlines
5. **Probation Management** - Flag members who miss contribution deadlines
6. **Fund Disbursement** - Admin disburses funds; member confirms receipt
7. **Multi-Case Support** - Handle multiple simultaneous cases (Case 1, Case 2, etc.)
8. **Member Dashboard** - View cases, make contributions, check status

## 🏗️ System Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Components**: Headless UI, Heroicons
- **Notifications**: React Hot Toast

#### Backend
- **Framework**: FastAPI 0.115
- **Runtime**: Python 3.10+
- **Database**: PostgreSQL 14+ with SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **Email**: Resend API
- **File Storage**: AWS S3 (via boto3)
- **Migrations**: Alembic

#### Infrastructure
- **Frontend Hosting**: Vercel / Render
- **Backend Hosting**: Render
- **Database**: Render PostgreSQL
- **File Storage**: AWS S3
- **Domain**: Custom domain (TBD)

## 👥 User Personas & Flows

### Persona 1: John (Member)
**Scenario**: John's mother passes away

1. **Login**: Uses Member ID + Password (provided by admin)
2. **File Case**: Reports bereavement (Case 5 - John's mother)
3. **Wait**: Admin verifies the claim
4. **Notification**: Receives approval notification
5. **Contribute**: Makes required contribution to other active cases
6. **Receive**: Gets funds disbursed by admin
7. **Confirm**: Confirms receipt of funds
8. **Done**: All members notified of completion

### Persona 2: Admin
**Scenario**: Managing the platform

1. **Create Account**: Enters new member's basic info (name, email, phone)
2. **System Generates**: Member ID + initial password → Email sent
3. **Review Cases**: Views pending case from John
4. **Verify**: Uses own methods to verify claim
5. **Approve/Reject**: Approves Case 5
6. **Notify Members**: System notifies all 120 members
7. **Track Contributions**: Monitors who has/hasn't contributed
8. **Flag Probation**: System flags non-contributors
9. **Disburse**: Sends funds to John
10. **Confirm**: Waits for John's confirmation
11. **Close**: Case marked complete, all notified

### Persona 3: Jane (Contributing Member)
**Scenario**: Receives notification about John's case

1. **Notification**: Email about Case 5 (John's mother)
2. **Login**: Checks dashboard
3. **View Cases**: Sees Case 5, Case 3, Case 7 (active)
4. **Select Case**: Chooses Case 5
5. **Contribute**: Makes required contribution
6. **Confirm**: Receives confirmation
7. **Deadline Met**: No probation flag

## 📁 Project Structure (Updated)

```
ggds/
├── ggds-benevolent-fund/          # Next.js Frontend
│   ├── app/
│   │   ├── page.js                # ✅ Home (Sign in, FAQ, About, Contact)
│   │   ├── signin/                # ✅ Sign in portal
│   │   ├── dashboard/             # ✅ Member dashboard
│   │   │   ├── profile/           # ✅ Complete/view profile (immutable)
│   │   │   ├── cases/             # ✅ File case, view cases
│   │   │   └── contributions/     # ✅ Make contributions
│   │   ├── admin/                 # ✅ Admin portal
│   │   │   ├── members/           # ✅ Create members, view all
│   │   │   ├── cases/             # ✅ Review, approve, disburse
│   │   │   ├── contributions/     # ✅ Track contributions
│   │   │   └── probation/         # ✅ Manage probation
│   │   ├── register/              # ⚠️ COMMENT OUT (not deleted)
│   │   └── report-case/           # ⚠️ MOVED to dashboard/cases/file
│   ├── components/                # Reusable components
│   └── package.json
│
├── ggds-backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── member.py          # Updated schema
│   │   │   ├── case.py            # Updated schema
│   │   │   ├── contribution.py    # NEW
│   │   │   └── probation.py       # NEW
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── members.py
│   │   │   ├── cases.py
│   │   │   ├── contributions.py   # NEW
│   │   │   ├── admin.py
│   │   │   └── notifications.py   # NEW
│   │   └── services/
│   │       ├── member_service.py
│   │       ├── case_service.py
│   │       ├── contribution_service.py  # NEW
│   │       ├── notification_service.py  # NEW
│   │       └── probation_service.py     # NEW
│   └── requirements.txt
│
├── PROJECT_PLAN.md                # This file
├── PIVOT_MIGRATION_GUIDE.md       # Migration instructions (to be created)
└── tasks.json                     # Updated task breakdown
```

## 🚀 Development Phases (UPDATED)

### Phase 0: Pivot Preparation 🔄 IN PROGRESS
**Status**: In Progress
**Priority**: CRITICAL
**Timeline**: 2-3 days

**Tasks**:
- [x] Update PROJECT_PLAN.md with new vision
- [ ] Create PIVOT_MIGRATION_GUIDE.md
- [ ] Update database models for new flow
  - [ ] Update Case model (immediate family only, case numbers)
  - [ ] Create Contribution model
  - [ ] Create Probation model
  - [ ] Update Member model (add member_id field)
- [ ] Comment out unused frontend pages
  - [ ] Comment out /register page
  - [ ] Move /report-case to /dashboard/cases/file
  - [ ] Simplify homepage (keep FAQ, About, Contact, Sign in)
- [ ] Update tasks.json with new priorities
- [ ] Create database migration scripts

### Phase 1: Admin Member Management 📅 NEXT
**Status**: Not Started
**Priority**: HIGH
**Timeline**: 1 week

**Tasks**:
- [ ] Backend: Admin member creation endpoint
  - [ ] POST /api/admin/members/create
  - [ ] Auto-generate Member ID (format: GGDS-XXXX)
  - [ ] Auto-generate initial password
  - [ ] Send email with credentials
- [ ] Frontend: Admin member creation UI
  - [ ] Form for basic info (name, email, phone)
  - [ ] Member list view
  - [ ] Member search/filter
- [ ] Member profile completion flow
  - [ ] First-login detection
  - [ ] Profile completion form (rest of registration data)
  - [ ] Confirmation step before submission
  - [ ] Make profile immutable after submission

### Phase 2: Case Filing & Approval 📅 PENDING
**Status**: Not Started
**Priority**: HIGH
**Timeline**: 1 week

**Tasks**:
- [ ] Backend: Case filing endpoints
  - [ ] POST /api/cases (immediate family only: parents, spouse, children)
  - [ ] GET /api/cases (with case numbers)
  - [ ] PATCH /api/cases/{id}/status
- [ ] Frontend: Member case filing
  - [ ] File case form (immediate family dropdown: mother, father, spouse, son, daughter)
  - [ ] View filed cases
- [ ] Admin case review
  - [ ] Pending cases queue
  - [ ] Case approval/rejection
  - [ ] Verification notes

### Phase 3: Contribution System 📅 PENDING
**Status**: Not Started
**Priority**: HIGH
**Timeline**: 1.5 weeks

**Tasks**:
- [ ] Backend: Contribution tracking
  - [ ] POST /api/contributions
  - [ ] GET /api/contributions/by-case/{case_id}
  - [ ] GET /api/contributions/by-member/{member_id}
  - [ ] Calculate contribution deadlines
- [ ] Frontend: Contribution interface
  - [ ] View active cases requiring contribution
  - [ ] Select case and contribute
  - [ ] View contribution history
- [ ] Probation system
  - [ ] Auto-flag members missing deadlines
  - [ ] Probation status tracking
  - [ ] Admin probation management

### Phase 4: Disbursement & Notifications 📅 PENDING
**Status**: Not Started
**Priority**: HIGH
**Timeline**: 1 week

**Tasks**:
- [ ] Backend: Disbursement workflow
  - [ ] POST /api/cases/{id}/disburse
  - [ ] POST /api/cases/{id}/confirm-receipt
  - [ ] Case completion logic
- [ ] Notification system
  - [ ] Email on case approval (to all members)
  - [ ] Email on contribution received
  - [ ] Email on disbursement
  - [ ] Email on case completion
  - [ ] Probation warning emails
- [ ] Frontend: Disbursement UI
  - [ ] Admin disbursement button
  - [ ] Member confirmation button
  - [ ] Notification center

### Phase 5: Testing & Quality Assurance 📅 PENDING
**Status**: Not Started
**Priority**: HIGH
**Timeline**: 1 week

**Tasks**:
- [ ] End-to-end flow testing
  - [ ] Admin creates member → Member completes profile
  - [ ] Member files case → Admin approves
  - [ ] Members contribute → Track deadlines
  - [ ] Admin disburses → Member confirms
- [ ] Multi-case scenario testing
- [ ] Probation logic testing
- [ ] Email delivery testing
- [ ] Security testing

### Phase 6: Deployment to Production 📅 PENDING
**Status**: Deployment guides ready
**Priority**: HIGH
**Timeline**: 3-5 days

**Tasks**:
- [ ] Database migration (careful with existing data)
- [ ] AWS S3 setup
- [ ] Render deployment
- [ ] Email service setup (Resend)
- [ ] Create initial admin account
- [ ] Seed 120 member accounts (or migration script)
- [ ] Production testing

### Phase 7: Enhanced Features 📅 FUTURE
**Status**: Future Enhancement
**Priority**: LOW
**Timeline**: TBD

**Potential Features**:
- [ ] Payment integration (M-Pesa, bank transfer)
- [ ] SMS notifications
- [ ] Automated verification (death certificate upload)
- [ ] Contribution reminders
- [ ] Analytics dashboard
- [ ] Member communication system
- [ ] Mobile app
- [ ] Multi-currency support

## 📊 Data Models (UPDATED)

### Core Models

1. **User** - Authentication credentials
   - email, hashed_password, role (admin/member)
   - is_active, is_first_login

2. **Member** - Member data
   - **member_id** (auto-generated: GGDS-0001, GGDS-0002, etc.)
   - first_name, middle_name, surname
   - phone, email
   - profile_completed (boolean)
   - profile_data (JSON - immutable after completion)
   - on_probation (boolean)
   - user_id (FK)

3. **Case** - Bereavement cases
   - **case_number** (auto-generated: 1, 2, 3, etc.)
   - member_id (FK - who filed)
   - deceased_name
   - relationship (enum: mother, father, spouse, son, daughter)
   - date_of_death
   - status (pending, approved, rejected, disbursed, completed)
   - verification_notes (admin only)
   - total_amount_required
   - total_amount_collected
   - disbursement_date
   - confirmed_receipt (boolean)
   - created_at, updated_at

4. **Contribution** - NEW
   - case_id (FK)
   - member_id (FK)
   - amount
   - contribution_date
   - deadline
   - status (pending, completed, overdue)
   - payment_reference

5. **Probation** - NEW
   - member_id (FK)
   - case_id (FK) - which case caused probation
   - start_date
   - end_date
   - reason
   - is_active

6. **Document** - Case supporting documents
   - case_id (FK)
   - file_path, file_type, uploaded_at

### Relationships
- User ↔ Member (one-to-one)
- Member → Cases (one-to-many) - cases filed
- Member → Contributions (one-to-many) - contributions made
- Member → Probation (one-to-many)
- Case → Contributions (one-to-many)
- Case → Documents (one-to-many)

## 🎨 Design System

### Brand Colors
- **Primary Green**: `#0ec434` (GGDS Green)
- **Secondary Blue**: `#273171` (GGDS Blue)
- **Warning Yellow**: For probation flags
- **Success Green**: For completed contributions
- **Neutrals**: Gray scale for UI elements

### Key UI Components (Reusable)
- Member dashboard layout ✅
- Case card component
- Contribution tracker
- Probation badge
- Case status indicators
- Notification bell

## 📈 Success Metrics

### Technical KPIs
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Email delivery rate > 99%
- [ ] 99.9% uptime
- [ ] Zero critical security vulnerabilities

### Business KPIs
- [ ] Profile completion rate > 95%
- [ ] Case approval time < 48 hours
- [ ] Contribution compliance rate > 90%
- [ ] Disbursement time < 72 hours after full collection
- [ ] Member satisfaction > 4.5/5

## 🚨 Risks & Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during pivot | Critical | Medium | Backup before migration, test thoroughly |
| Email delivery issues | High | Low | Use reliable service (Resend), test |
| Contribution tracking errors | High | Medium | Comprehensive testing, audit logs |
| Auto-ID generation conflicts | Medium | Low | Use database sequences, test concurrency |

### Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Member confusion with changes | High | Medium | Clear communication, training |
| Probation system misuse | Medium | Low | Clear policies, admin oversight |
| Delayed contributions | High | High | Automated reminders, clear deadlines |

## 📝 Next Immediate Steps

### Week 1: Pivot Foundation
**Days 1-2**: Database & Model Updates
- [ ] Update database models
- [ ] Create migration scripts
- [ ] Test migrations locally
- [ ] Update API schemas

**Days 3-5**: Frontend Restructuring
- [ ] Comment out registration page
- [ ] Simplify homepage
- [ ] Create admin member creation UI
- [ ] Update dashboard structure

**Days 6-7**: Member Onboarding
- [ ] Implement admin member creation endpoint
- [ ] Implement email sending for credentials
- [ ] Create profile completion flow
- [ ] Test immutable profile submission

### Week 2: Case & Contribution System
**Days 1-3**: Case Filing
- [ ] Update case filing form (immediate family only)
- [ ] Implement case approval workflow
- [ ] Create admin case review UI
- [ ] Auto-generate case numbers

**Days 4-7**: Contribution Tracking
- [ ] Create contribution model and endpoints
- [ ] Build contribution UI
- [ ] Implement deadline calculations
- [ ] Create probation flagging logic

### Week 3: Notifications & Testing
**Days 1-3**: Notification System
- [ ] Set up email templates
- [ ] Implement notification triggers
- [ ] Test email delivery
- [ ] Create notification center UI

**Days 4-7**: Testing
- [ ] End-to-end flow testing
- [ ] Multi-case testing
- [ ] Probation testing
- [ ] Security review

### Week 4: Deployment
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Create admin account
- [ ] Monitor and support

## 🎯 Definition of Done (Updated)

### For Pivot Completion
- [ ] All database models updated
- [ ] Registration page commented out (not deleted)
- [ ] Admin can create members
- [ ] Members receive email with credentials
- [ ] Members can complete immutable profile
- [ ] Members can file cases (immediate family only)
- [ ] Admin can approve/reject cases
- [ ] All members notified on case approval
- [ ] Members can contribute to active cases
- [ ] System tracks contribution deadlines
- [ ] Non-contributors flagged for probation
- [ ] Admin can disburse funds
- [ ] Members can confirm receipt
- [ ] All members notified on completion
- [ ] Multi-case support working
- [ ] Email notifications working
- [ ] Production deployment successful

## ⚠️ IMPORTANT NOTES

### Code Preservation
- **DO NOT DELETE** existing code
- **COMMENT OUT** unused features
- **REUSE** existing components where possible
- **MARK** commented code with `// PIVOT: Removed for v2.0`

### Future Considerations (Not Now)
- ❌ Payment processing
- ❌ SMS notifications
- ❌ Advanced verification
- ❌ Automated default handling
- ❌ Detailed analytics/reports

### Immediate Family Definition
**Covered (Eligible for Cases)**:
- ✅ Parents (Mother, Father)
- ✅ Spouse (Husband, Wife)
- ✅ Children (Son, Daughter)

**NOT Covered**:
- ❌ Siblings (Brothers, Sisters)
- ❌ Grandparents
- ❌ Aunts/Uncles
- ❌ Cousins
- ❌ In-laws (except spouse)

---

**Document Version**: 2.0 (PIVOT)
**Last Updated**: 2025-10-23
**Pivot Date**: 2025-10-23
**Next Review**: Daily during pivot (Week 1-2)

**Built with ❤️ for the GGDS community**

> *"Together, we support each other in times of loss"* - GGDS Benevolent Fund Mission
