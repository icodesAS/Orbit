# Orbit — Project Overview

Name: Orbit
Full Title: Autonomous Opportunity & Pipeline Command Center
Status: Production-grade open-source web app
Target Users: AI engineers, student builders, hackathon participants

AGENTS.md and docs/07_UI_REDESIGN.md win over this file on design and product decisions.

## Purpose

Orbit is a management-first dashboard for tracking application pipelines (hackathons, ambassador roles, fellowships, waitlists) and automating daily opportunity discovery. Home is the Today page (due-soon work plus a link to this morning's radar digest). Pipeline is the system of record. Radar is secondary, immutable input only.

## Core Principles

- Pipeline is the system of record. Radar is secondary, immutable input only.
- Keyboard-first and command-palette driven.
- Optimistic UI with silent background persistence (Demo: localStorage. Live: Firestore).
- Strict isolation between daily radar history and personal pipeline data.
- Open-source ready with Demo Mode (no Firebase) and BYOK (Bring Your Own Key).

## Three Operational Tiers

- Active Builds & Submissions — Hard deadlines, sub-tasks, progress, linked projects.
- Waitlists & Registration Watch — Closed programs, re-open dates, prerequisites.
- Submitted / Pending Verdict — Archived applications with preserved essays and links.

## Secondary Systems

- Morning Gemini Radar: Automated daily search (Gemini + Google Search grounding). Results saved as immutable daily logs, grouped as 1A / 1B / 1C / 2.
- Ask AI Drawer: Contextual, per-opportunity chat with search grounding. History lives only inside the opportunity.
- Project Arsenal: Flagship projects the user adds. Demo data uses fictional SAMPLE projects only. Public docs never name real projects.

## Tech Stack

- Frontend: Next.js + Tailwind CSS + Framer Motion
- Backend: Firebase (Firestore + Auth) when Live
- Morning job (later): GitHub Actions scheduled workflow on the user's own fork (free, fork-friendly). Cloud Functions is optional but needs the paid Firebase Blaze plan.
- AI: Gemini API with Search grounding
- Mobile: Responsive web. Tabs: Today | Pipeline | Radar | Arsenal. Settings in a menu.
- Typography: Inter 14px for text. JetBrains Mono only for dates, numbers, IDs. One italic serif touch on the page heading.
- Aesthetic: Light, calm project tracker (see docs/07_UI_REDESIGN.md)

GitHub Actions cron uses UTC (cron: 30 3 * * *). It can start a few minutes late. The UI shows times in the user's local timezone. This job is not in the current build pass.

## Demo vs Live

- Live only if Firebase env vars exist, else Demo.
- Demo saves to localStorage. Live uses Firestore.
- Demo data is fictional and labelled SAMPLE everywhere.

## Open-Source Goals

- Instant Demo Mode (local SAMPLE data, no Firebase required)
- BYOK for Gemini keys (Settings paste, browser memory only)
- Strict per-user Firestore security rules in repo-root firestore.rules
- Clean .env.example, no secrets in repository
- Easy fork-and-run experience
