const express = require('express');
const twilio = require('twilio');
const https = require('https');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// ─── EMAIL ────────────────────────────────────────────
async function sendEmailNotification(studentMsg, platform, contactId) {
  if (!GMAIL_USER || !GMAIL_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"Al-Noor Bot" <${GMAIL_USER}>`,
      to: 'M.talhaofcl@gmail.com',
      subject: '🔔 Al-Noor — Naya Enrollment Request!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px;">
          <div style="background:#1a6b3c;padding:20px;border-radius:8px;text-align:center;">
            <h1 style="color:white;margin:0;">🕌 Al-Noor Quran Academy</h1>
            <p style="color:#ccc;margin:5px 0;">Naya Enrollment Request!</p>
          </div>
          <div style="background:white;padding:20px;margin-top:15px;border-radius:8px;border-left:4px solid #1a6b3c;">
            <h2 style="color:#333;">📝 Student Details:</h2>
            <p><strong>Platform:</strong> ${platform}</p>
            <p><strong>Contact:</strong> ${contactId}</p>
            <p><strong>Message:</strong></p>
            <div style="background:#f0f0f0;padding:15px;border-radius:6px;font-size:16px;">"${studentMsg}"</div>
          </div>
          <div style="background:#e8f5e9;padding:15px;margin-top:15px;border-radius:8px;text-align:center;">
            <p style="color:#1a6b3c;font-weight:bold;">⚡ Jaldi reply karein!</p>
            <p>📞 03114272394</p>
          </div>
        </div>`
    });
    console.log('📧 Email sent!');
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// ─── MENUS ────────────────────────────────────────────
const MAIN_MENU = `
╔══════════════════════════╗
     🕌 AL-NOOR QURAN ACADEMY
╚══════════════════════════╝

🌙 _Assalamu Alaikum wa Rahmatullahi wa Barakatuh!_

━━━━━━━━━━━━━━━━━━━━━━
📋 *MAIN MENU*
━━━━━━━━━━━━━━━━━━━━━━

1️⃣  📚 Hamare Courses
2️⃣  💰 Fee Structure
3️⃣  ⏰ Class Timings
4️⃣  📝 Admission / Enroll
5️⃣  💻 Online Classes
6️⃣  🎓 3 Din Free Trial
7️⃣  📞 Contact Us

━━━━━━━━━━━━━━━━━━━━━━
_Number type karein ya command likhein_`;

