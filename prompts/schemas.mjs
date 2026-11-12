// Response schemas and JSON definitions for Gemini outputs

export const RADAR_ITEM_JSON_SCHEMA = `[
  {
    "title": "Program or Opportunity Name",
    "organization": "Hosting Company or Foundation",
    "type": "hackathon" | "fellowship" | "ambassador" | "waitlist" | "other",
    "url": "https://exact-source-url.com",
    "summary": "1-2 sentence technical summary of deliverables, perks, eligibility, and format.",
    "deadline": "ISO 8601 string or null",
    "source": "https://official-announcement-or-portal-link.com",
    "priority": "1A" | "1B" | "1C" | "2",
    "recommendedProjectId": "project-id or null"
  }
]`;
