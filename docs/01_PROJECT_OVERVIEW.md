# Orbit — Project Overview

Name: Orbit
Full Title: Autonomous Opportunity & Pipeline Command Center
Status: Production-grade open-source web app
Target Users: AI engineers, student builders, hackathon participants

## Purpose

Orbit is a management-first dashboard for tracking application pipelines (hackathons, ambassador roles, fellowships, waitlists) and automating daily opportunity discovery. Unlike news-reader style tools, the entire home experience is dedicated to active work, deadlines, and status progression.

## Core Principles

- Pipeline is the system of record. Radar is secondary, immutable input only.
- Keyboard-first and command-palette driven.
- Optimistic UI with silent background persistence.
- Strict isolation between daily radar history and personal pipeline data.
- Open-source ready with Demo Mode (zero backend) and BYOK (Bring Your Own Key).

## Three Operational Tiers

- Active Builds & Submissions — Hard deadlines, sub-tasks, progress, linked projects.
- Waitlists & Registration Watch — Closed programs, re-open dates, prerequisites.
- Submitted / Pending Verdict — Archived applications with preserved essays and links.

## Secondary Systems

- 9:00 AM Gemini Radar: Automated daily search (Gemini + Google Search grounding). Results saved as immutable daily logs.
- Ask AI Drawer: Contextual, per-opportunity chat with search grounding. History lives only inside the opportunity.
- Project Arsenal: Flagship projects (e.g. PatchTree, SentinelFlow) that can be linked to opportunities.

## Tech Stack

- Frontend: React (Vite preferred) + Tailwind CSS + Framer Motion
- Backend: Firebase (Firestore)
- 9:00 AM job: GitHub Actions scheduled workflow (free, fork-friendly). Cloud Functions is optional but needs the paid Firebase Blaze plan.
- AI: Gemini API (Google AI Studio) with Search grounding
- Mobile: Fully responsive PWA + Firebase Cloud Messaging (FCM)
- Typography: JetBrains Mono for data, clean sans for UI
- Aesthetic: Tactical dark mode, Linear / Raycast / Vercel density

GitHub Actions cron uses UTC. 9:00 AM IST = 03:30 UTC (cron: 30 3 * * *). It can start a few minutes late.

## Open-Source Goals

- Instant Demo Mode (local fake data, no Firebase required)
- BYOK for Gemini keys
- Strict per-user Firestore security rules
- Clean .env.example, no secrets in repository
- Easy fork-and-run experience
