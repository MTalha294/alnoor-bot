const express = require('express');
const twilio = require('twilio');
const https = require('https');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const GMAIL_USER = process.env.GMAIL_USER;       // aapki gmail
const GMAIL_PASS = process.env.GMAIL_PASS;       // gmail app password

// ─── EMAIL NOTIFICATION ───────────────────────────────
async function sendEmailNotification(studentMsg, platform, contactId) {
  if (!GMAIL_USER || !GMAIL_PASS) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    }
  });

  const mailOptions = {
    from: GMAIL_USER,
    to: 'M.talhaofcl@gmail.com',
    subject: '🔔 Al-Noor — Naya Enrollment Request!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px;">
        <div style="background:#00a884;padding:20px;border-radius:8px;text-align:center;">
          <h1 style="color:white;margin:0;">🕌 Al-Noor Quran Academy</h1>
          <p style="color:white;margin:5px 0;">Naya Enrollment Request!</p>
        </div>
        <div style="background:white;padding:20px;margin-top:15px;border-radius:8px;border-left:4px solid #00a884;">
          <h2 style="color:#333;">📝 Student Details:</h2>
          <p><strong>Platform:</strong> ${platform}</p>
          <p><strong>Contact ID:</strong> ${contactId}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f0f0f0;padding:15px;border-radius:6px;font-size:16px;">
            "${studentMsg}"
          </div>
        </div>
        <div style="background:#e8f5e9;padding:15px;margin-top:15px;border-radius:8px;text-align:center;">
          <p style="color:#2e7d32;font-weight:bold;">⚡ Jaldi reply karein — student wait kar raha hai!</p>
          <p style="color:#555;">📞 03114272394</p>
        </div>
        <p style="color:#999;font-size:12px;text-align:center;margin-top:15px;">Al-Noor Bot — Automatic Notification</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email notification sent!');
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// ─── BOT MENU ─────────────────────────────────────────
const MAIN_MENU = `🕌 *Al-Noor Quran Academy*
_Assalamu Alaikum wa Rahmatullahi wa Barakatuh!_ 🌙

Apni zaroorat chunein:

📚 /courses — Hamare Courses
💰 /fee — Fee Structure  
⏰ /timing — Class Timings
📝 /enroll — Admission
💻 /online — Online Classes
🎓 /trial — 3 Din Free Trial
📞 /contact — Humse Rabta
❓ /help — Madad

_Koi bhi command likhein._`;

const REPLIES = {
  '/start': MAIN_MENU,
  '/menu': MAIN_MENU,
  '/help': MAIN_MENU,

  '/courses': `📚 *Hamare Courses*
━━━━━━━━━━━━━━━━━━

🔹 *Nazra Quran*
Quran sahi makharij aur pronunciation ke saath parhna. Beginners ke liye best.

🔹 *Tajweed ul Quran*
Quran recitation ke mukammal rules. Har huroof ki sahi ada.

🔹 *Hifz e Quran*
Step-by-step Quran memorization program. Dedicated Hafiz teachers.

🔹 *Islamic Studies*
Fiqh, Hadees, Seerah, Duas, aur Islamic etiquette.

🔹 *Arabic Language*
Quranic Arabic samajhna aur bolna.

━━━━━━━━━━━━━━━━━━
📝 Enroll: /enroll
💰 Fee dekhein: /fee`,

  '/fee': `💰 *Fee Structure*
━━━━━━━━━━━━━━━━━━

| Course | Monthly Fee |
|--------|------------|
| Nazra Quran | 1,500 PKR |
| Tajweed | 2,000 PKR |
| Hifz Program | 2,500 PKR |
| Islamic Studies | 1,500 PKR |
| Arabic Language | 2,000 PKR |

━━━━━━━━━━━━━━━━━━
✅ *Pehla mahina BILKUL FREE!*
✅ Koi registration fee nahi
✅ Monthly payment — advance nahi
✅ 2 courses = 10% discount

🎓 Free trial: /trial
📝 Enroll: /enroll`,

  '/timing': `⏰ *Class Timings*
━━━━━━━━━━━━━━━━━━

🌅 *Morning Batch*
8:00 AM — 12:00 PM

🌆 *Evening Batch*  
4:00 PM — 8:00 PM

🌙 *Night Batch (Online only)*
8:00 PM — 10:00 PM

📅 *Days:* Monday to Saturday
🗓️ Sunday: Off

━━━━━━━━━━━━━━━━━━
✅ Aapki marzi ka time select hoga
✅ Online aur in-person dono
✅ Flexible scheduling available

📝 Book karo: /enroll`,

  '/enroll': `📝 *Enrollment Process*
━━━━━━━━━━━━━━━━━━

Admission bohat asaan hai!

*Step 1:* Yeh info bhejein:
• 👤 Aapka naam
• 🎂 Student ki umar
• 📚 Desired course
• ⏰ Preferred timing

*Step 2:* Hum aapko call karein ge

*Step 3:* FREE trial class lein

*Step 4:* Pasand aaye to admission confirm karein ✅

━━━━━━━━━━━━━━━━━━
📞 Direct call: /contact
🎓 Free trial: /trial

_Abhi info bhejein — 10 minutes mein reply!_ ⚡`,

  '/online': `💻 *Online Classes*
━━━━━━━━━━━━━━━━━━

Ghar baithay parho — duniya mein kahin bhi! 🌍

*Platform:*
✅ Zoom
✅ WhatsApp Video Call
✅ Google Meet

*Features:*
✅ Live 1-on-1 sessions
✅ Screen share se Quran dekhna
✅ Class recording milti hai
✅ Digital course material
✅ Progress tracking

*Available For:*
🇵🇰 Pakistan
🇬🇧 UK
🇺🇸 USA  
🇨🇦 Canada
🇦🇺 Australia
🌍 Har jagah!

━━━━━━━━━━━━━━━━━━
📝 Enroll: /enroll`,

  '/trial': `🎓 *FREE 3-Din Trial Class*
━━━━━━━━━━━━━━━━━━

3 din BILKUL MUFT! 🎁

*Kya milega:*
✅ 3 din free classes
✅ Koi payment nahi
✅ Koi commitment nahi
✅ Pasand na aaye to chhoro

*Kaise lein:*
Bas yeh bhejein:
• Apna naam
• Student ki umar
• Course name
• Preferred timing

━━━━━━━━━━━━━━━━━━
📞 WhatsApp: 03114272394
_Abhi message karein — kal se class shuru!_ 🚀`,

  '/contact': `📞 *Humse Rabta Karein*
━━━━━━━━━━━━━━━━━━

📱 *WhatsApp:* 03114272394
📞 *Call:* 03114272394
📧 *Email:* M.talhaofcl@gmail.com

⏰ *Available:*
Mon-Sat: 8AM — 10PM
Sunday: 10AM — 6PM

━━━━━━━━━━━━━━━━━━
_Hum 10 minutes mein reply karte hain!_ ⚡`,
};

// ─── KEYWORD MATCHING ─────────────────────────────────
const KEYWORDS = [
  { words: ['fee', 'faiz', 'kitni', 'payment', 'cost'], cmd: '/fee' },
  { words: ['course', 'nazra', 'tajweed', 'hifz', 'islamic', 'arabic'], cmd: '/courses' },
  { words: ['timing', 'time', 'waqt', 'schedule', 'kab'], cmd: '/timing' },
  { words: ['enroll', 'admission', 'dakhla', 'join', 'register'], cmd: '/enroll' },
  { words: ['online', 'zoom', 'ghar', 'video', 'call'], cmd: '/online' },
  { words: ['trial', 'free', 'muft', 'test'], cmd: '/trial' },
  { words: ['contact', 'number', 'call', 'phone', 'rabta'], cmd: '/contact' },
  { words: ['salam', 'assalam', 'hello', 'hi', 'aoa', 'hey'], cmd: '/start' },
];

// ─── ENROLLMENT DETECTION ─────────────────────────────
function isEnrollmentDetails(msg) {
  const text = msg.toLowerCase();
  // Check if message has name + age/number pattern
  const hasName = text.length > 5;
  const hasAge = /\d+/.test(text);
  const enrollKeywords = ['naam', 'name', 'saal', 'year', 'umar', 'age', 'course', 'nazra', 'tajweed', 'hifz', 'islamic', 'online', 'morning', 'evening'];
  const hasKeyword = enrollKeywords.some(k => text.includes(k));
  return hasAge && hasKeyword && hasName;
}

function notifyAdmin(studentName, studentMsg, platform, contactId) {
  // Telegram notification
  if (ADMIN_CHAT_ID) {
    const notification = `🔔 *NAYA ENROLLMENT REQUEST!*
━━━━━━━━━━━━━━━━━━
👤 *Platform:* ${platform}
📱 *Contact:* ${contactId}
📝 *Student ka message:*
"${studentMsg}"
━━━━━━━━━━━━━━━━━━
⚡ _Jaldi reply karein!_`;
    sendTelegram(ADMIN_CHAT_ID, notification);
  }
  // Email notification
  sendEmailNotification(studentMsg, platform, contactId);
}


const sessions = {};

function getReply(msg) {
  const text = (msg || '').trim().toLowerCase();

  // Command match
  if (REPLIES[text]) return REPLIES[text];

  // Keyword match
  for (const item of KEYWORDS) {
    if (item.words.some(w => text.includes(w))) {
      return REPLIES[item.cmd];
    }
  }

  // Shukriya
  if (['shukriya', 'thanks', 'jazakallah', 'shukria', 'thank'].some(w => text.includes(w))) {
    return `Wa Iyyakum! 🤲\n*Jazakallahu Khairan!*\n\nAllah aapko aur aapke ghar walon ko Quran ki barkat ata farmaye. Ameen! 🌙\n\nKoi aur sawal: /menu`;
  }

  return `🤔 Mujhe samajh nahi aaya.\n\nKripya /menu se option chunein ya seedha likhein:\n*fee, courses, timing, teachers, enroll, online*`;
}

// ─── WHATSAPP WEBHOOK ─────────────────────────────────
app.post('/webhook', (req, res) => {
  const msg = (req.body.Body || '').trim();
  const from = req.body.From;
  if (!sessions[from]) sessions[from] = { count: 0 };
  sessions[from].count++;
  const reply = sessions[from].count === 1 ? REPLIES['/start'] : getReply(msg);
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(reply);
  res.type('text/xml');
  res.send(twiml.toString());
});

// ─── TELEGRAM ─────────────────────────────────────────
app.post('/telegram', (req, res) => {
  const body = req.body;
  if (!body.message) return res.sendStatus(200);
  const chatId = body.message.chat.id;
  const msg = body.message.text || '';
  const firstName = body.message.from?.first_name || 'Student';

  if (!sessions[chatId]) sessions[chatId] = { count: 0, awaitingEnroll: false };
  sessions[chatId].count++;

  let reply;

  // First message
  if (sessions[chatId].count === 1 || msg === '/start') {
    sessions[chatId].awaitingEnroll = false;
    reply = `Wa Alaikum Assalam *${firstName}*! 🌙\n\n` + REPLIES['/start'];
  }
  // Enrollment command — set awaiting mode
  else if (msg === '/enroll' || msg === '/trial') {
    sessions[chatId].awaitingEnroll = true;
    reply = REPLIES[msg];
  }
  // If student is in enrollment mode and sends details
  else if (sessions[chatId].awaitingEnroll && isEnrollmentDetails(msg)) {
    sessions[chatId].awaitingEnroll = false;
    // Notify admin
    notifyAdmin(firstName, msg, 'Telegram', `@${body.message.from?.username || chatId}`);
    reply = `✅ *Shukriya ${firstName}!*

Aapki details mil gayi hain! 📝

Hum *10 minutes* mein aapse rabta karein ge. Insha'Allah! 🤲

📞 Ya seedha call karein: *03114272394*

_Jazakallahu Khairan!_ 🌙`;
  }
  else {
    reply = getReply(msg);
    // Also check keywords for enrollment intent
    if (['enroll', 'admission', 'join', 'register', 'dakhla'].some(w => msg.toLowerCase().includes(w))) {
      sessions[chatId].awaitingEnroll = true;
    }
  }

  sendTelegram(chatId, reply);
  res.sendStatus(200);
});

function sendTelegram(chatId, text) {
  const data = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  };
  const req = https.request(options);
  req.write(data);
  req.end();
}

// ─── SETUP TELEGRAM ───────────────────────────────────
app.get('/setup-telegram', (req, res) => {
  const url = `https://${req.get('host')}/telegram`;
  https.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${url}`, (r) => {
    let data = '';
    r.on('data', chunk => data += chunk);
    r.on('end', () => res.send(`✅ Telegram ready! ${data}`));
  });
});

app.get('/', (req, res) => res.send('🕌 Al-Noor Bot Running! ✅'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Al-Noor Bot on port ${PORT}`));
