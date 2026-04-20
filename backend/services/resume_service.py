"""
resume_service.py

Service for parsing PDF resumes and extracting experience, skills, companies, and roles.
"""

import re
from typing import Optional
from pypdf import PdfReader
import io


def parse_resume_pdf(file_bytes: bytes) -> dict:
    """
    Parse a PDF resume and extract relevant information.

    Args:
        file_bytes: PDF file bytes

    Returns:
        dict with experience_years, skills, companies, roles
    """
    try:
        # Read PDF
        pdf_reader = PdfReader(io.BytesIO(file_bytes))
        text = ""

        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        return extract_resume_info(text)
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return {
            "experience_years": None,
            "skills": [],
            "companies": [],
            "roles": [],
        }


def extract_resume_info(text: str) -> dict:
    """
    Extract experience, skills, companies, and roles from resume text.

    Args:
        text: Extracted text from resume

    Returns:
        dict with extracted information
    """
    experience_years = extract_experience_years(text)
    skills = extract_skills(text)
    companies = extract_companies(text)
    roles = extract_roles(text)

    return {
        "experience_years": experience_years,
        "skills": skills,
        "companies": companies,
        "roles": roles,
    }


def extract_experience_years(text: str) -> Optional[int]:
    """
    Extract years of experience from resume text.
    Looks for patterns like "5 years of experience", "2015-2020", etc.
    """
    # Pattern 1: "N years of experience"
    match = re.search(r"(\d+)\s+years?\s+(?:of\s+)?(?:professional\s+)?experience", text, re.IGNORECASE)
    if match:
        return int(match.group(1))

    # Pattern 2: Date ranges like "2015-2020"
    dates = re.findall(r"(20\d{2})\s*-\s*(20\d{2}|present)", text, re.IGNORECASE)
    if dates:
        years = []
        for start, end in dates:
            end_year = 2024 if end.lower() == "present" else int(end)
            years.append(int(end_year) - int(start))
        if years:
            return max(years)  # Return longest duration

    return None


def extract_skills(text: str) -> list:
    """
    Extract technical skills from resume.
    Looks for common programming languages, frameworks, and technologies.
    """
    # Comprehensive list of common tech skills
    tech_skills = [
        "Python",
        "JavaScript",
        "Java",
        "C\\+\\+",
        "C#",
        "TypeScript",
        "Go",
        "Rust",
        "PHP",
        "Ruby",
        "Swift",
        "Kotlin",
        "React",
        "Vue",
        "Angular",
        "Node\\.js",
        "Django",
        "Flask",
        "FastAPI",
        "Spring",
        "AWS",
        "Azure",
        "GCP",
        "Google Cloud",
        "Docker",
        "Kubernetes",
        "PostgreSQL",
        "MongoDB",
        "MySQL",
        "Redis",
        "ElasticSearch",
        "GraphQL",
        "REST",
        "Git",
        "CI/CD",
        "Linux",
        "MacOS",
        "Windows",
        "SQL",
        "NoSQL",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "Tableau",
        "Power BI",
        "Excel",
        "JIRA",
        "Agile",
        "Scrum",
        "Data Analysis",
        "Data Science",
        "DevOps",
        "Cloud",
        "Microservices",
        "API",
    ]

    found_skills = []
    for skill in tech_skills:
        if re.search(rf"\b{skill}\b", text, re.IGNORECASE):
            # Normalize skill name
            normalized = skill.replace("\\.", "").replace("\\+", "+").strip()
            if normalized not in found_skills:
                found_skills.append(normalized)

    return list(set(found_skills))  # Remove duplicates


def extract_companies(text: str) -> list:
    """
    Extract company names from resume.
    Looks for common patterns like employment sections.
    """
    companies = []

    # Common company/role patterns
    patterns = [
        r"(?:worked at|at|employed by|company|employer|organization)[\s:]+([A-Z][A-Za-z\s&.-]+?)(?:\n|,|;)",
        r"^([A-Z][A-Za-z\s&.-]+?)\s*(?:\||–|-|,)\s*(?:Senior|Junior|Lead|Principal|Manager|Engineer|Developer|Analyst)",
    ]

    for pattern in patterns:
        matches = re.finditer(pattern, text, re.MULTILINE)
        for match in matches:
            company = match.group(1).strip()
            if len(company) > 2 and len(company) < 100 and company not in companies:
                companies.append(company)

    return companies[:10]  # Limit to 10 companies


def extract_roles(text: str) -> list:
    """
    Extract job titles/roles from resume.
    Looks for role name patterns.
    """
    job_titles = [
        "Software Engineer",
        "Senior Software Engineer",
        "Junior Software Engineer",
        "Lead Engineer",
        "Principal Engineer",
        "Architect",
        "Developer",
        "Full Stack Developer",
        "Frontend Developer",
        "Backend Developer",
        "Data Engineer",
        "Data Scientist",
        "DevOps Engineer",
        "Cloud Engineer",
        "Machine Learning Engineer",
        "Product Engineer",
        "Solutions Engineer",
        "Design Engineer",
        "SRE",
        "QA Engineer",
        "Test Engineer",
        "Systems Engineer",
        "Network Engineer",
        "Security Engineer",
        "Infrastructure Engineer",
        "Manager",
        "Engineering Manager",
        "Tech Lead",
        "Analyst",
        "Business Analyst",
        "Product Manager",
    ]

    found_roles = []
    for title in job_titles:
        if re.search(rf"\b{re.escape(title)}\b", text, re.IGNORECASE):
            if title not in found_roles:
                found_roles.append(title)

    return found_roles


def validate_resume_file(file_size: int, max_size_mb: int = 5) -> tuple[bool, str]:
    """
    Validate resume file size and type.

    Args:
        file_size: Size of the file in bytes
        max_size_mb: Maximum allowed size in MB

    Returns:
        tuple of (is_valid, error_message)
    """
    max_bytes = max_size_mb * 1024 * 1024

    if file_size > max_bytes:
        return False, f"File size exceeds {max_size_mb}MB limit"

    return True, ""
