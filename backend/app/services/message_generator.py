"""Message generation and template services."""
from datetime import datetime
from typing import List, Optional


class MessageGenerator:
    """Service for generating personalized recruiter outreach and cover letters."""

    # Base LinkedIn Message
    LINKEDIN_MESSAGE_BASE = (
        "Good {greeting},\n\n"
        "I hope you’re doing well. I wanted to reach out and ask if there are any "
        "internship or entry-level opportunities available in {field} at {company}.\n\n"
        "As a fresher, I am eager to start my career in the tech field and would truly "
        "appreciate any guidance or information you can share.{skills_sentence}\n\n"
        "Thank you.\n\n"
        "Best regards,\n"
        "{name}"
    )

    # Base Email Template
    EMAIL_TEMPLATE = (
        "Dear Sir/Madam,\n\n"
        "I am {name}, currently pursuing my {degree}. I am writing to inquire about any "
        "suitable job/internship opportunities available in your organization for {degree}/Computer "
        "Applications students or freshers.\n\n"
        "I have technical knowledge of {skills}. I have also developed several academic and personal "
        "projects related to software development, data analysis, and AI.\n\n"
        "I would be grateful if you could let me know about any current or upcoming opportunities "
        "for which I may be eligible.\n\n"
        "I have attached my resume for your reference and consideration.\n\n"
        "Thank you for your time.\n\n"
        "Yours sincerely,\n"
        "{name}\n"
        "Phone: {phone}\n"
        "Email: {email}\n"
        "Portfolio/LinkedIn: {linkedin_or_portfolio}"
    )

    def get_time_greeting(self, hour: Optional[int] = None) -> str:
        """
        Return 'morning' or 'evening' based on current hour in IST.
        05:00 AM -> morning
        21:00 (9:00 PM) -> evening
        """
        if hour is None:
            # By default check current UTC + 5:30 (IST)
            now = datetime.utcnow()
            # simple IST approximation
            ist_hour = (now.hour + 5 + (now.minute + 30) // 60) % 24
            hour = ist_hour

        if 4 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        else:
            return "evening"

    def generate_linkedin_message(
        self,
        candidate_name: str = "Sadhna",
        recruiter_name: Optional[str] = None,
        company: str = "your organization",
        role: Optional[str] = None,
        skills: Optional[List[str]] = None,
        run_time: Optional[str] = None,
    ) -> str:
        """
        Generate compliant personalized LinkedIn message.
        """
        if run_time == "evening" or run_time == "21:00":
            greeting = "evening"
        elif run_time == "morning" or run_time == "05:00":
            greeting = "morning"
        else:
            greeting = self.get_time_greeting()

        # Greeting line
        if recruiter_name and recruiter_name.strip() and recruiter_name.lower() not in ["hr", "recruiter", "hiring manager"]:
            salutation = f"Hi {recruiter_name.strip()},"
        else:
            salutation = f"Good {greeting},"

        field = f"{role} roles" if role else "IT or technical roles"

        skills_sentence = ""
        if skills:
            top_skills = ", ".join(skills[:3])
            skills_sentence = f" My technical skill set includes {top_skills}."

        message = (
            f"{salutation}\n\n"
            f"I hope you’re doing well. I wanted to reach out and ask if there are any "
            f"internship or entry-level opportunities available in {field} at {company}.\n\n"
            f"As a fresher, I am eager to start my career in the tech field and would truly "
            f"appreciate any guidance or information you can share.{skills_sentence}\n\n"
            f"Thank you.\n\n"
            f"Best regards,\n"
            f"{candidate_name}"
        )
        return message

    def generate_email_message(
        self,
        candidate_name: str = "Sadhna",
        degree: str = "Bachelor of Computer Applications (BCA)",
        skills: Optional[List[str]] = None,
        phone: str = "+91 7428889800",
        email: str = "sadhanakumari181106@gmail.com",
        linkedin_url: str = "linkedin.com/in/sadhna1615b333b",
        recruiter_name: Optional[str] = None,
        company: Optional[str] = None,
        role: Optional[str] = None,
    ) -> str:
        """
        Generate compliant personalized email message using standard template.
        """
        if not skills:
            skills = [
                "Python", "SQL", "HTML", "CSS", "JavaScript", "Flask", "Django",
                "React", "Git/GitHub", "Power BI", "Pandas", "NumPy", "basic AI/ML"
            ]

        skills_text = ", ".join(skills)
        salutation = f"Dear {recruiter_name}," if (recruiter_name and recruiter_name.lower() not in ["hr", "hiring manager"]) else "Dear Sir/Madam,"

        company_ref = f" at {company}" if company else " in your organization"
        role_ref = f"for {role} or " if role else ""

        body = (
            f"{salutation}\n\n"
            f"I am {candidate_name}, currently pursuing my {degree}. I am writing to inquire about any "
            f"suitable {role_ref}job/internship opportunities available{company_ref} for {degree}/Computer "
            f"Applications students or freshers.\n\n"
            f"I have technical knowledge of {skills_text}. I have also developed several academic and personal "
            f"projects related to software development, data analysis, and AI.\n\n"
            f"I would be grateful if you could let me know about any current or upcoming opportunities "
            f"for which I may be eligible.\n\n"
            f"I have attached my resume for your reference and consideration.\n\n"
            f"Thank you for your time.\n\n"
            f"Yours sincerely,\n"
            f"{candidate_name}\n"
            f"Phone: {phone}\n"
            f"Email: {email}\n"
            f"LinkedIn: {linkedin_url}"
        )
        return body

    def generate_cover_letter(
        self,
        candidate_profile: dict,
        company: str,
        role: str,
        job_description: Optional[str] = None,
        skills_required: Optional[List[str]] = None,
    ) -> str:
        """
        Generate professional job-specific cover letter without fabricating experience.
        """
        name = candidate_profile.get("full_name") or "Sadhna"
        degree = candidate_profile.get("degree") or "Bachelor of Computer Applications (BCA)"
        college = candidate_profile.get("college") or "Maharishi Dayanand University"
        
        # Candidate skills
        cand_skills = candidate_profile.get("skills") or ["Python", "SQL", "Pandas", "NumPy", "React", "Flask"]
        if isinstance(cand_skills, str):
            import json
            try:
                cand_skills = json.loads(cand_skills)
            except Exception:
                cand_skills = [s.strip() for s in cand_skills.split(",")]

        # Match relevant skills
        matched = []
        if skills_required:
            for s in skills_required:
                if any(s.lower() in cs.lower() for cs in cand_skills):
                    matched.append(s)
        if not matched:
            matched = cand_skills[:4]

        # Highlight factual projects
        projects_snippet = (
            "During my academic journey, I built hands-on projects including FemCare (a Flutter & Firebase health app "
            "with AI/ML integration), Netflix Exploratory Data Analysis using Python (Pandas/NumPy), and an interactive "
            "Power BI Diabetes Indicator Dashboard. Additionally, I was awarded 2nd Prize at the National AI Make-a-thon by Dell Technologies."
        )

        cover_letter = (
            f"Dear Hiring Team at {company},\n\n"
            f"I am writing to express my strong interest in the {role} position. As a dedicated {degree} student at {college}, "
            f"I have cultivated solid fundamentals in {', '.join(matched[:3])} and data-driven problem solving.\n\n"
            f"{projects_snippet}\n\n"
            f"I am enthusiastic about the opportunity to contribute to {company}, collaborate with experienced engineers, "
            f"and apply my technical skills to deliver reliable solutions. As a fast learner with a strong work ethic, "
            f"I am ready to make an immediate positive impact.\n\n"
            f"Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications further.\n\n"
            f"Sincerely,\n"
            f"{name}\n"
            f"Phone: {candidate_profile.get('phone', '+91 7428889800')}\n"
            f"Email: {candidate_profile.get('email', 'sadhanakumari181106@gmail.com')}\n"
            f"GitHub: {candidate_profile.get('github_url', 'github.com/sadhna1118')}"
        )
        return cover_letter


message_generator = MessageGenerator()
