# GigProof

**Check your social security eligibility across every gig app you work on — before you find out too late.**

Built for First Commit (Bharat Builds Tour, WeMakeDevs × AWS), September 2026.

---

## The Problem

India's **Social Security (Central) Rules, 2026** (notified May 2026) let gig and platform
workers — delivery riders, cab drivers, home-service workers — qualify for social security
benefits based on how many days they worked in the last financial year:

- **90 qualifying days** with a single aggregator app, **or**
- **120 days combined** across multiple aggregator apps

Eligibility has to be earned again every year.

The problem: **no worker can see this number anywhere.** Each app (Swiggy, Zomato, Uber, Ola,
Urban Company, etc.) only shows that app's own data. A rider who splits their week across two
platforms has no way to check if they've crossed the combined threshold until it's too late in
the financial year to fix it. Separately, unexplained pay deductions are one of the most common
sources of disputes, and workers have no easy way to build an evidence record for one.

**Who this helps:** gig and platform workers across India who are active on multiple apps and
have no visibility into a number that decides whether they qualify for benefits this year.

## The Solution

GigProof lets a worker upload screenshots or exports from each app they work on. It reads the
dates worked from each image using OCR, adds up qualifying days per aggregator, checks the
total against the legal 90/120-day rule, and shows a plain-language result — plus a downloadable
evidence-pack PDF they can keep or use in a dispute.

The core logic is **deterministic arithmetic against a legal rule**, not an AI judgment call.
This is intentional: it's demoable, verifiable, and doesn't depend on a model interpreting
anything — it's the same math a lawyer or a clerk would do by hand, just automated.

## User Flow

1. Worker opens the app and sees the rule explained in plain language.
2. Selects which apps they work on and uploads a screenshot for each.
3. OCR (Tesseract.js) reads dates directly from the images, in the browser.
4. Extracted dates are sent to a Lambda function that runs the eligibility calculation.
5. Result is shown: per-app day counts, combined total, and a clear qualify/not-yet verdict.
6. Worker can download a PDF summary as a personal evidence record.

## Architecture

Browser (frontend/index.html)
│
│ 1. Tesseract.js OCR runs client-side on uploaded images
│
▼
POST /hello ──────────────► API Gateway (local, via SAM)
│
▼
AWS Lambda (Node.js 22.x)
│
▼
Deterministic rules engine
(logic/rules-engine.js — pure function,
no external calls, fully testable)
│
▼
JSON result → back to browser
│
▼
jsPDF generates downloadable
evidence-pack PDF, client-side


**Authorization model (Cedar):** defined in `cedar-policies/worker-data-access.cedar`.
A worker can only ever view their own eligibility result. A compliance-reviewer role (for an
aggregator's internal compliance team, in a future version) may see aggregate statistics only —
`forbid` rules explicitly block that role from ever viewing raw uploaded documents or
individual-level data. In Cedar, `forbid` always overrides `permit`, so this is a hard boundary,
not a convention. Full schema in `cedar-policies/schema.cedarschema`.

## Built on AWS (Build It track — open-source, local, no account/card required)

- **AWS SAM CLI** — the entire backend is defined as a SAM template (`template.yaml`) and built/run
  locally with `sam build` and `sam local start-api`, which emulates Lambda and API Gateway in
  Docker containers on our own machine.
- **AWS Lambda** — the eligibility rules engine runs as a real Lambda handler (`app.mjs`), invoked
  through a local API Gateway emulation, with a Node.js 22.x runtime.
- **Amazon API Gateway** (local emulation via SAM) — exposes the Lambda as a `POST /hello` HTTP
  endpoint the frontend calls.
- **Cedar** — defines the authorization policy for worker data access (see above).

No AWS account was required to build or run any of this — everything above runs entirely on
`localhost` via the AWS open-source tooling, matching the Build It track's "no account, no card,
no bill" model.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Plain HTML/CSS/JavaScript |
| OCR | Tesseract.js (open source, runs client-side) |
| Backend | AWS Lambda (Node.js 22.x) via AWS SAM |
| API | Amazon API Gateway (local, via `sam local start-api`) |
| Authorization | Cedar policy + schema |
| PDF export | jsPDF |
| Legal rule | Social Security (Central) Rules, 2026 (notified 8 May 2026) |

## What We Learned

- First time using AWS SAM CLI end-to-end: template authoring, local Lambda builds, and running
  API Gateway locally via Docker.
- Ran into and fixed real issues along the way: ESM vs CommonJS module conflicts in a Lambda
  handler, SAM's build caching not picking up source changes, API Gateway method mismatches
  (GET vs POST), and CORS configuration for a browser-based frontend calling a local API.
- First time writing a Cedar policy and thinking through an authorization boundary for
  sensitive personal financial data.
- Learned that OCR accuracy depends heavily on image quality and format — real screenshots would
  need more robust date-format handling than our current regex-based parser.

## Limitations (honest, by design)

- Date extraction currently uses regex pattern-matching on OCR output; it handles common date
  formats (YYYY-MM-DD, DD-MM-YYYY) but would need to be more robust for messy real-world
  screenshots with inconsistent formatting.
- The Cedar policy defines the intended access boundary but is not yet wired into a live
  multi-user authentication system — this is the natural next step for a production version.
- Deduction-flagging (identifying unexplained pay deductions) is designed but not yet implemented
  in this build.
- This is a prototype. It does not connect to any official government or aggregator system, and
  does not constitute legal advice — this is stated directly in the app's UI.

## Running It Locally

```bash
# Backend
cd gigproof-backend
sam build
sam local start-api

# Frontend — in a separate terminal, just open frontend/index.html in a browser
```

## Team

- Team Sapphire [MK3F76]

---

*GigProof is a prototype built in four days. It is not an official government tool.*