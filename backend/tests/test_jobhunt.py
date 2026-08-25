"""Unit and integration test suite for JOBHUNT AI."""
import pytest
from datetime import datetime, timedelta

from app.services.job_matcher import job_matcher
from app.services.message_generator import message_generator


def test_eligibility_bca_fresher():
    """Test eligibility check for BCA student/fresher."""
    candidate = {
        "degree": "Bachelor of Computer Applications (BCA)",
        "skills": ["Python", "SQL", "Flask", "React", "Pandas", "Power BI"],
        "preferred_locations": ["New Delhi", "Remote"],
    }
    
    # 1. Eligible fresher job
    job = {
        "role": "Python Developer Intern",
        "job_type": "internship",
        "skills_required": ["Python", "SQL", "Flask"],
        "location": "New Delhi",
        "experience_required": "0-1 years (Fresher)",
        "description": "Looking for enthusiastic BCA / B.Tech interns in Python",
    }
    status, reason = job_matcher.check_eligibility(candidate, job)
    assert status == "eligible"
    assert "accepted" in reason.lower() or "matches" in reason.lower()

    # 2. Ineligible senior job
    senior_job = {
        "role": "Senior Python Architect",
        "job_type": "full_time",
        "skills_required": ["Python", "Kubernetes", "AWS"],
        "experience_required": "5+ years required",
        "description": "Requires minimum 5 years of production experience",
    }
    status, reason = job_matcher.check_eligibility(candidate, senior_job)
    assert status == "not_eligible"
    assert "senior" in reason.lower() or "experience" in reason.lower()


def test_match_score_calculation():
    """Test weighted match score calculation."""
    candidate = {
        "full_name": "Sadhna",
        "degree": "Bachelor of Computer Applications (BCA)",
        "skills": ["Python", "SQL", "React", "Pandas", "NumPy", "Power BI", "Flask"],
        "target_roles": ["Python Developer Intern", "Data Analyst Intern"],
        "preferred_locations": ["New Delhi", "Remote"],
        "preferred_stipend": 10000,
    }

    job = {
        "role": "Python Developer Intern",
        "company": "TechNova",
        "job_type": "internship",
        "skills_required": ["Python", "SQL", "Flask"],
        "location": "New Delhi",
        "stipend_min": 15000,
        "posted_date": datetime.utcnow(),
    }

    score, details = job_matcher.calculate_match_score(candidate, job)
    assert score >= 85.0
    assert details["category"] in ["Excellent Match", "Strong Match"]
    assert details["skill_match"] == 100.0


def test_time_based_greetings():
    """Test dynamic 5 AM morning vs 9 PM evening greetings."""
    # 5:00 AM IST
    morning_msg = message_generator.generate_linkedin_message(
        candidate_name="Sadhna",
        recruiter_name="Priya Sharma",
        company="TechNova Solutions",
        role="Python Developer Intern",
        run_time="morning",
    )
    assert "Hi Priya Sharma," in morning_msg
    assert "TechNova Solutions" in morning_msg

    # 9:00 PM IST (Generic recruiter greeting)
    evening_msg = message_generator.generate_linkedin_message(
        candidate_name="Sadhna",
        recruiter_name=None,
        company="TechNova Solutions",
        role="Python Developer Intern",
        run_time="evening",
    )
    assert "Good evening," in evening_msg
    assert "TechNova Solutions" in evening_msg


def test_email_template_generation():
    """Test standard truthful email outreach generation."""
    email_text = message_generator.generate_email_message(
        candidate_name="Sadhna",
        degree="Bachelor of Computer Applications (BCA)",
        skills=["Python", "SQL", "Power BI", "React", "AI/ML"],
        phone="+91 7428889800",
        email="sadhanakumari181106@gmail.com",
        recruiter_name="Rahul Verma",
        company="CloudSprint Systems",
        role="Data Analyst Intern",
    )
    assert "Dear Rahul Verma," in email_text
    assert "Bachelor of Computer Applications (BCA)" in email_text
    assert "Python, SQL, Power BI, React, AI/ML" in email_text
    assert "sadhanakumari181106@gmail.com" in email_text
    assert "Yours sincerely,\nSadhna" in email_text


def test_cover_letter_generator():
    """Test tailored cover letter without information fabrication."""
    candidate = {
        "full_name": "Sadhna",
        "degree": "Bachelor of Computer Applications (BCA)",
        "college": "Maharishi Dayanand University",
        "skills": ["Python", "SQL", "Pandas", "NumPy", "Power BI"],
        "phone": "+91 7428889800",
        "email": "sadhanakumari181106@gmail.com",
    }
    cl = message_generator.generate_cover_letter(
        candidate_profile=candidate,
        company="DataVue Analytics",
        role="Data Analyst Intern",
        job_description="Seeking a data analyst intern proficient in SQL and Python",
        skills_required=["SQL", "Python", "Power BI"],
    )
    assert "DataVue Analytics" in cl
    assert "Data Analyst Intern" in cl
    assert "FemCare" in cl
    assert "Maharishi Dayanand University" in cl
    assert "Sadhna" in cl