const REPLIES = {
  '0': MAIN_MENU,
  '/start': MAIN_MENU,
  '/menu': MAIN_MENU,
  '/help': MAIN_MENU,

  '1': `
╔══════════════════════════╗
        📚 HAMARE COURSES
╚══════════════════════════╝

1️⃣  🌟 *Nazra Quran*
   Sahi makharij ke saath Quran parhna
   _Beginners ke liye best_

2️⃣  🎯 *Tajweed ul Quran*  
   Recitation ke mukammal rules
   _Intermediate level_

3️⃣  💚 *Hifz e Quran*
   Step-by-step memorization
   _Dedicated Hafiz teachers_

4️⃣  📖 *Islamic Studies*
   Fiqh, Hadees, Seerah, Duas
   _All ages_

5️⃣  🗣️ *Arabic Language*
   Quranic Arabic samajhna
   _Beginners to advanced_

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ Enroll | 0️⃣ Main Menu`,

  '2': `
╔══════════════════════════╗
        💰 FEE STRUCTURE
╚══════════════════════════╝

📚 Nazra Quran     → *2,000 PKR/month*
🎯 Tajweed         → *2,500 PKR/month*
💚 Hifz Program    → *3,000 PKR/month*
📖 Islamic Studies → *2,000 PKR/month*
🗣️ Arabic Language → *2,500 PKR/month*

━━━━━━━━━━━━━━━━━━━━━━
💳 *Payment:* Monthly
📅 *Advance:* Nahi chahiye

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ Free Trial | 4️⃣ Enroll | 0️⃣ Menu`,

  '3': `
╔══════════════════════════╗
        ⏰ CLASS TIMINGS
╚══════════════════════════╝

🌅 *Morning Batch*
   8:00 AM — 12:00 PM

🌆 *Evening Batch*
   4:00 PM — 8:00 PM

🌙 *Night Batch* (Online only)
   8:00 PM — 10:00 PM

━━━━━━━━━━━━━━━━━━━━━━
📅 Monday to Saturday
🗓️ Sunday: Off

✅ Aapki marzi ka time
✅ Online & in-person dono

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ Enroll | 0️⃣ Main Menu`,

  '4': `
╔══════════════════════════╗
      📝 ADMISSION PROCESS
╚══════════════════════════╝

*3 Asaan Steps:*

*Step 1️⃣* — Yeh info bhejein:
   • 👤 Aapka naam
   • 🎂 Student ki umar  
   • 📚 Desired course
   • ⏰ Preferred timing

*Step 2️⃣* — Hum call karein ge
   ⚡ 10 minutes mein!

*Step 3️⃣* — FREE trial lein
   ✅ Pasand aaye to confirm

━━━━━━━━━━━━━━━━━━━━━━
📞 *Direct:* 03114272394
0️⃣ Main Menu

_Abhi details bhejein!_ 👇`,

  '5': `
╔══════════════════════════╗
       💻 ONLINE CLASSES
╚══════════════════════════╝

🌍 *Ghar baithay parho!*

📱 *Platforms:*
   • Zoom
   • WhatsApp Video
   • Google Meet

✨ *Features:*
   ✅ Live 1-on-1 sessions
   ✅ Screen share
   ✅ Class recording
   ✅ Digital material
   ✅ Progress tracking

🌐 *Available Worldwide:*
   🇵🇰 Pakistan | 🇬🇧 UK
   🇺🇸 USA | 🇨🇦 Canada
   🇦🇺 Australia | + More!

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ Enroll | 0️⃣ Main Menu`,

  '6': `
╔══════════════════════════╗
      🎓 3 DIN FREE TRIAL
╚══════════════════════════╝

*3 Din BILKUL MUFT!* 🎁

✅ Koi payment nahi
✅ Koi commitment nahi
✅ Pasand na aaye to chhoro
✅ Full class experience

━━━━━━━━━━━━━━━━━━━━━━
*Trial lene ke liye bhejein:*
• Aapka naam
• Student ki umar
• Course name
• Preferred timing

━━━━━━━━━━━━━━━━━━━━━━
📞 03114272394
0️⃣ Main Menu

_Kal se class shuru!_ 🚀`,

  '7': `
╔══════════════════════════╗
         📞 CONTACT US
╚══════════════════════════╝

📱 *WhatsApp:* 03114272394
📞 *Call:* 03114272394
📧 *Email:* M.talhaofcl@gmail.com

━━━━━━━━━━━━━━━━━━━━━━
⏰ *Available Hours:*
Mon-Sat: 8AM — 10PM
Sunday:  10AM — 6PM

━━━━━━━━━━━━━━━━━━━━━━
⚡ _10 minutes mein reply!_

0️⃣ Main Menu`,
};

// ─── KEYWORD MAP ──────────────────────────────────────
const KEYWORDS = [
  { words: ['course', 'nazra', 'tajweed', 'hifz', 'islamic', 'arabic', 'class'], key: '1' },
  { words: ['fee', 'faiz', 'kitni', 'payment', 'cost', 'price'], key: '2' },
  { words: ['timing', 'time', 'waqt', 'schedule', 'kab', 'batch'], key: '3' },
  { words: ['enroll', 'admission', 'dakhla', 'join', 'register', 'apply'], key: '4' },
  { words: ['online', 'zoom', 'ghar', 'video', 'live'], key: '5' },
  { words: ['trial', 'free', 'muft', 'test'], key: '6' },
  { words: ['contact', 'number', 'call', 'phone', 'rabta', 'email'], key: '7' },
  { words: ['salam', 'assalam', 'hello', 'hi', 'aoa', 'hey', 'start', 'menu'], key: '0' },
];

const sessions = {};

