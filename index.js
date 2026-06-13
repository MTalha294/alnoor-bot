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
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"Al-Noor Bot" <${GMAIL_USER}>`,
      to: 'M.talhaofcl@gmail.com',
      subject: '🔔 Al-Noor — Naya Enrollment Request!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px;">
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
  } catch (err) { console.error('Email error:', err.message); }
}

// ─── TELEGRAM SEND WITH BUTTONS ───────────────────────
function sendTelegram(chatId, text, keyboard = null) {
  const payload = { chat_id: chatId, text, parse_mode: 'Markdown' };
  if (keyboard) payload.reply_markup = JSON.stringify({ inline_keyboard: keyboard });
  const data = JSON.stringify(payload);
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

function answerCallback(callbackQueryId) {
  const data = JSON.stringify({ callback_query_id: callbackQueryId });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  };
  const req = https.request(options);
  req.write(data);
  req.end();
}

// ─── KEYBOARDS ────────────────────────────────────────
const MAIN_KEYBOARD = [
  [{ text: '1️⃣   📚   Hamare Courses', callback_data: 'courses' }],
  [{ text: '2️⃣   💰   Fee Structure', callback_data: 'fee' }],
  [{ text: '3️⃣   ⏰   Class Timings', callback_data: 'timing' }],
  [{ text: '4️⃣   📝   Admission / Enroll', callback_data: 'enroll' }],
  [{ text: '5️⃣   💻   Online Classes', callback_data: 'online' }],
  [{ text: '6️⃣   🎓   3 Din Free Trial', callback_data: 'trial' }],
  [{ text: '7️⃣   📞   Talk to Admin', callback_data: 'admin' }],
  [{ text: '8️⃣   ☎️   Contact Us', callback_data: 'contact' }],
];

const BACK_KEYBOARD = [
  [{ text: '0️⃣   🏠   Wapas Main Menu', callback_data: 'menu' }]
];

const ENROLL_KEYBOARD = [
  [{ text: '✅   Haan, Enroll Karna Chahta Hoon', callback_data: 'confirm_enroll' }],
  [{ text: '0️⃣   🏠   Wapas Main Menu', callback_data: 'menu' }]
];

// ─── CONTENT ──────────────────────────────────────────
const CONTENT = {
  menu: {
    text: `🕌 *AL-NOOR QURAN ACADEMY*\n_Trusted by 1000+ Families • Est. 2010_\n\n🌙 _Assalamu Alaikum wa Rahmatullahi wa Barakatuh!_\n\n──────────────────────\n\n📚 Hamare Courses\n💰 Fee Structure\n⏰ Class Timings\n📝 Enroll Now\n💻 Online Classes\n🎓 Free Trial\n📞 Talk to Admin\n\n──────────────────────\n_Button tap karein ya number likhein_ 👇`,
    keyboard: MAIN_KEYBOARD
  },
  courses: {
    text: `╔══════════════════════════╗\n        📚 *HAMARE COURSES*\n╚══════════════════════════╝\n\n🌟 *Nazra Quran*\n   Sahi makharij ke saath Quran parhna\n\n🎯 *Tajweed ul Quran*\n   Recitation ke mukammal rules\n\n💚 *Hifz e Quran*\n   Step-by-step memorization\n\n📖 *Islamic Studies*\n   Fiqh, Hadees, Seerah, Duas\n\n🗣️ *Arabic Language*\n   Quranic Arabic samajhna`,
    keyboard: BACK_KEYBOARD
  },
  fee: {
    text: `╔══════════════════════════╗\n        💰 *FEE STRUCTURE*\n╚══════════════════════════╝\n\n📚 Nazra Quran     → *2,000 PKR/month*\n🎯 Tajweed         → *2,500 PKR/month*\n💚 Hifz Program    → *3,000 PKR/month*\n📖 Islamic Studies → *2,000 PKR/month*\n🗣️ Arabic Language → *2,500 PKR/month*\n\n━━━━━━━━━━━━━━━━━━━━━━\n💳 *Payment:* Monthly\n📅 *Advance:* Nahi chahiye`,
    keyboard: BACK_KEYBOARD
  },
  timing: {
    text: `╔══════════════════════════╗\n        ⏰ *CLASS TIMINGS*\n╚══════════════════════════╝\n\n🌅 *Morning Batch*\n   8:00 AM — 12:00 PM\n\n🌆 *Evening Batch*\n   4:00 PM — 8:00 PM\n\n🌙 *Night Batch* (Online only)\n   8:00 PM — 10:00 PM\n\n━━━━━━━━━━━━━━━━━━━━━━\n📅 Monday to Saturday\n🗓️ Sunday: Off`,
    keyboard: BACK_KEYBOARD
  },
  enroll: {
    text: `╔══════════════════════════╗\n      📝 *ADMISSION PROCESS*\n╚══════════════════════════╝\n\n*3 Asaan Steps:*\n\n*Step 1️⃣* — Yeh info bhejein:\n   • 👤 Aapka naam\n   • 🎂 Student ki umar\n   • 📚 Desired course\n   • ⏰ Preferred timing\n\n*Step 2️⃣* — Hum 10 min mein call karein ge\n\n*Step 3️⃣* — FREE 3 din trial lein\n\n━━━━━━━━━━━━━━━━━━━━━━\nKya aap enroll karna chahte hain?`,
    keyboard: ENROLL_KEYBOARD
  },
  online: {
    text: `╔══════════════════════════╗\n       💻 *ONLINE CLASSES*\n╚══════════════════════════╝\n\n🌍 *Ghar baithay parho!*\n\n📱 *Platforms:*\n   • Zoom\n   • WhatsApp Video\n   • Google Meet\n\n✨ *Features:*\n   ✅ Live 1-on-1 sessions\n   ✅ Screen share\n   ✅ Class recording\n   ✅ Digital material\n\n🌐 *Worldwide Available!*\n🇵🇰 🇬🇧 🇺🇸 🇨🇦 🇦🇺`,
    keyboard: BACK_KEYBOARD
  },
  trial: {
    text: `╔══════════════════════════╗\n      🎓 *3 DIN FREE TRIAL*\n╚══════════════════════════╝\n\n*3 Din BILKUL MUFT!* 🎁\n\n✅ Koi payment nahi\n✅ Koi commitment nahi\n✅ Pasand na aaye to chhoro\n✅ Full class experience\n\n━━━━━━━━━━━━━━━━━━━━━━\nTrial ke liye apni details bhejein:\n• Naam, umar, course, timing`,
    keyboard: ENROLL_KEYBOARD
  },
  contact: {
    text: `╔══════════════════════════╗\n         📞 *CONTACT US*\n╚══════════════════════════╝\n\n📱 *WhatsApp:* 03114272394\n📞 *Call:* 03114272394\n📧 *Email:* M.talhaofcl@gmail.com\n\n━━━━━━━━━━━━━━━━━━━━━━\n⏰ *Available:*\nMon-Sat: 8AM — 10PM\nSunday: 10AM — 6PM\n\n⚡ _10 minutes mein reply!_`,
    keyboard: BACK_KEYBOARD
  },
  admin: {
    text: `╔══════════════════════════╗\n       📞 *TALK TO ADMIN*\n╚══════════════════════════╝\n\n🔔 *Admin ko notification bhej di gayi!*\n\nHum jald aapse rabta karein ge.\nInsha'Allah! 🤲\n\n━━━━━━━━━━━━━━━━━━━━━━\n📱 *Direct WhatsApp:*\n03114272394\n\n⏰ _Usually 5-10 min mein reply_`,
    keyboard: BACK_KEYBOARD
  }
};

