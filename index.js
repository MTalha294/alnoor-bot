const express = require('express');
const twilio = require('twilio');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ─── AL-NOOR BOT CONFIG ───────────────────────────────
const BOT_NAME = "Al-Noor Quran Academy";

const WELCOME_MSG = `🌙 *Assalamu Alaikum!*
*Al-Noor Quran Academy* mein khush amdeed!

Aap kya jaanna chahte hain? Reply karein:

1️⃣ Courses ki maloomat
2️⃣ Fee structure
3️⃣ Class timings
4️⃣ Teacher profiles
5️⃣ Admission / Enrollment
6️⃣ Online classes info

_Koi bhi number type karein ya apna sawal likhein._`;

// ─── AUTO REPLIES (keyword → response) ───────────────
const REPLIES = [
  {
    keywords: ['1', 'course', 'courses', 'class', 'nazra', 'tajweed', 'hifz', 'islamic'],
    reply: `📚 *Hamare Courses:*

1. *Nazra Quran*
   Quran sahi pronunciation ke saath parhna seekhein

2. *Tajweed ul Quran*
   Quran recitation ke rules seekhein

3. *Hifz Program*
   Quran memorization – step by step

4. *Islamic Studies*
   Fiqh, Hadees, Seerah, Duas

Kisi course ki detail ke liye us ka naam likhein! 🤲`
  },
  {
    keywords: ['2', 'fee', 'fees', 'faiz', 'payment', 'cost', 'price', 'kitni'],
    reply: `💰 *Fee Structure:*

• Nazra Quran → *1,500 PKR/month*
• Tajweed → *2,000 PKR/month*
• Hifz Program → *2,500 PKR/month*
• Islamic Studies → *1,500 PKR/month*

✅ *First month FREE trial!*
✅ No registration fee
✅ Monthly payment – koi advance nahi

Admission ke liye "5" type karein. 😊`
  },
  {
    keywords: ['3', 'timing', 'time', 'waqt', 'schedule', 'hours', 'kab'],
    reply: `⏰ *Class Timings:*

🌅 *Morning Batch:*
8:00 AM – 12:00 PM

🌆 *Evening Batch:*
4:00 PM – 8:00 PM

📅 Monday to Saturday
(Sunday off)

Aapki convenience ke mutabiq time select ho sakta hai.
Online aur in-person dono options hain! 💻`
  },
  {
    keywords: ['4', 'teacher', 'ustaad', 'faculty', 'staff', 'qualified'],
    reply: `👨‍🏫 *Hamare Teachers:*

• *Hafiz Muhammad Ali*
  Hifz specialist – 10 saal experience

• *Qari Abdullah*
  Tajweed expert – Egypt se trained

• *Maulana Yusuf*
  Islamic Studies – Darul Uloom graduate

Saare teachers:
✅ Hafiz e Quran
✅ Qualified & experienced
✅ Patient & friendly approach`
  },
  {
    keywords: ['5', 'admission', 'enroll', 'join', 'register', 'dakhla', 'apply'],
    reply: `📝 *Enrollment Process:*

Bas yeh 3 cheezein bhejein:
1. *Apna naam*
2. *Student ki umar*
3. *Desired course*

Hum 10 minutes mein call karein ge. Insha'Allah! ✅

Ya directly call karein:
📞 [YOUR_PHONE_NUMBER]

_Seats limited hain – abhi register karein!_ 🚀`
  },
  {
    keywords: ['6', 'online', 'zoom', 'live', 'video', 'internet', 'ghar'],
    reply: `💻 *Online Classes:*

Haan! Bilkul available hain! 🌍

✅ Zoom / WhatsApp Video pe class
✅ Live 1-on-1 sessions
✅ Screen share se Quran dekhna
✅ Recording bhi milti hai review ke liye
✅ Duniya mein kahin bhi parh sakte hain

Pakistan, UK, USA, Canada – sab ke liye! 🌐`
  },
  {
    keywords: ['salam', 'assalam', 'aoa', 'hello', 'hi', 'helo', 'hey'],
    reply: `Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! 🌙

Al-Noor Quran Academy mein aapka swagat hai!

Aap kya jaanna chahte hain?
1️⃣ Courses | 2️⃣ Fee | 3️⃣ Timing
4️⃣ Teachers | 5️⃣ Enroll | 6️⃣ Online`
  },
  {
    keywords: ['shukriya', 'thanks', 'thank', 'jazakallah', 'shukria'],
    reply: `Wa Iyyakum! 🤲
Jazakallahu Khairan!

Allah aapko aur aapke bachhon ko Quran ki barkat ata farmaye. Ameen! 🌙

Koi aur sawal ho to zaroor poochein. Hum hamesha available hain! 😊`
  },
];

// ─── SESSION STORE (in-memory) ────────────────────────
const sessions = {};

// ─── MAIN WEBHOOK ─────────────────────────────────────
app.post('/webhook', (req, res) => {
  const incomingMsg = (req.body.Body || '').trim().toLowerCase();
  const from = req.body.From; // e.g. whatsapp:+923001234567

  // Track session
  if (!sessions[from]) {
    sessions[from] = { count: 0, lastSeen: Date.now() };
  }
  sessions[from].count++;
  sessions[from].lastSeen = Date.now();

  let replyMsg = getReply(incomingMsg, sessions[from].count);

  // Send reply via Twilio MessagingResponse
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(replyMsg);

  res.type('text/xml');
  res.send(twiml.toString());

  console.log(`📨 From: ${from} | Msg: "${incomingMsg}" | Reply sent.`);
});

// ─── GET REPLY LOGIC ──────────────────────────────────
function getReply(msg, msgCount) {
  // First message → Welcome
  if (msgCount === 1) {
    return WELCOME_MSG;
  }

  // Match keywords
  for (const item of REPLIES) {
    if (item.keywords.some(kw => msg.includes(kw))) {
      return item.reply;
    }
  }

  // Default fallback
  return `Shukriya aapke sawal ke liye! 🙏

Mujhe samajh nahi aaya. Kripya yeh options mein se chunein:

1️⃣ Courses
2️⃣ Fee
3️⃣ Timing
4️⃣ Teachers
5️⃣ Enrollment
6️⃣ Online Classes

Ya directly call karein: 📞 [YOUR_PHONE_NUMBER]`;
}

// ─── HEALTH CHECK ─────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🕌 Al-Noor WhatsApp Bot is running! Alhamdulillah ✅');
});

// ─── START SERVER ─────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Al-Noor Bot running on port ${PORT}`);
});
