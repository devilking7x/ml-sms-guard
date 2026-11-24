# SMS Guard — Real Naive Bayes Scam-Message Detector

A small, honest machine-learning web app built for the **ML Empowerment Build Challenge 4.0** (Devpost). It classifies SMS-style messages as **scam/spam** or **normal (ham)** using a real Naive Bayes classifier trained in your browser — and explains every decision word by word.

**Live demo:** https://devilking7x.github.io/ml-sms-guard/
**Hackathon:** https://ml-build-challenge-4.devpost.com/ (solo entry, Mohd Raja)

## What it does

- Paste any SMS-style message → the model predicts **scam/spam** or **normal**, with a confidence score (a real softmax probability, not a made-up percentage).
- **Word-level explanations:** every word's contribution (log P(word|scam) − log P(word|ham)) is shown, so you can see exactly which words pushed the decision.
- **Live, verifiable evaluation:** the page recomputes a held-out test on every load. Open DevTools and run `SmsGuard.evaluate()` to check it yourself.
- Runs 100% client-side — no server, no tracking, no data leaves your device.

## How the model works

1. **Training data:** 120 short messages, hand-labeled by the author — 60 scam/spam, 60 legitimate. Written from scratch for this project; no copied dataset, no real people's messages, no real phone numbers.
2. **Algorithm:** Multinomial Naive Bayes with Laplace smoothing (α = 1). It learns P(word | scam) and P(word | ham) from the training messages.
3. **Prediction:** log-probabilities are summed per word and converted with a softmax into a probability.
4. **Evaluation (deterministic, every 5th message held out):** trained on 96 messages, tested on 24 it never saw → **20/24 correct = 83.3% accuracy** (scam caught 11/12, ham kept 9/12).

## Files

| File | What it is |
|---|---|
| `index.html` | The app UI |
| `app.js` | Dataset + Naive Bayes classifier (pure module: works in Node and in the browser) |
| `styles.css` | Styling |
| `tests/classifier.test.js` | Node unit tests (`node --test`) |
| `tests/smoke.mjs` | Playwright smoke test (loads the page, checks console errors, tests both verdicts) |

## Run the tests

```bash
node --test tests/classifier.test.js   # 9 tests, all passing
node tests/smoke.mjs                   # Playwright smoke test (needs playwright-core + Chromium)
```

## Honest limits

- **Small dataset:** 120 messages is tiny. The model knows the patterns in these messages, not every scam in the world. A new scam wording it has never seen can slip through.
- **Not a security product:** a learning demo. Never rely on it alone to judge a real message — if a message asks for money, OTPs, passwords or bank details, treat it as suspicious regardless of what any app says.
- **English only, SMS-style text.** Long emails, other languages and heavily misspelled text score poorly.
- **Confidence is a model probability**, not a guarantee.

## Why this matters (Social Good)

Scam SMS messages are a real social problem in India — fake KYC, parcel, lottery and loan messages trick people into sharing OTPs and bank details every day. SMS Guard is a beginner-friendly, transparent demonstration that a small, understandable ML model can learn to recognise those patterns — and that understanding *why* it flags something matters as much as the flag itself.

## Built with

Plain HTML, CSS and JavaScript — no frameworks, no build step, no dependencies at runtime.

## Author

Mohd Raja ([devilking7x](https://github.com/devilking7x)) — solo entry, ML Empowerment Build Challenge 4.0.