function getReply(msg) {
  const text = (msg || '').trim().toLowerCase();
  if (REPLIES[text]) return REPLIES[text];
  for (const item of KEYWORDS) {
    if (item.words.some(w => text.includes(w))) return REPLIES[item.key];
  }
  if (['shukriya', 'thanks', 'jazakallah', 'shukria'].some(w => text.includes(w))) {
    return `Wa Iyyakum! 🤲\n*Jazakallahu Khairan!*\nAllah aapko Quran ki barkat ata farmaye. Ameen! 🌙\n\n0️⃣ Main Menu`;
  }
  return `❓ Samajh nahi aaya.\n\nKripya number likhein:\n1️⃣ Courses | 2️⃣ Fee | 3️⃣ Timing\n4️⃣ Enroll | 5️⃣ Online | 6️⃣ Trial | 7️⃣ Contact\n\n0️⃣ Main Menu`;
}

function isEnrollmentDetails(msg) {
  const text = msg.toLowerCase();
  const hasAge = /\d+/.test(text);
  const keywords = ['naam', 'name', 'saal', 'year', 'umar', 'age', 'course', 'nazra', 'tajweed', 'hifz', 'islamic', 'morning', 'evening', 'online'];
  return hasAge && keywords.some(k => text.includes(k)) && text.length > 10;
}

function notifyAdmin(studentMsg, platform, contactId) {
  if (ADMIN_CHAT_ID) {
    const notification = `🔔 *NAYA ENROLLMENT!*\n━━━━━━━━━━━━━━━━━━\n👤 *Platform:* ${platform}\n📱 *Contact:* ${contactId}\n📝 *Message:*\n"${studentMsg}"\n━━━━━━━━━━━━━━━━━━\n⚡ _Jaldi reply karein!_`;
    sendTelegram(ADMIN_CHAT_ID, notification);
  }
  sendEmailNotification(studentMsg, platform, contactId);
}

// ─── WHATSAPP ─────────────────────────────────────────
app.post('/webhook', (req, res) => {
  const msg = (req.body.Body || '').trim();
  const from = req.body.From;
  if (!sessions[from]) sessions[from] = { count: 0, awaitingEnroll: false };
  sessions[from].count++;

  let reply;
  if (sessions[from].count === 1) {
    reply = REPLIES['/start'];
  } else if (sessions[from].awaitingEnroll && isEnrollmentDetails(msg)) {
    sessions[from].awaitingEnroll = false;
    notifyAdmin(msg, 'WhatsApp', from);
    reply = `✅ *Shukriya!*\n\nAapki details mil gayi!\nHum 10 minutes mein call karein ge. Insha'Allah! 🤲\n\n📞 03114272394\n\n0️⃣ Main Menu`;
  } else {
    if (['4', 'enroll', 'admission', '6', 'trial'].some(w => msg.toLowerCase().includes(w))) {
      sessions[from].awaitingEnroll = true;
    }
    reply = getReply(msg);
  }

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
  const username = body.message.from?.username || chatId;

  if (!sessions[chatId]) sessions[chatId] = { count: 0, awaitingEnroll: false };
  sessions[chatId].count++;

  let reply;
  if (sessions[chatId].count === 1 || msg === '/start') {
    sessions[chatId].awaitingEnroll = false;
    reply = `Wa Alaikum Assalam *${firstName}*! 🌙\n` + REPLIES['/start'];
  } else if (sessions[chatId].awaitingEnroll && isEnrollmentDetails(msg)) {
    sessions[chatId].awaitingEnroll = false;
    notifyAdmin(msg, 'Telegram', `@${username}`);
    reply = `✅ *Shukriya ${firstName}!*\n\nAapki details mil gayi!\nHum 10 minutes mein call karein ge. Insha'Allah! 🤲\n\n📞 03114272394\n\n0️⃣ Main Menu`;
  } else {
    if (['4', 'enroll', 'admission', '6', 'trial', '/enroll', '/trial'].some(w => msg.toLowerCase().includes(w))) {
      sessions[chatId].awaitingEnroll = true;
    }
    reply = getReply(msg);
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
  const req = https.request(options, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => { if (!JSON.parse(d).ok) console.error('TG error:', d); });
  });
  req.on('error', e => console.error('TG req error:', e));
  req.write(data);
  req.end();
}

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
