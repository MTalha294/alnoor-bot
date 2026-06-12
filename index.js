const express = require('express');
const twilio = require('twilio');
const https = require('https');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const WELCOME_MSG = `🌙 *Assalamu Alaikum!*
*Al-Noor Quran Academy* mein khush amdeed!

1️⃣ Courses ki maloomat
2️⃣ Fee structure
3️⃣ Class timings
4️⃣ Teacher profiles
5️⃣ Admission / Enrollment
6️⃣ Online classes info`;

const REPLIES = [
  { keywords: ['1','course','nazra','tajweed','hifz','islamic'], reply: `📚 *Courses:*\n1. Nazra Quran\n2. Tajweed ul Quran\n3. Hifz Program\n4. Islamic Studies` },
  { keywords: ['2','fee','fees','faiz','payment','kitni'], reply: `💰 *Fee:*\n• Nazra → 1,500 PKR\n• Tajweed → 2,000 PKR\n• Hifz → 2,500 PKR\n• Islamic → 1,500 PKR\n✅ First month FREE!` },
  { keywords: ['3','timing','time','waqt','schedule'], reply: `⏰ *Timings:*\n🌅 Morning: 8AM-12PM\n🌆 Evening: 4PM-8PM\nMon-Sat` },
  { keywords: ['4','teacher','ustaad','faculty'], reply: `👨‍🏫 *Teachers:*\n• Hafiz Muhammad Ali\n• Qari Abdullah\n• Maulana Yusuf\nSaare Hafiz ✅` },
  { keywords: ['5','admission','enroll','join','register'], reply: `📝 *Enrollment:*\nNaam, umar, course bhejein\n10 min mein reply! ✅` },
  { keywords: ['6','online','zoom','live'], reply: `💻 *Online Classes!*\n✅ Zoom/WhatsApp Video\n✅ 1-on-1 sessions\n✅ Duniya mein kahin bhi 🌍` },
  { keywords: ['salam','assalam','hello','hi','aoa'], reply: `Wa Alaikum Assalam! 🌙\nAl-Noor mein khush amdeed!\n1️⃣ Courses | 2️⃣ Fee | 3️⃣ Timing\n4️⃣ Teachers | 5️⃣ Enroll | 6️⃣ Online` },
  { keywords: ['shukriya','thanks','jazakallah'], reply: `Wa Iyyakum! 🤲 Jazakallahu Khairan!` },
];

const sessions = {};

function getReply(msg, isFirst) {
  if (isFirst) return WELCOME_MSG;
  const text = msg.toLowerCase();
  for (const item of REPLIES) {
    if (item.keywords.some(kw => text.includes(kw))) return item.reply;
  }
  return `Shukriya! 🙏\n1️⃣ Courses | 2️⃣ Fee | 3️⃣ Timing\n4️⃣ Teachers | 5️⃣ Enroll | 6️⃣ Online`;
}

app.post('/webhook', (req, res) => {
  const msg = (req.body.Body || '').trim();
  const from = req.body.From;
  if (!sessions[from]) sessions[from] = { count: 0 };
  sessions[from].count++;
  const reply = getReply(msg, sessions[from].count === 1);
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(reply);
  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/telegram', (req, res) => {
  const body = req.body;
  if (!body.message) return res.sendStatus(200);
  const chatId = body.message.chat.id;
  const msg = body.message.text || '';
  if (!sessions[chatId]) sessions[chatId] = { count: 0 };
  sessions[chatId].count++;
  const reply = getReply(msg, sessions[chatId].count === 1);
  const data = JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'Markdown' });
  const options = { hostname: 'api.telegram.org', path: `/bot${TELEGRAM_TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json' } };
  const req2 = https.request(options);
  req2.write(data);
  req2.end();
  res.sendStatus(200);
});

app.get('/setup-telegram', (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/telegram`;
  https.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${url}`, (r) => {
    let data = '';
    r.on('data', chunk => data += chunk);
    r.on('end', () => res.send(`✅ Telegram ready! ${data}`));
  });
});

app.get('/', (req, res) => res.send('🕌 Al-Noor Bot Running! ✅'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));
