// SMS Guard — a real Naive Bayes text classifier, trained in the browser.
// Pure module: works in Node (module.exports) and in the browser (window.SmsGuard).
// No network, no server, no external model — training happens on page load
// from the hand-labeled DATASET below.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SmsGuard = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // DATASET — hand-labeled by the author (Mohd Raja) for this project.
  // 120 short messages: 60 scam/spam, 60 legitimate. Written from scratch;
  // no real phone numbers, no real people's messages, no copied dataset.
  // Labels: 'scam' = fraud / spam / phishing-style message; 'ham' = normal.
  // ---------------------------------------------------------------------------
  const DATASET = [
    // ---- SCAM / SPAM (60) ----
    { label: 'scam', text: 'Congratulations! You have won a free iPhone. Click here to claim your prize now' },
    { label: 'scam', text: 'Your bank account has been blocked. Verify your details immediately to unlock it' },
    { label: 'scam', text: 'Urgent: your KYC is pending. Update now or your account will be closed today' },
    { label: 'scam', text: 'You won 50000 rupees in a lucky draw. Send your bank details to receive the prize' },
    { label: 'scam', text: 'Dear customer your electricity bill is unpaid. Pay now or power will be cut tonight' },
    { label: 'scam', text: 'Your parcel is held at customs. Pay 499 rupees delivery fee to release it' },
    { label: 'scam', text: 'Get rich quick! Invest 5000 and double your money in 7 days guaranteed returns' },
    { label: 'scam', text: 'Your UPI account will be suspended. Click the link to verify your PIN' },
    { label: 'scam', text: 'Free recharge offer! Recharge of 299 free for first 100 users only, claim now' },
    { label: 'scam', text: 'You have received a lottery prize of 10 lakh. Share OTP to claim' },
    { label: 'scam', text: 'Job offer! Earn 3000 per day from home. No investment needed, WhatsApp us now' },
    { label: 'scam', text: 'Your Aadhaar card will be blocked. Call this number to update your details' },
    { label: 'scam', text: 'Alert: suspicious login detected on your account. Confirm your password here' },
    { label: 'scam', text: 'Congratulations you are selected for a cashback of 9999. Click to redeem' },
    { label: 'scam', text: 'Your PAN card is invalid. Update it now to avoid penalty of 10000 rupees' },
    { label: 'scam', text: 'Win a free trip to Dubai! Just pay 999 registration fee to confirm your seat' },
    { label: 'scam', text: 'Your loan of 2 lakh is approved instantly. Pay processing fee 1500 first' },
    { label: 'scam', text: 'Dear user your SIM will be deactivated in 24 hours. Recharge now to continue' },
    { label: 'scam', text: 'You have an unpaid traffic challan of 2000. Pay online now to avoid court' },
    { label: 'scam', text: 'Get a personal loan at 0 percent interest. Limited offer, apply now' },
    { label: 'scam', text: 'Your credit card reward points are expiring. Redeem them now before they lapse' },
    { label: 'scam', text: 'Work from home and earn 50000 per month. Join now, only 20 seats left' },
    { label: 'scam', text: 'Your account has won a gift voucher worth 5000. Claim before midnight' },
    { label: 'scam', text: 'Verify your wallet now or your money will be frozen by the bank' },
    { label: 'scam', text: 'You are eligible for a government subsidy of 25000. Fill the form to claim' },
    { label: 'scam', text: 'Your OTP is 482913. Share it with our agent to complete verification' },
    { label: 'scam', text: 'Free crypto giveaway! Send 0.01 BTC and get 0.1 BTC back instantly' },
    { label: 'scam', text: 'Your Amazon order could not be delivered. Update your address and pay redelivery fee' },
    { label: 'scam', text: 'Urgent notice: your income tax refund of 18450 is pending. Verify bank details' },
    { label: 'scam', text: 'You have been selected for a free laptop under the student scheme. Pay courier charges' },
    { label: 'scam', text: 'Your WhatsApp account will expire today. Renew now by clicking this link' },
    { label: 'scam', text: 'Double your money in 30 days with our trading plan. 100 percent guaranteed profit' },
    { label: 'scam', text: 'Dear customer your gas connection will be disconnected. Pay the pending bill now' },
    { label: 'scam', text: 'You won a brand new car in the festival lucky draw. Pay tax 9999 to claim' },
    { label: 'scam', text: 'Your mobile number has won 25000 cashback. Send your UPI ID to receive it' },
    { label: 'scam', text: 'Act now! Your insurance policy will lapse. Renew with a special discount today' },
    { label: 'scam', text: 'Get instant cash loan up to 5 lakh without documents. Apply in 2 minutes' },
    { label: 'scam', text: 'Your Netflix subscription has expired. Update payment details to continue watching' },
    { label: 'scam', text: 'Congratulations! Your number is selected for a 1 lakh shopping voucher' },
    { label: 'scam', text: 'Bank alert: your debit card is blocked due to KYC. Call to unblock' },
    { label: 'scam', text: 'Earn money by liking videos. 500 per day, join our Telegram group now' },
    { label: 'scam', text: 'Your electricity meter will be replaced. Pay 750 installation charge online' },
    { label: 'scam', text: 'You have a pending courier delivery. Pay 199 customs duty to receive your package' },
    { label: 'scam', text: 'Free gift for loyal customers! Claim your smartwatch by paying delivery charges' },
    { label: 'scam', text: 'Your PF account has 85000 unclaimed. Withdraw now by submitting your details' },
    { label: 'scam', text: 'Alert! Your Facebook account will be deleted in 48 hours. Verify now' },
    { label: 'scam', text: 'You are our lucky winner! Claim 75000 by sharing your bank account number' },
    { label: 'scam', text: 'Pay 499 to activate your free health insurance policy worth 5 lakh' },
    { label: 'scam', text: 'Your train ticket is confirmed. Pay extra 299 for seat confirmation' },
    { label: 'scam', text: 'Urgent: your child school fee is pending. Pay now through this link' },
    { label: 'scam', text: 'Get 90 percent off on branded shoes. Limited stock, order now' },
    { label: 'scam', text: 'Your ration card benefit of 10000 is ready. Link your bank account to claim' },
    { label: 'scam', text: 'Congratulations you won a gold coin in our lucky draw. Pay making charges to collect' },
    { label: 'scam', text: 'Your demat account will be closed. Update your nominee details immediately' },
    { label: 'scam', text: 'Win 20000 by playing our quiz. Entry fee only 99 rupees' },
    { label: 'scam', text: 'Your water bill is overdue. Pay now or supply will be disconnected tomorrow' },
    { label: 'scam', text: 'You have received 10000 cashback on your last recharge. Claim it now' },
    { label: 'scam', text: 'Your mobile tower installation offer is approved. Pay registration fee 2500' },
    { label: 'scam', text: 'Alert: your email account has been hacked. Reset your password using this link' },
    { label: 'scam', text: 'Get a free SIM with unlimited data for 1 year. Activate now' },
    // ---- HAM / LEGITIMATE (60) ----
    { label: 'ham', text: 'Hi, are we still meeting for lunch tomorrow at 1 pm near the college' },
    { label: 'ham', text: 'Mom, I reached the hostel safely. I will call you in the evening' },
    { label: 'ham', text: 'Your order has been delivered. Thank you for shopping with us' },
    { label: 'ham', text: 'Reminder: your class starts at 10 am tomorrow. Please bring your notebook' },
    { label: 'ham', text: 'Happy birthday! Hope you have a wonderful day with your family' },
    { label: 'ham', text: 'Your appointment with Dr Sharma is confirmed for Friday at 4 pm' },
    { label: 'ham', text: 'Please send me the notes from yesterday lecture when you get time' },
    { label: 'ham', text: 'The train is delayed by 30 minutes. I will reach home late tonight' },
    { label: 'ham', text: 'Your electricity bill of 845 rupees is due on 5th December' },
    { label: 'ham', text: 'Hi sir, I have submitted my assignment on the college portal' },
    { label: 'ham', text: 'Can you pick up milk and bread on your way home today' },
    { label: 'ham', text: 'Your OTP for login is 739201. Do not share it with anyone' },
    { label: 'ham', text: 'The exam timetable has been uploaded on the university website' },
    { label: 'ham', text: 'Good morning! The meeting is shifted to 3 pm in room 204' },
    { label: 'ham', text: 'Your recharge of 199 rupees was successful. Validity 28 days' },
    { label: 'ham', text: 'Thanks for your help yesterday. Let us study together this weekend' },
    { label: 'ham', text: 'Your parcel will arrive today between 2 pm and 5 pm' },
    { label: 'ham', text: 'Please confirm if you can attend the family function on Sunday' },
    { label: 'ham', text: 'The library will remain closed tomorrow for maintenance work' },
    { label: 'ham', text: 'Your bus ticket from Pune to Mumbai is booked for Saturday morning' },
    { label: 'ham', text: 'Hi, I left my umbrella at your place. I will collect it tomorrow' },
    { label: 'ham', text: 'Your bank balance is 12450 rupees as of today' },
    { label: 'ham', text: 'Reminder: fee payment last date is 30th November. Please pay at the office' },
    { label: 'ham', text: 'The cricket match starts at 7 pm. Are you coming to watch it' },
    { label: 'ham', text: 'Your leave application has been approved for 2 days' },
    { label: 'ham', text: 'Please bring the project report printout to the lab tomorrow' },
    { label: 'ham', text: 'Your flight is on time. Boarding starts at 6:30 am from gate 12' },
    { label: 'ham', text: 'Hi, the shop will open at 9 am tomorrow as usual' },
    { label: 'ham', text: 'Your subscription renews on 1st January. No action is needed' },
    { label: 'ham', text: 'Thank you for visiting our clinic. Your next visit is next month' },
    { label: 'ham', text: 'The workshop on AI starts at 11 am in the seminar hall' },
    { label: 'ham', text: 'Can we reschedule our call to Thursday evening instead' },
    { label: 'ham', text: 'Your payment of 500 rupees to Ramesh has been received' },
    { label: 'ham', text: 'Good luck for your exams! Study well and take care' },
    { label: 'ham', text: 'The water supply will be stopped from 10 am to 2 pm for repair work' },
    { label: 'ham', text: 'Your new password has been set successfully' },
    { label: 'ham', text: 'Hi, I am outside the gate. Please come and collect the package' },
    { label: 'ham', text: 'Your test results will be declared on the college notice board' },
    { label: 'ham', text: 'Please find the meeting link for tomorrow online class attached' },
    { label: 'ham', text: 'Your gas cylinder booking is confirmed. Delivery in 2 days' },
    { label: 'ham', text: 'Happy Diwali! Wishing you and your family a joyful festival' },
    { label: 'ham', text: 'The college fest auditions are open. Register before Friday' },
    { label: 'ham', text: 'Your salary for November has been credited to your account' },
    { label: 'ham', text: 'Reminder: parent teacher meeting is on Saturday at 11 am' },
    { label: 'ham', text: 'I will be late by 15 minutes due to traffic' },
    { label: 'ham', text: 'Your return request has been accepted. Pickup is scheduled for Monday' },
    { label: 'ham', text: 'Please share your address so I can send the courier' },
    { label: 'ham', text: 'The new timetable is available in the student app' },
    { label: 'ham', text: 'Your feedback is important to us. Please rate your experience' },
    { label: 'ham', text: 'Hi, the assignment deadline is extended to next Monday' },
    { label: 'ham', text: 'Your movie tickets for Sunday 7 pm show are booked' },
    { label: 'ham', text: 'The hostel warden has called a meeting at 6 pm today' },
    { label: 'ham', text: 'Your refund of 299 rupees has been processed to your account' },
    { label: 'ham', text: 'Please carry your ID card for the exam tomorrow' },
    { label: 'ham', text: 'Your food order is being prepared and will arrive in 30 minutes' },
    { label: 'ham', text: 'The sports day practice starts at 4 pm on the ground' },
    { label: 'ham', text: 'Hi, I have sent you the photos from yesterday trip' },
    { label: 'ham', text: 'Your internet plan has been renewed for one month' },
    { label: 'ham', text: 'Thank you for your payment. Your receipt is attached' },
    { label: 'ham', text: 'The guest lecture on cybersecurity is at 2 pm in the auditorium' },
  ];

  // ---------------------------------------------------------------------------
  // Tokenizer: lowercase, keep letters/digits, drop tokens shorter than 2 chars.
  // ---------------------------------------------------------------------------
  function tokenize(text) {
    if (typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(function (t) { return t.length >= 2; });
  }

  // ---------------------------------------------------------------------------
  // Multinomial Naive Bayes with Laplace smoothing (alpha = 1).
  // P(label) * product over tokens of P(token | label), computed in log space.
  // ---------------------------------------------------------------------------
  function NaiveBayes(alpha) {
    this.alpha = alpha || 1;
    this.labels = [];
    this.docCount = {};      // label -> number of training docs
    this.tokenCount = {};    // label -> total tokens
    this.wordCount = {};     // label -> { word -> count }
    this.vocab = {};         // word -> true
    this.totalDocs = 0;
  }

  NaiveBayes.prototype.train = function (examples) {
    const self = this;
    examples.forEach(function (ex) {
      const label = ex.label;
      if (self.labels.indexOf(label) === -1) {
        self.labels.push(label);
        self.docCount[label] = 0;
        self.tokenCount[label] = 0;
        self.wordCount[label] = {};
      }
      self.docCount[label] += 1;
      self.totalDocs += 1;
      tokenize(ex.text).forEach(function (tok) {
        self.vocab[tok] = true;
        self.wordCount[label][tok] = (self.wordCount[label][tok] || 0) + 1;
        self.tokenCount[label] += 1;
      });
    });
    return this;
  };

  NaiveBayes.prototype.vocabSize = function () {
    return Object.keys(this.vocab).length;
  };

  // log P(word | label) with Laplace smoothing
  NaiveBayes.prototype.logWordProb = function (word, label) {
    const count = (this.wordCount[label] && this.wordCount[label][word]) || 0;
    return Math.log((count + this.alpha) / (this.tokenCount[label] + this.alpha * this.vocabSize()));
  };

  NaiveBayes.prototype.predict = function (text) {
    const tokens = tokenize(text);
    if (tokens.length === 0) {
      return { label: null, confidence: 0, reason: 'empty', tokens: [], contributions: [] };
    }
    const scores = {};
    const self = this;
    this.labels.forEach(function (label) {
      let s = Math.log(self.docCount[label] / self.totalDocs);
      tokens.forEach(function (tok) { s += self.logWordProb(tok, label); });
      scores[label] = s;
    });
    // Softmax over log-scores -> honest probability (0..1), not a fake %.
    let max = -Infinity;
    this.labels.forEach(function (l) { if (scores[l] > max) max = scores[l]; });
    let denom = 0;
    const probs = {};
    this.labels.forEach(function (l) {
      probs[l] = Math.exp(scores[l] - max);
      denom += probs[l];
    });
    this.labels.forEach(function (l) { probs[l] /= denom; });

    let best = this.labels[0];
    this.labels.forEach(function (l) { if (probs[l] > probs[best]) best = l; });

    // Word-level explanation: how much each token pushes toward 'scam'
    // vs 'ham' (difference of log-probs). Only tokens seen in training count.
    const other = best === 'scam' ? 'ham' : 'scam';
    const contributions = tokens
      .filter(function (t, i) { return tokens.indexOf(t) === i; })
      .map(function (tok) {
        const c = self.logWordProb(tok, 'scam') - self.logWordProb(tok, 'ham');
        return { word: tok, towardsScam: c };
      })
      .sort(function (a, b) { return Math.abs(b.towardsScam) - Math.abs(a.towardsScam); })
      .slice(0, 8);

    return {
      label: best,
      confidence: probs[best],
      probs: probs,
      tokens: tokens,
      contributions: contributions,
      reason: 'ok',
    };
  };

  // Deterministic held-out evaluation: every 5th example (i % 5 === 4) is test.
  // The model is trained on the other 80% and scored on the 20% it never saw.
  function evaluate() {
    const train = [], test = [];
    DATASET.forEach(function (ex, i) {
      if (i % 5 === 4) test.push(ex); else train.push(ex);
    });
    const model = new NaiveBayes(1).train(train);
    let correct = 0;
    const confusion = { scamAsScam: 0, scamAsHam: 0, hamAsHam: 0, hamAsScam: 0 };
    test.forEach(function (ex) {
      const pred = model.predict(ex.text).label;
      if (pred === ex.label) correct += 1;
      if (ex.label === 'scam' && pred === 'scam') confusion.scamAsScam += 1;
      if (ex.label === 'scam' && pred === 'ham') confusion.scamAsHam += 1;
      if (ex.label === 'ham' && pred === 'ham') confusion.hamAsHam += 1;
      if (ex.label === 'ham' && pred === 'scam') confusion.hamAsScam += 1;
    });
    return {
      trainSize: train.length,
      testSize: test.length,
      correct: correct,
      accuracy: test.length ? correct / test.length : 0,
      confusion: confusion,
    };
  }

  function buildModel() {
    return new NaiveBayes(1).train(DATASET);
  }

  return {
    DATASET: DATASET,
    tokenize: tokenize,
    NaiveBayes: NaiveBayes,
    evaluate: evaluate,
    buildModel: buildModel,
  };
});
