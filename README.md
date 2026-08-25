# JOBHUNT AI - Personal Career Automation Platform

A production-ready AI-powered job search assistant that discovers, analyzes, and applies to suitable internships and entry-level opportunities while maintaining strict compliance with platform policies and candidate preferences.

## 🎯 Key Features

- **🤖 Dual Automation Runs**: Executes daily at 5:00 AM & 9:00 PM IST (Asia/Kolkata timezone)
- **🔍 Multi-Platform Job Discovery**: LinkedIn, Naukri, Internshala, company career pages
- **✅ Intelligent Eligibility Checking**: Automatically validates candidate qualifications
- **🎯 AI Match Scoring**: 0-100 match score with detailed reasoning
- **🚫 Duplicate Prevention**: Prevents duplicate applications and recruiter contact abuse
- **📧 Personalized Outreach**: Generates tailored HR/recruiter messages
- **✔️ Approval-First Architecture**: Human oversight for critical actions
- **📊 Comprehensive Dashboard**: Real-time analytics and tracking
- **🗂️ Recruiter CRM**: Manage all recruiter interactions
- **📱 Multi-Channel Notifications**: Email, Telegram, in-app alerts
- **🔐 Bank-Grade Security**: OAuth, encrypted sessions, audit logging

## 🏗️ Architecture

```
jobhunt-ai/
├── frontend/              # Next.js 14 React App
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── services/
├── backend/               # FastAPI Python Server
│   ├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── agents/
│   ├── automation/
│   ├── integrations/
│   ├── ai/
│   └── utils/
├── database/              # PostgreSQL Migrations
│   └── migrations/
├── docker/                # Container Configuration
├── tests/                 # Test Suites
├── docs/                  # Documentation
└── .github/               # CI/CD & Templates
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14, TypeScript, React, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL + pgvector for AI embeddings |
| **Message Queue** | Redis + Celery for job processing |
| **Scheduler** | Celery Beat / APScheduler for cron jobs |
| **AI** | OpenAI GPT / Google Gemini (provider abstraction) |
| **Authentication** | OAuth 2.0, Secure session management |
| **Resume Parsing** | PyMuPDF, python-docx |
| **Deployment** | Vercel (Frontend), Railway/Render (Backend), Managed PostgreSQL |

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis
- Docker & Docker Compose

### Quick Start (Docker)
```bash
# Clone repository
git clone https://github.com/yourusername/jobhunt-ai.git
cd jobhunt-ai

# Create environment files
cp .env.example .env
# Edit .env with your configuration

# Start with Docker
docker-compose up -d
```

### Local Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Database Setup
```bash
cd backend
alembic upgrade head
```

## 🔑 Core Workflow

### Daily Automation (5 AM & 9 PM IST)
1. 🔍 **Search** new jobs from configured sources
2. 🧹 **Normalize** job data into standard format
3. ⚠️ **Deduplicate** across platforms
4. ✅ **Check Eligibility** against candidate profile
5. 🎯 **Calculate AI Match Score** (0-100)
6. 📋 **Filter** unsuitable jobs
7. 🔄 **Check** previous applications
8. 👤 **Identify** relevant recruiters
9. 🤝 **Check** recruiter contact history
10. ✋ **Approval Queue** for actions
11. 📧 **Send** max 5 new recruiter emails (if approved)
12. 📊 **Generate** daily report

## 📋 Configuration

### Candidate Profile
- Name, email, phone, location
- Education (degree, college, graduation year)
- Technical skills
- Portfolio links (GitHub, LinkedIn)
- Preferred job types (internship/full-time)
- Salary expectations
- Availability

### Automation Settings
- Enabled/disabled status
- Scheduled times (configurable)
- Daily application limit (default: 10)
- Daily email limit (default: 5 new contacts)
- Minimum match score threshold (default: 75%)
- Target job types
- Target locations
- Preferred salary range

### Connected Platforms
- LinkedIn
- Naukri
- Internshala
- Gmail

## 🔒 Security & Compliance

### No Passwords Stored
- ✅ Uses OAuth 2.0 where available
- ✅ Secure session management
- ✅ Encrypted credential storage

### Automation Compliance
- ✅ Respects platform rate limits
- ✅ No CAPTCHA/MFA bypass
- ✅ No mass messaging
- ✅ Single contact per recruiter (unless approved follow-up)
- ✅ No duplicate applications
- ✅ No fabricated information
- ✅ Complete audit logging

### Data Protection
- ✅ HTTPS only
- ✅ CSRF protection
- ✅ Input validation
- ✅ Authorization checks
- ✅ Rate limiting
- ✅ Encrypted database fields

## 📊 Dashboard Features

- **Overview**: Today's stats at a glance
- **Applications**: Kanban board (Saved → Offer)
- **Recruiters**: CRM with interaction history
- **Analytics**: Charts, trends, response rates
- **Approval Queue**: Pending actions
- **Reports**: Daily automation reports
- **Settings**: Profile, automation, integrations

## 🤖 AI Career Assistant

Ask natural questions:
- "Find Python internships above 75% match"
- "Show companies I haven't contacted"
- "Why didn't you apply for this?"
- "Which skills should I learn?"
- "Prepare a recruiter message"

## 📬 Notifications

Receive updates via:
- **Email**: Daily reports, interview alerts
- **Telegram**: Quick notifications (optional)
- **In-App**: Real-time dashboard alerts

## 🧪 Testing & Demo Mode

### Demo Mode
Test the system with:
- 100 mock jobs
- 50 mock recruiters
- Various eligibility scenarios
- Previous contact history
- Duplicate job detection

```bash
# Run with demo data
export DEMO_MODE=true
npm run dev  # frontend
python -m uvicorn app.main:app --reload  # backend
```

### Test Suite
```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm run test
```

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Job Source Integration](./docs/JOB_SOURCES.md)
- [Automation Workflow](./docs/AUTOMATION.md)
- [Security Guidelines](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🌍 Environment Configuration

See `.env.example` for all available configuration options:

```env
# Application
APP_NAME=JobhuntAI
APP_ENV=development
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jobhunt

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# OAuth
LINKEDIN_CLIENT_ID=...
NAUKRI_API_KEY=...
INTERNSHALA_API_KEY=...
GMAIL_CLIENT_ID=...

# Timezone
TZ=Asia/Kolkata

# Automation
AUTOMATION_ENABLED=true
MORNING_RUN_TIME=05:00
EVENING_RUN_TIME=21:00
DAILY_APPLICATION_LIMIT=10
DAILY_EMAIL_LIMIT=5
MIN_MATCH_SCORE=75
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway/Render)
```bash
# See docs/DEPLOYMENT.md
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis configured and tested
- [ ] API rate limiting enabled
- [ ] Audit logging active
- [ ] Email/notification service configured
- [ ] Scheduled jobs configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Security headers set

## 📞 Support & Contributing

For issues, feature requests, or contributions, please visit our [GitHub Issues](https://github.com/yourusername/jobhunt-ai/issues).

## 📄 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

This tool is designed to assist in job searching while maintaining ethical standards and compliance with job platform policies. Users are responsible for:
- Ensuring their resume and information are accurate
- Complying with each platform's terms of service
- Reviewing all automated actions before they are sent
- Using the system responsibly

## 🎓 For: Sadhna

Built with ❤️ for your career journey. Let's find the right opportunity together!

---

**Status**: Development Phase 1 ✅ | Phase 2 In Progress

**Last Updated**: August 2024