// ─── SESSIONS ─────────────────────────────────────────
const sessions = {};

function notifyAdmin(studentMsg, platform, contactId) {
  if (ADMIN_CHAT_ID) {
    sendTelegram(ADMIN_CHAT_ID,
      `🔔 *NAYA REQUEST!*\n━━━━━━━━━━━━━━━━━━\n👤 *Platform:* ${platform}\n📱 *Contact:* ${contactId}\n📝 *Message:*\n"${studentMsg}"\n━━━━━━━━━━━━━━━━━━\n⚡ _Jaldi reply karein!_`
    );
  }
  sendEmailNotification(studentMsg, platform, contactId);
}

function isEnrollmentDetails(msg) {
  const text = msg.toLowerCase();
  const hasAge = /\d+/.test(text);
  const keywords = ['naam', 'name', 'saal', 'year', 'umar', 'age', 'course', 'nazra', 'tajweed', 'hifz', 'morning', 'evening', 'online'];
  return hasAge && keywords.some(k => text.includes(k)) && text.length > 10;
}

// ─── TELEGRAM WEBHOOK ─────────────────────────────────
app.post('/telegram', (req, res) => {
  const body = req.body;

  // Handle button clicks
  if (body.callback_query) {
    const cq = body.callback_query;
    const chatId = cq.message.chat.id;
    const data = cq.data;
    const firstName = cq.from?.first_name || 'Student';
    const username = cq.from?.username || chatId;

    answerCallback(cq.id);

    if (!sessions[chatId]) sessions[chatId] = { awaitingEnroll: false };

    if (data === 'menu') {
      sendTelegram(chatId, CONTENT.menu.text, CONTENT.menu.keyboard);
    } else if (data === 'admin') {
      // Talk to Admin
      notifyAdmin(`${firstName} ne Admin se baat karna chaha`, 'Telegram', `@${username}`);
      sendTelegram(chatId, CONTENT.admin.text, CONTENT.admin.keyboard);
    } else if (data === 'confirm_enroll') {
      sessions[chatId].awaitingEnroll = true;
      sendTelegram(chatId,
        `📝 *Bilkul!*\n\nYeh details bhejein:\n• 👤 Naam\n• 🎂 Student ki umar\n• 📚 Course\n• ⏰ Timing (Morning/Evening)`,
        BACK_KEYBOARD
      );
    } else if (CONTENT[data]) {
      sendTelegram(chatId, CONTENT[data].text, CONTENT[data].keyboard);
    }

    return res.sendStatus(200);
  }

  // Handle text messages
  if (!body.message) return res.sendStatus(200);
  const chatId = body.message.chat.id;
  const msg = body.message.text || '';
  const firstName = body.message.from?.first_name || 'Student';
  const username = body.message.from?.username || chatId;

  if (!sessions[chatId]) sessions[chatId] = { count: 0, awaitingEnroll: false };
  sessions[chatId].count++;

  if (sessions[chatId].count === 1 || msg === '/start') {
    sessions[chatId].awaitingEnroll = false;
    sendTelegram(chatId,
      `Wa Alaikum Assalam *${firstName}*! 🌙\n\n` + CONTENT.menu.text,
      MAIN_KEYBOARD
    );
  } else if (sessions[chatId].awaitingEnroll && isEnrollmentDetails(msg)) {
    sessions[chatId].awaitingEnroll = false;
    notifyAdmin(msg, 'Telegram', `@${username}`);
    sendTelegram(chatId,
      `✅ *Shukriya ${firstName}!*\n\nAapki details mil gayi!\nHum 10 minutes mein call karein ge. Insha'Allah! 🤲\n\n📞 03114272394`,
      BACK_KEYBOARD
    );
  } else if (msg === '/menu' || msg === '0') {
    sendTelegram(chatId, CONTENT.menu.text, MAIN_KEYBOARD);
  } else {
    // keyword match
    const text = msg.toLowerCase();
    let matched = false;
    const keywordMap = [
      { words: ['course', 'nazra', 'tajweed', 'hifz', 'islamic', 'arabic'], key: 'courses' },
      { words: ['fee', 'faiz', 'kitni', 'payment'], key: 'fee' },
      { words: ['timing', 'time', 'waqt', 'schedule'], key: 'timing' },
      { words: ['enroll', 'admission', 'dakhla', 'join'], key: 'enroll' },
      { words: ['online', 'zoom', 'ghar', 'video'], key: 'online' },
      { words: ['trial', 'free', 'muft'], key: 'trial' },
      { words: ['contact', 'number', 'call', 'phone'], key: 'contact' },
      { words: ['admin', 'agent', 'insaan', 'banda', 'talk'], key: 'admin' },
    ];
    for (const item of keywordMap) {
      if (item.words.some(w => text.includes(w))) {
        if (item.key === 'admin') {
          notifyAdmin(msg, 'Telegram', `@${username}`);
        }
        sendTelegram(chatId, CONTENT[item.key].text, CONTENT[item.key].keyboard);
        matched = true;
        break;
      }
    }
    if (!matched) {
      sendTelegram(chatId,
        `❓ Samajh nahi aaya.\n\nNeeche se option chunein:`,
        MAIN_KEYBOARD
      );
    }
  }

  res.sendStatus(200);
});

