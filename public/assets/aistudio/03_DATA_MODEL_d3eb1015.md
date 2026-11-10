# Orbit — Data Model & Firestore Structure

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
  verified: boolean                   // user or system flag
  promoted: boolean                   // whether copied to opportunities
  createdAt: Timestamp
}
```

## Critical Rules

- Radar is immutable after creation. Never update radar items except promoted flag if needed.
- Promoting a radar item copies data into a new opportunities document. Radar history stays pure.
- Use date string as radarDays document ID → job is idempotent.
- Always store urlHash for cross-day deduplication.
- The radar job sends the last 14 days of urlHash values with each request, and also removes duplicates in code afterward.
- Denormalize progress counters so list views require no extra reads.
- Every radar item must display a Source link + Verify badge (Gemini can hallucinate dates/eligibility).

## Security Rules (Core Intent)

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

The server job writes radar data using admin credentials, which bypass these rules. Users cannot edit radar history.

- No public read access.
- No cross-user access.
- Demo mode bypasses Firestore entirely.
