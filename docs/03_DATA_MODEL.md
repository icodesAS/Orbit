# Orbit — Data Model & Firestore Structure

Canonical security rules live in repo-root firestore.rules. Do not render that file in the app UI.

## Collection Layout

```
users/{uid}/
  opportunities/{opportunityId}
    tasks/{taskId}
    aiChat/{messageId}
  projects/{projectId}
  radarDays/{yyyy-mm-dd}
    items/{itemId}
  settings/profile
```

## Key Documents

### opportunities/{id}

```
{
  id: string
  title: string
  type: "hackathon" | "fellowship" | "ambassador" | "waitlist" | "other"
  status: "active" | "waitlist" | "submitted" | "archived"
  // archived is a hidden fourth state. The UI shows only three tiers.
  deadline: Timestamp | null
  progress: number                    // 0–100, denormalized
  tasksDone: number                   // denormalized
  tasksTotal: number                  // denormalized
  projectIds: string[]                // Arsenal links
  url: string | null
  urlHash: string                     // for deduplication
  applicationCopy: string | null
  notes: string | null
  sourceRadarDate: string | null      // yyyy-mm-dd if promoted
  sortOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActivityAt: Timestamp
}
```

### tasks/{taskId} (subcollection)

```
{
  id: string
  title: string
  done: boolean
  sortOrder: number
  createdAt: Timestamp
}
```

### aiChat/{messageId} (subcollection)

```
{
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Timestamp
}
```

### projects/{id} (Arsenal)

```
{
  id: string
  title: string
  description: string
  contextBlurb: string                // about 100 words, plain English, used by the radar prompt to judge which project fits
  techStack: string[]
  urls: { label: string, url: string }[]
  usedInCount: number                 // denormalized
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

Demo Arsenal rows are fictional SAMPLE projects. Real projects are added by the user, not shipped in demo data or public docs.

### radarDays/{yyyy-mm-dd}

```
{
  date: string                        // yyyy-mm-dd
  generatedAt: Timestamp
  model: string
  itemCount: number
}
```

### radarDays/{yyyy-mm-dd}/items/{id}

```
{
  id: string
  title: string
  type: string
  url: string
  urlHash: string
  summary: string
  deadline: string | null             // raw from Gemini, needs verify
  source: string
  priority: "1A" | "1B" | "1C" | "2"
  // 1A campus ambassador/lead roles
  // 1B residencies/fellowships/research
  // 1C hackathons/internships
  // 2 free credits/perks
  verified: boolean                   // true only after user opened source then marked verified
  promoted: boolean                   // whether copied to opportunities
  createdAt: Timestamp
}
```

## Critical Rules

- Radar content is read-only. The only fields users may change are promoted and verified.
- Verified: user must open the source link first, then click Mark verified. Demo data must not ship as already verified.
- Track is allowed anytime. It shows a small form to confirm the deadline (prefilled, editable), then copies data into a new opportunities document. Radar history stays otherwise pure.
- Use date string as radarDays document ID → job is idempotent.
- Always store urlHash for cross-day deduplication.
- The radar job (later pass) sends the last 14 days of urlHash values with each request, and also removes duplicates in code afterward.
- Denormalize progress counters so list views require no extra reads.
- Every radar item must display a Source link + Verify control (Gemini can hallucinate dates/eligibility).
- Times in the UI use the user's local timezone.

## Demo vs Live

- Live only if Firebase env vars exist, else Demo.
- Demo saves to localStorage and must short-circuit Firestore.
- Live uses Firestore.
- Demo data lives only in /demo/demoData.ts and is labelled SAMPLE everywhere.

## Security Rules (Core Intent)

The file firestore.rules in the repo root is the source of truth. Content:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }
    match /users/{userId} {
      match /opportunities/{oppId}/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /projects/{projectId} {
        allow read, write: if isOwner(userId);
      }
      match /settings/{settingId} {
        allow read, write: if isOwner(userId);
      }
      match /radarDays/{day} {
        allow read: if isOwner(userId);
        allow write: if false;
      }
      match /radarDays/{day}/items/{itemId} {
        allow read: if isOwner(userId);
        allow create, delete: if false;
        allow update: if isOwner(userId)
          && request.resource.data.diff(resource.data)
             .affectedKeys().hasOnly(['promoted', 'verified']);
      }
    }
  }
}
```

The server job writes radar data using admin credentials, which bypass these rules. Users cannot edit radar history except promoted and verified.

- No public read access.
- No cross-user access.
- Demo mode does not use Firestore.
