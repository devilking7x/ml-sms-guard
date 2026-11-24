// Node tests for the SMS Guard classifier core logic.
// Run: node --test tests/classifier.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { DATASET, tokenize, NaiveBayes, evaluate, buildModel } = require('../app.js');

test('dataset is balanced and hand-labeled (120 messages, 60/60)', () => {
  assert.equal(DATASET.length, 120);
  assert.equal(DATASET.filter((d) => d.label === 'scam').length, 60);
  assert.equal(DATASET.filter((d) => d.label === 'ham').length, 60);
  for (const d of DATASET) {
    assert.ok(d.text.length > 10, 'message too short: ' + d.text);
    assert.ok(['scam', 'ham'].includes(d.label));
  }
});

test('tokenizer lowercases, strips punctuation, drops 1-char tokens', () => {
  assert.deepEqual(tokenize('Hello, WORLD! a b test123'), ['hello', 'world', 'test123']);
  assert.deepEqual(tokenize(''), []);
  assert.deepEqual(tokenize(null), []);
  assert.deepEqual(tokenize(42), []);
});

test('model trains and learns a non-trivial vocabulary', () => {
  const model = buildModel();
  assert.ok(model.vocabSize() > 200, 'vocab too small: ' + model.vocabSize());
  assert.equal(model.totalDocs, 120);
});

test('predicts known scam examples as scam', () => {
  const model = buildModel();
  const scams = [
    'Congratulations! You have won a free iPhone. Click here to claim your prize now',
    'Your bank account has been blocked. Verify your details immediately to unlock it',
    'Free crypto giveaway! Send 0.01 BTC and get 0.1 BTC back instantly',
  ];
  for (const s of scams) {
    const p = model.predict(s);
    assert.equal(p.label, 'scam', 'missed scam: ' + s);
    assert.ok(p.confidence > 0.5);
  }
});

test('predicts known ham examples as ham', () => {
  const model = buildModel();
  const hams = [
    'Hi, are we still meeting for lunch tomorrow at 1 pm near the college',
    'Mom, I reached the hostel safely. I will call you in the evening',
    'Your order has been delivered. Thank you for shopping with us',
  ];
  for (const s of hams) {
    const p = model.predict(s);
    assert.equal(p.label, 'ham', 'false positive: ' + s);
    assert.ok(p.confidence > 0.5);
  }
});

test('handles empty, whitespace, and odd input without crashing', () => {
  const model = buildModel();
  assert.equal(model.predict('').reason, 'empty');
  assert.equal(model.predict('   ').reason, 'empty');
  assert.equal(model.predict('!!! ???').reason, 'empty');
  const weird = model.predict('zzzz qqqq unknownwordz 12345');
  assert.ok(['scam', 'ham'].includes(weird.label));
  assert.ok(weird.confidence >= 0.5 && weird.confidence <= 1);
});

test('probabilities are honest (sum to 1, in range)', () => {
  const model = buildModel();
  const p = model.predict('Your account will be blocked, click to verify now');
  const sum = p.probs.scam + p.probs.ham;
  assert.ok(Math.abs(sum - 1) < 1e-9, 'probs sum to ' + sum);
  assert.ok(p.probs.scam >= 0 && p.probs.scam <= 1);
});

test('explanations list the words that drove the decision', () => {
  const model = buildModel();
  const p = model.predict('Congratulations you won a free prize, click to claim');
  assert.ok(p.contributions.length > 0);
  assert.ok(p.contributions.every((c) => typeof c.word === 'string' && typeof c.towardsScam === 'number'));
  // 'won'/'prize'/'claim' should push toward scam
  const top = p.contributions[0];
  assert.ok(Math.abs(top.towardsScam) > 0);
});

test('held-out evaluation beats chance and is reported honestly', () => {
  const ev = evaluate();
  assert.equal(ev.testSize, 24);
  assert.equal(ev.trainSize, 96);
  assert.ok(ev.accuracy > 0.7, 'held-out accuracy too low: ' + ev.accuracy);
  assert.equal(ev.correct, ev.confusion.scamAsScam + ev.confusion.hamAsHam);
  console.log('held-out accuracy: ' + (ev.accuracy * 100).toFixed(1) + '% (' + ev.correct + '/' + ev.testSize + ')');
});
