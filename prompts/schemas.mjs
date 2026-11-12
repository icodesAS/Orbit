// Response schemas and JSON definitions for Gemini outputs

export const RADAR_DISCOVERY_JSON_SCHEMA = `[
  {
    "title": "Program or Opportunity Name",
    "organization": "Hosting Company or Foundation",
    "type": "hackathon" | "fellowship" | "ambassador" | "waitlist" | "other",
    "url": "https://exact-source-url.com",
    "summary": "1-2 sentence technical summary of deliverables, perks, eligibility, and format.",
    "deadline": "ISO 8601 string or null",
    "deadlineConfidence": "stated" | "inferred" | "unknown",
    "format": "fresh_build" | "open_track" | "unclear",
    "source": "https://official-announcement-or-portal-link.com",
    "priority": "1A" | "1B" | "1C" | "2"
  }
]`;

export const RADAR_MATCH_JSON_SCHEMA = `[
  {
    "itemId": "radar-item-id",
    "recommendedProjectId": "exact-arsenal-project-id or null"
  }
]`;

// Backward compatibility alias
export const RADAR_ITEM_JSON_SCHEMA = RADAR_DISCOVERY_JSON_SCHEMA;