// ─── WHATSAPP ─────────────────────────────────────────
app.post('/webhook', (req, res) => {
  const msg = (req.body.Body || '').trim();
  const from = req.body.From;
  if (!sessions[from]) sessions[from] = { count: 0, awaitingEnroll: false };
  sessions[from].count++;

  let reply;
  if (sessions[from].count === 1) {
    reply = CONTENT.menu.text.replace(/\*/g, '*');
  } else if (sessions[from].awaitingEnroll && isEnrollmentDetails(msg)) {
    sessions[from].awaitingEnroll = false;
    notifyAdmin(msg, 'WhatsApp', from);
    reply = `✅ *Shukriya!*\nAapki details mil gayi!\nHum 10 min mein call karein ge. 🤲\n📞 03114272394\n\n0️⃣ Main Menu`;
  } else {
    const text = msg.toLowerCase();
    if (['4','enroll','admission','6','trial'].some(w => text.includes(w))) sessions[from].awaitingEnroll = true;
    const waReplies = {
      '1': CONTENT.courses.text, 'course': CONTENT.courses.text,
      '2': CONTENT.fee.text, 'fee': CONTENT.fee.text,
      '3': CONTENT.timing.text, 'timing': CONTENT.timing.text,
      '4': CONTENT.enroll.text, 'enroll': CONTENT.enroll.text,
      '5': CONTENT.online.text, 'online': CONTENT.online.text,
      '6': CONTENT.trial.text, 'trial': CONTENT.trial.text,
      '7': CONTENT.contact.text, 'contact': CONTENT.contact.text,
      '0': CONTENT.menu.text, 'menu': CONTENT.menu.text,
    };
    reply = waReplies[text] || `❓ Samajh nahi aaya.\n\n1️⃣ Courses | 2️⃣ Fee | 3️⃣ Timing\n4️⃣ Enroll | 5️⃣ Online | 6️⃣ Trial\n7️⃣ Contact | 0️⃣ Menu`;
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(reply);
  res.type('text/xml');
  res.send(twiml.toString());
});

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
