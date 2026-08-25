"""Job eligibility and matching service."""
import json
import logging
from typing import Any, Dict, List, Optional, Tuple, Union
from datetime import datetime

logger = logging.getLogger(__name__)


class JobMatcher:
    """Service for matching jobs with candidate profiles."""

    def __init__(self):
        """Initialize job matcher."""
        pass

    def check_eligibility(
        self,
        candidate_profile: dict,
        job_dict: dict,
    ) -> Tuple[str, str]:
        """
        Check if candidate is eligible for the job.
        
        Returns:
            Tuple of (eligibility_status, reason)
            Status: "eligible" | "possibly_eligible" | "not_eligible"
        """
        reasons = []
        positive_notes = []
        is_blocked = False

        experience_req = str(job_dict.get("experience_required") or job_dict.get("experience") or "").lower()
        job_type = str(job_dict.get("job_type") or "").lower()
        role = str(job_dict.get("role") or "").lower()
        description = str(job_dict.get("description") or "").lower()

        # Check experience barriers (> 2 years requires non-fresher)
        if any(term in experience_req for term in ["3+", "4+", "5+", "3-5", "5-8", "senior", "lead", "principal"]):
            return "not_eligible", "Requires 3+ years senior experience; candidate is entry-level/fresher."

        # Check degree acceptance
        degree = str(candidate_profile.get("degree") or "BCA").lower()
        if "phd only" in description or "master's required" in description:
            return "not_eligible", "Requires advanced master's/PhD degree."
        else:
            positive_notes.append("BCA / Computer Applications accepted")

        # Check skills overlap
        job_skills = job_dict.get("skills_required") or job_dict.get("skills") or []
        if isinstance(job_skills, str):
            try:
                job_skills = json.loads(job_skills)
            except Exception:
                job_skills = [s.strip() for s in job_skills.split(",") if s.strip()]

        candidate_skills = candidate_profile.get("skills") or []
        if isinstance(candidate_skills, str):
            try:
                candidate_skills = json.loads(candidate_skills)
            except Exception:
                candidate_skills = [s.strip() for s in candidate_skills.split(",") if s.strip()]

        cand_skills_lower = [s.lower() for s in candidate_skills]
        
        if job_skills:
            job_skills_lower = [s.lower() for s in job_skills]
            matched_skills = [
                js for js in job_skills_lower
                if any(js in cs or cs in js for cs in cand_skills_lower)
            ]
            overlap_pct = (len(matched_skills) / len(job_skills_lower)) * 100 if job_skills_lower else 100

            if overlap_pct == 0 and len(job_skills_lower) >= 3:
                return "not_eligible", f"Zero required technical skills matched ({', '.join(job_skills[:3])})."
            elif overlap_pct >= 60:
                positive_notes.append(f"Strong skill match ({int(overlap_pct)}% - {', '.join(matched_skills[:4])})")
            else:
                reasons.append(f"Partial skill overlap ({int(overlap_pct)}%)")

        # Check location
        location = str(job_dict.get("location") or "").lower()
        pref_locations = candidate_profile.get("preferred_locations") or ["New Delhi", "Remote"]
        if isinstance(pref_locations, str):
            try:
                pref_locations = json.loads(pref_locations)
            except Exception:
                pref_locations = [p.strip() for p in pref_locations.split(",") if p.strip()]
        
        pref_locations_lower = [p.lower() for p in pref_locations]
        if "remote" in location or any(p in location for p in pref_locations_lower) or not location:
            positive_notes.append("Location preference matches (Remote/Delhi NCR)")
        else:
            reasons.append(f"Location is {job_dict.get('location')}")

        # Summary
        if positive_notes and not reasons:
            return "eligible", "; ".join(positive_notes)
        elif positive_notes:
            return "eligible", "; ".join(positive_notes + reasons)
        elif reasons:
            return "possibly_eligible", "; ".join(reasons)
        
        return "eligible", "Requirements align with candidate profile"

    def calculate_match_score(
        self,
        candidate_profile: dict,
        job_dict: dict,
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate weighted match score (0-100) between candidate and job.
        
        Returns:
            Tuple of (overall_score, details_dict)
        """
        skill_score = self._calculate_skill_match(candidate_profile, job_dict)
        education_score = self._calculate_education_match(candidate_profile, job_dict)
        experience_score = self._calculate_experience_match(candidate_profile, job_dict)
        role_score = self._calculate_role_match(candidate_profile, job_dict)
        location_score = self._calculate_location_match(candidate_profile, job_dict)
        salary_score = self._calculate_salary_match(candidate_profile, job_dict)
        freshness_score = self._calculate_freshness(job_dict)

        weights = {
            "skill_match": 0.30,
            "role_match": 0.20,
            "education_match": 0.15,
            "experience_match": 0.15,
            "location_match": 0.10,
            "salary_match": 0.05,
            "freshness": 0.05,
        }

        overall = (
            skill_score * weights["skill_match"]
            + role_score * weights["role_match"]
            + education_score * weights["education_match"]
            + experience_score * weights["experience_match"]
            + location_score * weights["location_match"]
            + salary_score * weights["salary_match"]
            + freshness_score * weights["freshness"]
        )

        overall = round(max(0.0, min(100.0, overall)), 1)

        # Categorize
        if overall >= 90:
            category = "Excellent Match"
        elif overall >= 80:
            category = "Strong Match"
        elif overall >= 70:
            category = "Good Match"
        else:
            category = "Low Priority"

        details = {
            "skill_match": round(skill_score, 1),
            "role_match": round(role_score, 1),
            "education_match": round(education_score, 1),
            "experience_match": round(experience_score, 1),
            "location_match": round(location_score, 1),
            "salary_match": round(salary_score, 1),
            "freshness": round(freshness_score, 1),
            "overall_score": overall,
            "category": category,
            "weights": weights,
        }

        return overall, details

    def _calculate_skill_match(self, candidate_profile: dict, job_dict: dict) -> float:
        """Calculate skill match percentage."""
        job_skills = job_dict.get("skills_required") or job_dict.get("skills") or []
        if isinstance(job_skills, str):
            try:
                job_skills = json.loads(job_skills)
            except Exception:
                job_skills = [s.strip() for s in job_skills.split(",") if s.strip()]

        if not job_skills:
            return 85.0

        candidate_skills = candidate_profile.get("skills") or []
        if isinstance(candidate_skills, str):
            try:
                candidate_skills = json.loads(candidate_skills)
            except Exception:
                candidate_skills = [s.strip() for s in candidate_skills.split(",") if s.strip()]

        cand_skills_lower = [s.lower().strip() for s in candidate_skills]
        job_skills_lower = [s.lower().strip() for s in job_skills]

        matches = sum(
            1 for js in job_skills_lower
            if any(js in cs or cs in js for cs in cand_skills_lower)
        )

        return min(100.0, (matches / len(job_skills_lower)) * 100.0)

    def _calculate_education_match(self, candidate_profile: dict, job_dict: dict) -> float:
        """Calculate education match for BCA candidate."""
        degree = str(candidate_profile.get("degree") or "BCA").upper()
        desc = str(job_dict.get("description") or "").upper()
        
        if "BCA" in desc or "COMPUTER APPLICATIONS" in desc:
            return 100.0
        if "B.TECH" in desc or "B.E." in desc or "ANY GRADUATE" in desc or "GRADUATE" in desc:
            return 90.0
        return 85.0

    def _calculate_experience_match(self, candidate_profile: dict, job_dict: dict) -> float:
        """Calculate experience match for freshers/interns."""
        job_type = str(job_dict.get("job_type") or "").lower()
        exp = str(job_dict.get("experience_required") or job_dict.get("experience") or "").lower()

        if "intern" in job_type or "fresher" in job_type or "0" in exp or "fresher" in exp:
            return 100.0
        if "1" in exp or "entry" in exp:
            return 90.0
        if any(term in exp for term in ["2", "junior"]):
            return 75.0
        return 60.0

    def _calculate_role_match(self, candidate_profile: dict, job_dict: dict) -> float:
        """Calculate role match based on target roles."""
        target_roles = candidate_profile.get("target_roles") or [
            "Software Developer Intern", "Python Developer Intern", "Backend Developer Intern",
            "Frontend Developer Intern", "Full Stack Developer Intern", "Web Developer Intern",
            "Data Analyst Intern", "Data Analyst Fresher", "Python Developer Fresher",
            "AI/ML Intern", "AI Engineer Intern", "Machine Learning Intern",
            "Software Engineer Fresher", "Technical/IT Intern"
        ]
        if isinstance(target_roles, str):
            try:
                target_roles = json.loads(target_roles)
            except Exception:
                target_roles = [r.strip() for r in target_roles.split(",") if r.strip()]

        job_role = str(job_dict.get("role") or "").lower()
        
        for tr in target_roles:
            tr_lower = tr.lower()
            if tr_lower in job_role or job_role in tr_lower:
                return 100.0
            # Keyword partial overlap
            words = [w for w in tr_lower.split() if len(w) > 3]
            if any(w in job_role for w in words):
                return 85.0

        return 70.0

    def _calculate_location_match(self, candidate_profile: dict, job_dict: dict) -> float:
        """Calculate location match."""
        location = str(job_dict.get("location") or "").lower()
        if not location or "remote" in location:
            return 100.0

        pref_locations = candidate_profile.get("preferred_locations") or ["New Delhi", "Remote"]
        if isinstance(pref_locations, str):
            try:
                pref_locations = json.loads(pref_locations)
            except Exception:
                pref_locations = [p.strip() for p in pref_locations.split(",") if p.strip()]

        for pref in pref_locations:
            if pref.lower() in location or location in pref.lower():
                return 100.0

        # Top tech cities
        if any(city in location for city in ["delhi", "noida", "gurgaon", "bangalore", "bengaluru", "hyderabad", "pune", "mumbai"]):
            return 80.0

        return 65.0

    def _calculate_salary_match(self, candidate_profile: dict, job_dict: dict) -> float:
        """Calculate salary/stipend match."""
        stipend_min = job_dict.get("stipend_min") or 0
        salary_min = job_dict.get("salary_min") or 0
        pref_stipend = candidate_profile.get("preferred_stipend") or 5000

        if stipend_min >= pref_stipend or salary_min > 0:
            return 100.0
        if stipend_min > 0:
            return 85.0
        return 75.0

    def _calculate_freshness(self, job_dict: dict) -> float:
        """Calculate posting freshness."""
        posted = job_dict.get("posted_date")
        if not posted:
            return 85.0

        if isinstance(posted, str):
            try:
                posted = datetime.fromisoformat(posted.replace("Z", "+00:00"))
            except Exception:
                return 85.0

        days = (datetime.utcnow() - posted.replace(tzinfo=None)).days
        if days <= 2:
            return 100.0
        elif days <= 7:
            return 90.0
        elif days <= 14:
            return 80.0
        elif days <= 30:
            return 70.0
        return 50.0


job_matcher = JobMatcher()
