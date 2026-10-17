require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits: I, 
  Partials: P, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder, 
  ChannelType, 
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
  UserSelectMenuBuilder
} = require('discord.js');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const LOGS_FILE_PATH = path.join(__dirname, 'persistent_logs.json');
const TRANSCRIPTS_DIR = path.join(__dirname, 'transcripts_store');

if (!fs.existsSync(TRANSCRIPTS_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
}

let logsStore = { roles: [], messages: [], voice: [], tickets: [], channels: [], members: [], bans: [] };

try {
  if (fs.existsSync(LOGS_FILE_PATH)) {
    logsStore = JSON.parse(fs.readFileSync(LOGS_FILE_PATH, 'utf-8'));
  }
} catch (e) {}

function saveLogsToFile() {
  try {
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logsStore, null, 2), 'utf-8');
  } catch (e) {}
}

function addLog(category, action, details, transcriptId = null) {
  const time = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
  const logItem = { action, details, time, transcriptId };
  if (!logsStore[category]) logsStore[category] = [];
  logsStore[category].unshift(logItem);
  if (logsStore[category].length > 300) logsStore[category].pop();
  saveLogsToFile();
}

let basesData = {
  silver: { name: 'Silver Base', emoji: '⚪', tiers: [{ maxQty: 20, price: '20 ريال' }, { maxQty: 40, price: '40 ريال' }, { maxQty: 999, price: '60 ريال' }], itemTiers: [{ maxQty: 10, items: 'كروماندو كاندي وفوق باستثناء البارتي' }, { maxQty: 999, items: 'دب كاندي وفوق' }] },
  gold: { name: 'Gold Base', emoji: '🟡', tiers: [{ maxQty: 20, price: '20 ريال' }, { maxQty: 40, price: '40 ريال' }, { maxQty: 999, price: '60 ريال' }], itemTiers: [{ maxQty: 10, items: 'كروماندو كاندي وفوق باستثناء البارتي' }, { maxQty: 999, items: 'دب كاندي وفوق' }] },
  crystal: { name: 'Crystal Base', emoji: '💎', tiers: [{ maxQty: 20, price: '25 ريال' }, { maxQty: 40, price: '50 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  bloodmoon: { name: 'BloodMoon Base', emoji: '🌑', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  rainbow: { name: 'Rainbow Base GoUp', emoji: '🌈', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  candy: { name: 'Candy Base GoUp', emoji: '🍬', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  cyber: { name: 'Cyber Base GoUp', emoji: '🤖', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  party: { name: 'Party Base GoUp', emoji: '🎉', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  bw: { name: 'Black & White Base GoUp', emoji: '⬛', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  aqua: { name: 'Aqua Base GoUp', emoji: '💧', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  lava: { name: 'Lava Base GoUp', emoji: '🌋', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  football: { name: 'Football Base GoUp', emoji: '⚽', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  summer: { name: 'Summer Base GoUp', emoji: '☀️', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  dreamy: { name: 'Dreamy Base GoUp', emoji: '☁️', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  galaxy: { name: 'Galaxy Base', emoji: '🌌', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  radioactive: { name: 'Radioactive Base', emoji: '☢️', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] },
  halloween: { name: 'Halloween Base', emoji: '🎃', tiers: [{ maxQty: 20, price: '30 ريال' }, { maxQty: 40, price: '60 ريال' }], itemTiers: [{ maxQty: 999, items: 'شروط الأغراض المحددة مسبقاً' }] }
};

let serverSettings = { ticketCategories: '', ownerRoleName: 'Owner' };
const ticketsDataMap = new Map();

function getTierPrice(tiersArray, userQuantity) {
  if (!tiersArray || tiersArray.length === 0) return { price: 'غير محدد', tierText: 'غير محدد' };
  const sorted = [...tiersArray].sort((a, b) => a.maxQty - b.maxQty);
  for (let tier of sorted) {
    if (userQuantity <= tier.maxQty) return { price: tier.price, tierText: `${tier.maxQty} وتحت` };
  }
  const lastTier = sorted[sorted.length - 1];
  return { price: lastTier.price, tierText: `فوق ${lastTier.maxQty}` };
}

function getTierItems(itemTiersArray, userQuantity) {
  if (!itemTiersArray || itemTiersArray.length === 0) return { items: 'غير محدد', tierText: 'غير محدد' };
  const sorted = [...itemTiersArray].sort((a, b) => a.maxQty - b.maxQty);
  for (let tier of sorted) {
    if (userQuantity <= tier.maxQty) return { items: tier.items, tierText: `${tier.maxQty} وتحت` };
  }
  const lastTier = sorted[sorted.length - 1];
  return { items: lastTier.items, tierText: `فوق ${lastTier.maxQty}` };
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'void_ultimate_logs_persistent_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 * 24 }
}));

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = (process.env.BASE_URL || 'https://void-community.onrender.com').replace(/\/$/, '');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'VD122';
const TOKEN = process.env.TOKEN;
const REDIRECT_URI = `${BASE_URL}/api/auth/callback`;

const renderUltimateLayout = (activeTab, content) => {
  let memberCount = 0;
  let botIconUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
  try {
    const firstGuild = client.guilds.cache.first();
    if (firstGuild) memberCount = firstGuild.memberCount;
    if (client.user && client.user.displayAvatarURL()) botIconUrl = client.user.displayAvatarURL({ extension: 'png', size: 256 });
  } catch(e){}

  let totalLogsCount = Object.values(logsStore).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0);

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Void • Command Center</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
      * { box-sizing: border-box; font-family: 'Cairo', sans-serif; transition: all 0.2s ease; }
      body { background: #08090d; color: #f3f4f6; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; }
      .sidebar { width: 250px; background: rgba(13, 15, 23, 0.88); backdrop-filter: blur(25px); border-left: 1px solid rgba(255, 255, 255, 0.08); padding: 22px 16px; display: flex; flex-direction: column; justify-content: space-between; position: fixed; right: 0; top: 0; bottom: 0; z-index: 100; }
      .brand-box { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; margin-bottom: 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
      .brand-avatar { width: 42px; height: 42px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); }
      .brand-title { font-size: 15px; font-weight: 900; background: linear-gradient(135deg, #ffffff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .brand-sub { font-size: 11px; color: #6b7280; }
      .nav-group { margin-bottom: 18px; }
      .nav-label { font-size: 10px; color: #6366f1; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; padding-right: 8px; letter-spacing: 1px; }
      .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 13px; border-radius: 10px; color: #9ca3af; text-decoration: none; font-weight: 600; font-size: 13px; margin-bottom: 4px; }
      .nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #f3f4f6; }
      .nav-item.active { background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.15)); color: #ffffff; border: 1px solid rgba(99, 102, 241, 0.4); }
      .badge-live { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 20px; font-size: 10px; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 800; }
      .main-content { margin-right: 250px; flex: 1; padding: 28px 36px; max-width: 1350px; position: relative; z-index: 10; }
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 22px; }
      .stat-card { background: rgba(17, 20, 31, 0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.07); padding: 16px 18px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; }
      .stat-num { font-size: 22px; font-weight: 800; color: #ffffff; }
      .stat-title { font-size: 12px; color: #9ca3af; font-weight: 600; }
      .glass-card { background: rgba(17, 20, 31, 0.6); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 16px; padding: 22px 26px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      h1, h2, h3 { color: #fff; margin-top: 0; font-weight: 800; }
      .purple-gradient { background: linear-gradient(135deg, #ffffff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .tier-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; background: rgba(10, 12, 18, 0.5); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
      .tier-row input[type="number"] { width: 120px; text-align: center; }
      .tier-row input[type="text"] { flex: 1; }
      .tier-label { font-size: 12px; font-weight: 800; color: #a855f7; white-space: nowrap; }
      .btn-del { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 7px 12px; cursor: pointer; font-weight: 700; }
      .btn-add { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 6px 14px; cursor: pointer; font-weight: 700; font-size: 12px; margin-top: 6px; display: inline-block; }
      input, textarea, select { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(10, 12, 18, 0.85); color: #f3f4f6; outline: none; margin-top: 6px; font-size: 13px; }
      label { font-size: 12px; font-weight: 700; color: #d1d5db; display: block; margin-top: 10px; }
      .btn { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; padding: 11px 22px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); margin-top: 16px; font-size: 13px; text-align: center; text-decoration: none; display: inline-block; }
      .logs-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .logs-table th, .logs-table td { padding: 12px 16px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; }
      .logs-table th { color: #9ca3af; font-weight: 700; background: rgba(255, 255, 255, 0.02); }
      .log-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-block; }
      .badge-roles { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.3); }
      .badge-messages { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
      .badge-voice { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
      .badge-tickets { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
      .badge-channels { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3); }
      .badge-members { background: rgba(6, 182, 212, 0.15); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.3); }
      .badge-bans { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
      .btn-view-ticket { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-block; margin-right: 8px; }
      .btn-clear-logs { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    </style>
    <script>
      function addTierRow(baseKey) {
        const container = document.getElementById('tier-container-' + baseKey);
        const div = document.createElement('div');
        div.className = 'tier-row';
        div.innerHTML = '<input type="number" name="' + baseKey + '_maxQty[]" placeholder="العدد" required><span class="tier-label">وتحت ⟵</span><input type="text" name="' + baseKey + '_price[]" placeholder="السعر" required><button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button>';
        container.appendChild(div);
      }
      function addItemTierRow(baseKey) {
        const container = document.getElementById('item-tier-container-' + baseKey);
        const div = document.createElement('div');
        div.className = 'tier-row';
        div.innerHTML = '<input type="number" name="' + baseKey + '_itemMaxQty[]" placeholder="العدد" required><span class="tier-label">وتحت ⟵</span><input type="text" name="' + baseKey + '_itemText[]" placeholder="شروط الأغراض" required><button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button>';
        container.appendChild(div);
      }
    </script>
  </head>
  <body>
    <div class="sidebar">
      <div>
        <div class="brand-box">
          <img src="${botIconUrl}" class="brand-avatar" alt="Logo">
          <div><div class="brand-title">VOID BOT</div><div class="brand-sub">Community Center</div></div>
        </div>
        <div class="nav-group">
          <div class="nav-label">التهيئة والتحكم</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}"><span>🎨 ألوان القواعد (17)</span></a>
          <a href="/tickets" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}"><span>🎫 نظام التذاكر</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label">المراقبة المباشرة</div>
          <a href="/logs" class="nav-item ${activeTab === 'logs' ? 'active' : ''}"><span>📜 سجلات الأحداث</span><div class="badge-live">PERSISTENT</div></a>
          <a href="/moderation" class="nav-item ${activeTab === 'moderation' ? 'active' : ''}"><span>🔨 أدوات الإدارة</span></a>
        </div>
      </div>
      <a href="/logout" class="btn" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #fca5a5; font-size: 12px; padding: 8px;">🚪 خروج</a>
    </div>
    <div class="main-content">
      <div class="stats-grid">
        <div class="stat-card"><div><div class="stat-title">الأعضاء</div><div class="stat-num">${memberCount}</div></div><div style="font-size:20px;">👥</div></div>
        <div class="stat-card"><div><div class="stat-title">القواعد</div><div class="stat-num">17</div></div><div style="font-size:20px;">🎨</div></div>
        <div class="stat-card"><div><div class="stat-title">تذاكر نشطة</div><div class="stat-num">${ticketsDataMap.size}</div></div><div style="font-size:20px;">🎫</div></div>
        <div class="stat-card"><div><div class="stat-title">إجمالي السجلات</div><div class="stat-num">${totalLogsCount}</div></div><div style="font-size:20px;">📜</div></div>
      </div>
      ${content}
    </div>
  </body>
  </html>
  `;
};

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>Void • Login</title>
    <style>body { background: #08090d; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Cairo', sans-serif; }
    .card { background: rgba(15, 18, 28, 0.85); border: 1px solid rgba(255,255,255,0.1); padding: 35px; border-radius: 20px; text-align: center; width: 340px; }
    input { width: 100%; padding: 11px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(8,10,16,0.9); color: #fff; text-align: center; margin-bottom: 16px; outline: none; }
    button { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; padding: 11px; border-radius: 10px; width: 100%; font-weight: 700; cursor: pointer; }</style></head>
    <body><div class="card"><h2 style="color:#c084fc;margin-bottom:15px;">VOID COMMUNITY</h2>
    <form action="/login/pass" method="POST"><input type="password" name="password" placeholder="كلمة المرور" required autofocus><button type="submit">دخول</button></form></div></body></html>
  `);
});

app.post('/login/pass', (req, res) => {
  if (req.body.password === DASHBOARD_PASSWORD) {
    req.session.passAuthenticated = true;
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`);
  } else {
    res.send('<h2 style="color:red; text-align:center; margin-top:50px;">❌ كلمة المرور غير صحيحة!<br><br><a href="/login">إعادة المحاولة</a></h2>');
  }
});

app.get(['/auth/callback', '/api/auth/callback'], async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login');
  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    req.session.authenticated = true;
    req.session.user = await userRes.json();
    res.redirect('/');
  } catch (error) {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

app.get('/', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  let channelOptionsHTML = '<option value="" disabled selected>اختر القناة...</option>';
  try {
    client.guilds.cache.forEach(g => g.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach(c => {
      channelOptionsHTML += `<option value="${c.id}"># ${c.name} — (${g.name})</option>`;
    }));
  } catch(e){}

  const content = `
    <div class="glass-card"><h1>🎨 إعدادات ألوان القواعد</h1></div>
    <div class="glass-card"><h2 style="font-size:15px;">📢 نشر لوحة الألوان</h2>
    <form action="/send-panel" method="POST"><select name="channel_id" required>${channelOptionsHTML}</select><button type="submit" class="btn">🚀 نشر</button></form></div>
    <form action="/save-colors" method="POST">
    ${Object.keys(basesData).map(k => `
      <div class="glass-card"><h3 style="color:#a855f7;font-size:15px;">${basesData[k].emoji}${basesData[k].name}</h3>
      <label>💰 شرائح المقابل المادي:</label>
      <div id="tier-container-${k}">${(basesData[k].tiers || []).map(t => `<div class="tier-row"><input type="number" name="${k}_maxQty[]" value="${t.maxQty}" required><span class="tier-label">وتحت ⟵</span><input type="text" name="${k}_price[]" value="${t.price}" required><button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button></div>`).join('')}</div>
      <button type="button" class="btn-add" onclick="addTierRow('${k}')">➕ شريحة سعر</button>
      <label style="margin-top:15px;">🎁 شرائح المقابل بالأغراض:</label>
      <div id="item-tier-container-${k}">${(basesData[k].itemTiers || []).map(it => `<div class="tier-row"><input type="number" name="${k}_itemMaxQty[]" value="${it.maxQty}" required><span class="tier-label">وتحت ⟵</span><input type="text" name="${k}_itemText[]" value="${it.items}" required><button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button></div>`).join('')}</div>
      <button type="button" class="btn-add" onclick="addItemTierRow('${k}')">➕ شريحة أغراض</button></div>
    `).join('')}
    <button type="submit" class="btn">💾 حفظ الكل</button></form>
  `;
  res.send(renderUltimateLayout('colors', content));
});

app.post('/save-colors', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  Object.keys(basesData).forEach(key => {
    const maxQtys = req.body[`${key}_maxQty[]`];
    const prices = req.body[`${key}_price[]`];
    let newTiers = [];
    if (Array.isArray(maxQtys)) {
      for (let i = 0; i < maxQtys.length; i++) { if (maxQtys[i] && prices[i]) newTiers.push({ maxQty: Number(maxQtys[i]), price: prices[i] }); }
    }
    if (newTiers.length > 0) basesData[key].tiers = newTiers;

    const itemMaxQtys = req.body[`${key}_itemMaxQty[]`];
    const itemTexts = req.body[`${key}_itemText[]`];
    let newItemTiers = [];
    if (Array.isArray(itemMaxQtys)) {
      for (let i = 0; i < itemMaxQtys.length; i++) { if (itemMaxQtys[i] && itemTexts[i]) newItemTiers.push({ maxQty: Number(itemMaxQtys[i]), items: itemTexts[i] }); }
    }
    if (newItemTiers.length > 0) basesData[key].itemTiers = newItemTiers;
  });
  res.redirect('/');
});

app.get('/tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('tickets', `
    <div class="glass-card"><h1>🎫 إعدادات التذاكر</h1>
    <form action="/save-tickets" method="POST">
    <label>معرفات الكاتيجوري (مفصولة بفاصلة):</label><input type="text" name="ticketCategories" value="${serverSettings.ticketCategories}">
    <label>رتبة الـ Owner:</label><input type="text" name="ownerRoleName" value="${serverSettings.ownerRoleName}">
    <button type="submit" class="btn">💾 حفظ</button></form></div>
  `));
});

app.post('/save-tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  serverSettings.ticketCategories = req.body.ticketCategories || '';
  serverSettings.ownerRoleName = req.body.ownerRoleName || 'Owner';
  res.redirect('/tickets');
});

app.get('/view-transcript/:id', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const filePath = path.join(TRANSCRIPTS_DIR, `${req.params.id.replace(/[^a-zA-Z0-9_-]/g, '')}.json`);
  if (!fs.existsSync(filePath)) return res.send('❌ التذكرة غير موجودة.');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>تذكرة</title><style>body{background:#08090d;color:#fff;padding:30px;font-family:'Cairo',sans-serif;}</style></head>
  <body><h1>🎫 تفاصيل التذكرة: ${data.ticketName}</h1><p><b>المالك:</b> ${data.openedBy}</p><p><b>أُغلقت بواسطة:</b> ${data.closedBy}</p><hr/>
  ${data.messages.map(m => `<p><b>${m.author}</b> [${m.time}]:<br>${m.content}</p>`).join('<hr/>')}</body></html>`);
});

app.get('/clear-logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  logsStore = { roles: [], messages: [], voice: [], tickets: [], channels: [], members: [], bans: [] };
  saveLogsToFile();
  res.redirect('/logs');
});

app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const renderTable = (title, items) => `
    <div class="glass-card"><h3 style="color:#c084fc;font-size:15px;">${title} (${(items || []).length})</h3>
    <table class="logs-table">${(items || []).map(l => `<tr><td style="font-weight:700;width:30%;">${l.action}</td><td style="width:50%;">${l.details}${l.transcriptId ? `<br><a href="/view-transcript/${l.transcriptId}" target="_blank" class="btn-view-ticket">🎫 عرض التذكرة الاحترافية</a>` : ''}</td><td style="color:#6b7280;text-align:left;width:20%;">${l.time}</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;color:#6b7280;">لا توجد سجلات.</td></tr>'}</table></div>
  `;
  res.send(renderUltimateLayout('logs', `
    <div class="glass-card" style="display:flex;justify-content:space-between;align-items:center;"><h1>📜 سجلات الأحداث</h1><a href="/clear-logs" class="btn-clear-logs" onclick="return confirm('حذف الكل؟')">🗑️ تفريغ السجلات</a></div>
    ${renderTable('🎫 التذاكر', logsStore.tickets)}
    ${renderTable('👑 الرتب', logsStore.roles)}
    ${renderTable('💬 الرسائل', logsStore.messages)}
    ${renderTable('🎙️ الصوت', logsStore.voice)}
    ${renderTable('👥 الأعضاء', logsStore.members)}
    ${renderTable('🔨 الباند', logsStore.bans)}
  `));
});

app.get('/moderation', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('moderation', `<div class="glass-card"><h1>🔨 أدوات الإدارة</h1><p>مفعلة وتعمل بكفاءة.</p></div>`));
});

app.post('/send-panel', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  try {
    const channel = await client.channels.fetch(req.body.channel_id);
    const selectMenu = new StringSelectMenuBuilder().setCustomId('select_base_color').setPlaceholder('اختر لون القاعدة...').addOptions(Object.keys(basesData).map(k => ({ label: basesData[k].name, value: k, emoji: basesData[k].emoji })));
    await channel.send({ embeds: [new EmbedBuilder().setTitle('🎨 Void Community | نظام ألوان ماب النطة').setColor('#6366f1')], components: [new ActionRowBuilder().addComponents(selectMenu)] });
    res.redirect('/');
  } catch(e) { res.redirect('/'); }
});

app.listen(PORT, () => console.log(`🌐 Server Active on port ${PORT}`));

const client = new Client({
  intents: [I.Guilds, I.GuildMembers, I.GuildMessages, I.MessageContent, I.GuildVoiceStates, I.GuildModeration],
  partials: [P.Message, P.Channel, P.Reaction, P.User, P.GuildMember]
});

const userSessions = new Map();

async function saveFullTranscript(channel, closedByUser, openedByUserTag, baseName) {
  const msgs = await channel.messages.fetch({ limit: 100 });
  const sorted = Array.from(msgs.values()).reverse();
  let messagesList = [];
  let txtContent = `Transcript for ${channel.name}\n\n`;
  sorted.forEach(m => {
    if (m.content.trim()) {
      messagesList.push({ author: m.author.tag, content: m.content, time: m.createdAt.toLocaleTimeString() });
      txtContent += `[${m.createdAt.toLocaleTimeString()}] ${m.author.tag}: ${m.content}\n`;
    }
  });
  const fileId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  fs.writeFileSync(path.join(TRANSCRIPTS_DIR, `${fileId}.json`), JSON.stringify({ ticketName: channel.name, openedBy: openedByUserTag, closedBy: closedByUser.tag, baseName, date: new Date().toLocaleString('ar-SA'), messages: messagesList }, null, 2), 'utf-8');
  return { fileId, buffer: Buffer.from(txtContent, 'utf-8'), count: sorted.length };
}

client.once('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_base_color') {
    const modal = new ModalBuilder().setCustomId(`modal_info_${interaction.values[0]}`).setTitle('بيانات الضمان');
    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('guarantee_val').setLabel('الضمان').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('missing_val').setLabel('عدد النواقص').setStyle(TextInputStyle.Short).setRequired(true))
    );
    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_info_')) {
    const baseKey = interaction.customId.replace('modal_info_', '');
    const missingNum = parseInt(interaction.fields.getTextInputValue('missing_val').replace(/[^0-9]/g, '')) || 1;
    userSessions.set(interaction.user.id, { baseKey, guarantee: interaction.fields.getTextInputValue('guarantee_val'), missing: missingNum });
    const paymentMenu = new StringSelectMenuBuilder().setCustomId('select_payment').setPlaceholder('اختر نوع المقابل').addOptions([
      { label: 'مقابل مادي', value: 'money', emoji: '💰' },
      { label: 'أغراض داخل اللعبة', value: 'items', emoji: '🎁' }
    ]);
    await interaction.reply({ content: `✅ تم حفظ البيانات. اختر المقابل:`, components: [new ActionRowBuilder().addComponents(paymentMenu)], ephemeral: true });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_payment') {
    const payType = interaction.values[0];
    const session = userSessions.get(interaction.user.id);
    const baseConfig = basesData[session.baseKey];
    const resText = payType === 'money' ? `💵 السعر: ${getTierPrice(baseConfig.tiers, session.missing).price}` : `📦 الأغراض: ${getTierItems(baseConfig.itemTiers, session.missing).items}`;
    const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_accept').setLabel('قبول').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn_reject').setLabel('رفض').setStyle(ButtonStyle.Danger)
    );
    await interaction.update({ content: `${resText}\n\nهل توافق؟`, components: [btns] });
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'btn_accept') {
      const session = userSessions.get(interaction.user.id);
      const baseName = basesData[session?.baseKey]?.name || 'Base';
      const ch = await interaction.guild.channels.create({
        name: `ticket-${session.baseKey}-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }]
      });

      ticketsDataMap.set(ch.id, { openedBy: interaction.user.tag, baseName });

      const actionMenu = new StringSelectMenuBuilder().setCustomId('ticket_action_select').setPlaceholder('⚙️ إعدادات التذكرة...').addOptions([
        { label: 'Close with Reason', value: 'close_with_reason', emoji: '🔒' },
        { label: 'Request Ticket Copy', value: 'request_copy', emoji: '📄' }
      ]);

      await ch.send({ embeds: [new EmbedBuilder().setTitle(`🎫 طلب لون ${baseName}`).addFields({ name: '👤 المالك', value: `<@${interaction.user.id}>` }).setColor('#6366f1')], components: [new ActionRowBuilder().addComponents(actionMenu)] });
      addLog('tickets', 'فتح تذكرة', `تم فتح تذكرة ${baseName} للعضو @${interaction.user.username}`);
      await interaction.update({ content: `🎉 تم فتح تذكرتك: ${ch}`, components: [] });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_action_select') {
    if (interaction.values[0] === 'close_with_reason') {
      const modal = new ModalBuilder().setCustomId('modal_close_reason').setTitle('إغلاق التذكرة');
      modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('close_reason_input').setLabel('السبب').setStyle(TextInputStyle.Paragraph).setRequired(true)));
      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal_close_reason') {
    await interaction.reply('⏳ جاري حفظ الأرشيف وإغلاق التذكرة...');
    const ticketData = ticketsDataMap.get(interaction.channel.id) || { openedBy: 'Unknown', baseName: 'عام' };
    const { fileId } = await saveFullTranscript(interaction.channel, interaction.user, ticketData.openedBy, ticketData.baseName);
    addLog('tickets', 'إغلاق تذكرة', `أُغلقت التذكرة بواسطة @${interaction.user.username}`, fileId);
    setTimeout(() => { ticketsDataMap.delete(interaction.channel.id); interaction.channel.delete().catch(() => {}); }, 3000);
  }
});

client.login(TOKEN);
