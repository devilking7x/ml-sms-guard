# Devpost Draft — ML Empowerment Build Challenge 4.0 (DO NOT SUBMIT — draft only)

> Status: DRAFT. Not submitted. Parent to submit on Devpost before 2 Dec 2026, 1:15pm IST.
> Live demo verified working: https://devilking7x.github.io/ml-sms-guard/
> Repo: https://github.com/devilking7x/ml-sms-guard

## Title

SMS Guard — Real Naive Bayes Scam-Message Detector

## Tagline

A small, honest ML app that spots scam SMS and shows its work, word by word.

## Description

### Problem Statement

Scam SMS messages are a daily social problem in India. Fake KYC, parcel, lottery, loan and "account blocked" messages trick people — often first-time smartphone users and older family members — into sharing OTPs, passwords and bank details. Most people have no tool that explains *why* a message is suspicious; they either ignore real warnings or fall for convincing fakes.

### Solution Overview

SMS Guard is a client-side machine-learning app that classifies SMS-style messages as scam/spam or normal, and — crucially — explains its decision. It uses a real Multinomial Naive Bayes classifier (Laplace smoothing, α = 1) trained in the browser on 120 hand-labeled messages written by the author (60 scam, 60 legitimate). For every message it shows a confidence score (a real softmax probability) and each word's contribution to the decision, so users learn the patterns scammers use instead of blindly trusting a black box.

### Key Features

- Real ML, not a mockup: Naive Bayes trained live in the browser on a hand-labeled 120-message dataset (513-word vocabulary).
- Word-level explanations: every word's log-probability contribution shown, colour-coded toward scam or normal.
- Honest, verifiable evaluation: deterministic held-out test (every 5th message) recomputed live on the page — 20/24 correct = 83.3% accuracy (scam caught 11/12, ham kept 9/12). Anyone can verify with `SmsGuard.evaluate()` in DevTools.
- One-click example messages (obvious scam, KYC scam, normal chat, delivery update).
- Clear limits stated in the app itself: small dataset, English SMS-style text only, a learning demo — not a security product.
- 100% client-side: no server, no tracking, no data leaves the device. Works offline once loaded.

### Technologies Used

Plain HTML, CSS and JavaScript (no frameworks, no build step, no runtime dependencies). Node.js tests (`node --test`, 9 tests) and a Playwright smoke test.

### Target Users

Everyday phone users in India who receive suspicious SMS — especially students, first-time smartphone users and older family members — plus ML beginners who want to see a real, understandable classifier instead of a black box.

## Built With

- HTML
- CSS
- JavaScript
- Machine Learning (Naive Bayes)

## Try it out links

- Live demo: https://devilking7x.github.io/ml-sms-guard/
- Source code: https://github.com/devilking7x/ml-sms-guard

## Testing instructions (for judges)

1. Open https://devilking7x.github.io/ml-sms-guard/ — no install, no sign-up.
2. Click "🚨 Obvious scam" — expect a SCAM verdict with high confidence and red word chips (e.g. won, prize, claim).
3. Click "✅ Normal message" — expect a NORMAL verdict with green word chips.
4. Paste your own message (e.g. "Your KYC is pending, update now or your account will be closed") and click "Check message".
5. Scroll to "How the model works" — the held-out accuracy (83.3%) is recomputed live; verify in DevTools console with `SmsGuard.evaluate()`.
6. Tests: clone the repo and run `node --test tests/classifier.test.js` (9 tests, all passing).

## Team

Solo — Mohd Raja (devilking7x), student.
