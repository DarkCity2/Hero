require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits: I, 
  Partials: P, 
  Collection, 
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

// ------------------- 1. بيانات قواعد الألوان بنظام الشرائح المزدوجة -------------------
let basesData = {
  silver: { 
    name: 'Silver Base', emoji: '⚪', 
    tiers: [
      { maxQty: 20, price: '20 ريال' },
      { maxQty: 40, price: '40 ريال' },
      { maxQty: 999, price: '60 ريال' }
    ],
    itemTiers: [
      { maxQty: 10, items: 'كروماندو كاندي وفوق باستثناء البارتي' },
      { maxQty: 999, items: 'دب كاندي وفوق' }
    ]
  },
  gold: { 
    name: 'Gold Base', emoji: '🟡', 
    tiers: [
      { maxQty: 20, price: '20 ريال' },
      { maxQty: 40, price: '40 ريال' },
      { maxQty: 999, price: '60 ريال' }
    ],
    itemTiers: [
      { maxQty: 10, items: 'كروماندو كاندي وفوق باستثناء البارتي' },
      { maxQty: 999, items: 'دب كاندي وفوق' }
    ]
  },
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

let serverSettings = {
  ticketCategories: '',
  ownerRoleName: 'Owner'
};

const ticketsDataMap = new Map();

const logsStore = {
  roles: [],
  messages: [],
  voice: [],
  tickets: [],
  channels: [],
  members: [],
  bans: []
};

function addLog(category, action, details) {
  const time = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
  const logItem = { action, details, time };
  
  if (logsStore[category]) {
    logsStore[category].unshift(logItem);
    if (logsStore[category].length > 100) logsStore[category].pop();
  }
}

function getTierPrice(tiersArray, userQuantity) {
  if (!tiersArray || tiersArray.length === 0) return { price: 'غير محدد', tierText: 'غير محدد' };
  const sorted = [...tiersArray].sort((a, b) => a.maxQty - b.maxQty);
  for (let tier of sorted) {
    if (userQuantity <= tier.maxQty) {
      return { price: tier.price, tierText: `${tier.maxQty} وتحت` };
    }
  }
  const lastTier = sorted[sorted.length - 1];
  return { price: lastTier.price, tierText: `فوق ${lastTier.maxQty}` };
}

function getTierItems(itemTiersArray, userQuantity) {
  if (!itemTiersArray || itemTiersArray.length === 0) return { items: 'غير محدد', tierText: 'غير محدد' };
  const sorted = [...itemTiersArray].sort((a, b) => a.maxQty - b.maxQty);
  for (let tier of sorted) {
    if (userQuantity <= tier.maxQty) {
      return { items: tier.items, tierText: `${tier.maxQty} وتحت` };
    }
  }
  const lastTier = sorted[sorted.length - 1];
  return { items: lastTier.items, tierText: `فوق ${lastTier.maxQty}` };
}

// ------------------- 2. إعدادات Express -------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'void_ultimate_logs_2026',
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
    if (client.user && client.user.displayAvatarURL()) {
      botIconUrl = client.user.displayAvatarURL({ extension: 'png', size: 256 });
    }
  } catch(e){}

  let totalLogsCount = Object.values(logsStore).reduce((acc, arr) => acc + arr.length, 0);

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
      
      body::before {
        content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.08), transparent 45%),
                    radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.08), transparent 45%);
        z-index: 1; pointer-events: none;
      }

      .sidebar {
        width: 250px; background: rgba(13, 15, 23, 0.88); backdrop-filter: blur(25px);
        border-left: 1px solid rgba(255, 255, 255, 0.08); padding: 22px 16px;
        display: flex; flex-direction: column; justify-content: space-between;
        position: fixed; right: 0; top: 0; bottom: 0; z-index: 100;
      }

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
      
      .btn-del { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 7px 12px; cursor: pointer; font-weight: 700; margin-top: 6px; }
      .btn-add { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 6px 14px; cursor: pointer; font-weight: 700; font-size: 12px; margin-top: 6px; display: inline-block; }

      input, textarea, select { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(10, 12, 18, 0.85); color: #f3f4f6; outline: none; margin-top: 6px; font-size: 13px; }
      input:focus, textarea:focus, select:focus { border-color: #6366f1; box-shadow: 0 0 15px rgba(99, 102, 241, 0.25); }
      select option { background: #0f1118; color: #fff; }
      label { font-size: 12px; font-weight: 700; color: #d1d5db; display: block; margin-top: 10px; }
      
      .btn { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; padding: 11px 22px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); margin-top: 16px; font-size: 13px; text-align: center; text-decoration: none; display: inline-block; }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5); }

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
    </style>
    <script>
      function addTierRow(baseKey) {
        const container = document.getElementById('tier-container-' + baseKey);
        const div = document.createElement('div');
        div.className = 'tier-row';
        div.innerHTML = '<input type="number" name="' + baseKey + '_maxQty[]" placeholder="العدد" required><span class="tier-label">وتحت ⟵</span><input type="text" name="' + baseKey + '_price[]" placeholder="السعر (مثال: 20 ريال)" required><button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button>';
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
          <div>
            <div class="brand-title">VOID BOT</div>
            <div class="brand-sub">Community Center</div>
          </div>
        </div>
        <div class="nav-group">
          <div class="nav-label">التهيئة والتحكم</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}"><span>🎨 ألوان القواعد (17)</span></a>
          <a href="/tickets" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}"><span>🎫 نظام التذاكر</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label">المراقبة المباشرة</div>
          <a href="/logs" class="nav-item ${activeTab === 'logs' ? 'active' : ''}"><span>📜 سجلات الأحداث</span><div class="badge-live">LIVE</div></a>
          <a href="/moderation" class="nav-item ${activeTab === 'moderation' ? 'active' : ''}"><span>🔨 أدوات الإدارة</span></a>
          <a href="/security" class="nav-item ${activeTab === 'security' ? 'active' : ''}"><span>🛡️ درع الحماية</span></a>
        </div>
      </div>
      <a href="/logout" class="btn" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #fca5a5; font-size: 12px; padding: 8px;">🚪 تسجيل الخروج</a>
    </div>

    <div class="main-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div><div class="stat-title">الأعضاء</div><div class="stat-num">${memberCount}</div></div>
          <div style="font-size:20px;">👥</div>
        </div>
        <div class="stat-card">
          <div><div class="stat-title">القواعد</div><div class="stat-num">17</div></div>
          <div style="font-size:20px;">🎨</div>
        </div>
        <div class="stat-card">
          <div><div class="stat-title">تذاكر نشطة</div><div class="stat-num">${ticketsDataMap.size}</div></div>
          <div style="font-size:20px;">🎫</div>
        </div>
        <div class="stat-card">
          <div><div class="stat-title">إجمالي السجلات</div><div class="stat-num">${totalLogsCount}</div></div>
          <div style="font-size:20px;">📜</div>
        </div>
      </div>
      ${content}
    </div>
  </body>
  </html>
  `;
};

app.get('/login', (req, res) => {
  let botIconUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
  try {
    if (client.user && client.user.displayAvatarURL()) {
      botIconUrl = client.user.displayAvatarURL({ extension: 'png', size: 256 });
    }
  } catch(e){}

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void • Admin Portal</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap');
        body { background: #08090d; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Cairo', sans-serif; }
        .login-card { background: rgba(15, 18, 28, 0.85); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 35px 30px; border-radius: 20px; text-align: center; width: 340px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .brand-avatar { width: 70px; height: 70px; border-radius: 16px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.15); }
        input { width: 100%; padding: 11px 14px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(8, 10, 16, 0.9); color: #fff; text-align: center; font-size: 13px; margin-bottom: 16px; outline: none; }
        button { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; padding: 11px; border-radius: 10px; width: 100%; font-weight: 700; font-size: 13px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <img src="${botIconUrl}" class="brand-avatar" alt="Server Logo">
        <h1 style="font-size: 20px; margin-bottom: 4px;" class="purple-gradient">VOID COMMUNITY</h1>
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 20px;">تسجيل الدخول للوحة التحكم</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول للوحة</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/login/pass', (req, res) => {
  if (req.body.password === DASHBOARD_PASSWORD) {
    req.session.passAuthenticated = true;
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(discordAuthUrl);
  } else {
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ كلمة المرور غير صحيحة!<br><br><a href="/login" style="color:#a78bfa;">إعادة المحاولة</a></h2>');
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

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const tokenData = await tokenRes.json();

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    req.session.authenticated = true;
    req.session.user = userData;
    res.redirect('/');
  } catch (error) {
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ فشل المصادقة مع ديسكورد.<br><a href="/login" style="color:#a78bfa;">إعادة المحاولة</a></h2>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  let channelOptionsHTML = '<option value="" disabled selected>اختر القناة لنشر اللوحة...</option>';
  try {
    client.guilds.cache.forEach(guild => {
      guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach(channel => {
        channelOptionsHTML += `<option value="${channel.id}"># ${channel.name} — (${guild.name})</option>`;
      });
    });
  } catch (e) {}

  const content = `
    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="purple-gradient" style="margin: 0; font-size: 18px;">🎨 شرائح أسعار النواقص والمقابل بالأغراض (17 قاعدة)</h1>
        <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 12px;">مرحباً، ${req.session.user?.username || 'المسؤول'} 👋 | يمكنك إضافة وتعديل شرائح المادي والأغراض لكل قاعدة بسهولة.</p>
      </div>
      <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 11px;">🟢 النظام المزدوج الشامل</span>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 15px;" class="purple-gradient">📢 إرسال لوحة الألوان إلى ديسكورد</h2>
      <form action="/send-panel" method="POST">
        <label>اختر القناة المخصصة:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <button type="submit" class="btn">🚀 نشر لوحة الألوان الآن</button>
      </form>
    </div>

    <form action="/save-colors" method="POST">
      <h2 style="font-size: 15px; margin-bottom: 12px;" class="purple-gradient">⚡ إعدادات شرائح السعر والأغراض لكل قاعدة</h2>
      ${Object.keys(basesData).map(key => `
        <div class="glass-card" style="padding: 18px;">
          <h3 style="margin: 0 0 10px 0; color: #a855f7; font-size: 15px;">${basesData[key].emoji}${basesData[key].name}</h3>
          
          <label style="margin-bottom: 8px;">💰 شرائح تسعير النواقص (المقابل المادي):</label>
          <div id="tier-container-${key}">
            ${(basesData[key].tiers || []).map(t => `
              <div class="tier-row">
                <input type="number" name="${key}_maxQty[]" value="${t.maxQty}" placeholder="العدد" required>
                <span class="tier-label">وتحت ⟵</span>
                <input type="text" name="${key}_price[]" value="${t.price}" placeholder="السعر" required>
                <button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-add" onclick="addTierRow('${key}')">➕ إضافة شريحة سعر جديدة</button>

          <label style="margin-top: 18px; margin-bottom: 8px;">🎁 شرائح تسعير النواقص (المقابل بالأغراض):</label>
          <div id="item-tier-container-${key}">
            ${(basesData[key].itemTiers || []).map(it => `
              <div class="tier-row">
                <input type="number" name="${key}_itemMaxQty[]" value="${it.maxQty}" placeholder="العدد" required>
                <span class="tier-label">وتحت ⟵</span>
                <input type="text" name="${key}_itemText[]" value="${it.items}" placeholder="شروط الأغراض" required>
                <button type="button" class="btn-del" onclick="this.parentElement.remove()">🗑️</button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-add" style="background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border-color: rgba(168, 85, 247, 0.3);" onclick="addItemTierRow('${key}')">➕ إضافة شريحة أغراض جديدة</button>
        </div>
      `).join('')}
      <button type="submit" class="btn" style="position: sticky; bottom: 20px; z-index: 10;">💾 حفظ كافة التعديلات والشرائح</button>
    </form>
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
      for (let i = 0; i < maxQtys.length; i++) {
        if (maxQtys[i] && prices[i]) {
          newTiers.push({ maxQty: Number(maxQtys[i]), price: prices[i] });
        }
      }
    } else if (maxQtys && prices) {
      newTiers.push({ maxQty: Number(maxQtys), price: prices });
    }
    basesData[key].tiers = newTiers;

    const itemMaxQtys = req.body[`${key}_itemMaxQty[]`];
    const itemTexts = req.body[`${key}_itemText[]`];
    let newItemTiers = [];
    if (Array.isArray(itemMaxQtys)) {
      for (let i = 0; i < itemMaxQtys.length; i++) {
        if (itemMaxQtys[i] && itemTexts[i]) {
          newItemTiers.push({ maxQty: Number(itemMaxQtys[i]), items: itemTexts[i] });
        }
      }
    } else if (itemMaxQtys && itemTexts) {
      newItemTiers.push({ maxQty: Number(itemMaxQtys), items: itemTexts });
    }
    basesData[key].itemTiers = newItemTiers;
  });

  addLog('roles', 'تحديث القواعد', `تم تحديث شرائح الأسعار والأغراض بواسطة @${req.session.user?.username}`);
  res.redirect('/');
});

app.get('/tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin: 0; font-size: 18px;">🎫 إعدادات نظام التذاكر والكاتيجوري</h1>
      <p style="color: #9ca3af; margin-top: 4px; font-size: 12px;">تحديد الفئات المخصصة للتذاكر ورتبة التحكم.</p>
    </div>
    
    <form action="/save-tickets" method="POST">
      <div class="glass-card">
        <label>معرفات كاتيجوري التذاكر (Category IDs - مفصولة بفاصلة):</label>
        <input type="text" name="ticketCategories" value="${serverSettings.ticketCategories}" placeholder="مثال: 123456789012345678, 987654321098765432">

        <label>اسم رتبة الـ Owner المسؤول عن خيارات الإدارة:</label>
        <input type="text" name="ownerRoleName" value="${serverSettings.ownerRoleName}" placeholder="Owner">

        <button type="submit" class="btn">💾 حفظ الإعدادات</button>
      </div>
    </form>
  `;
  res.send(renderUltimateLayout('tickets', content));
});

app.post('/save-tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  if (req.body.ticketCategories !== undefined) serverSettings.ticketCategories = req.body.ticketCategories;
  if (req.body.ownerRoleName) serverSettings.ownerRoleName = req.body.ownerRoleName;
  addLog('tickets', 'تحديث التذاكر', `تم تحديث إعدادات التذاكر بواسطة @${req.session.user?.username}`);
  res.redirect('/tickets');
});

const renderLogTableSection = (title, badgeClass, logsArray) => {
  const rows = logsArray.length === 0 
    ? `<tr><td colspan="3" style="text-align: center; color: #6b7280; padding: 15px; font-size: 12px;">لا توجد أحداث مسجلة في هذا القسم حتى الآن.</td></tr>`
    : logsArray.map(log => `
      <tr>
        <td style="font-weight: 700; color: #ffffff; width: 35%;">${log.action}</td>
        <td style="color: #d1d5db; width: 45%;">${log.details}</td>
        <td style="color: #6b7280; font-size: 11px; white-space: nowrap; text-align: left; width: 20%;">${log.time}</td>
      </tr>
    `).join('');

  return `
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 15px;" class="purple-gradient">${title}</h3>
        <span class="log-badge ${badgeClass}">${logsArray.length} سجل</span>
      </div>
      <div style="overflow-x: auto;">
        <table class="logs-table">
          <thead>
            <tr>
              <th>الحدث</th>
              <th>التفاصيل الكاملة</th>
              <th style="text-align: left;">التوقيت</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin: 0; font-size: 18px;">📜 سجلات الأحداث الشاملة الكاملة (Live Logs)</h1>
      <p style="color: #9ca3af; margin-top: 4px; font-size: 12px;">مراقبة حية ولحظية لكل شاردة وواردة في السيرفر (رومات، رتب، أعضاء، تذاكر، رسائل، وصوت).</p>
    </div>

    ${renderLogTableSection('👑 سجلات الرتب (Roles)', 'badge-roles', logsStore.roles)}
    ${renderLogTableSection('💬 سجلات الرسائل (Messages)', 'badge-messages', logsStore.messages)}
    ${renderLogTableSection('🎙️ سجلات الرومات الصوتية (Voice)', 'badge-voice', logsStore.voice)}
    ${renderLogTableSection('🎫 سجلات التذاكر (Tickets)', 'badge-tickets', logsStore.tickets)}
    ${renderLogTableSection('📁 سجلات الرومات الكتابية والصوتية (Channels - إنشاء/حذف/تعديل)', 'badge-channels', logsStore.channels)}
    ${renderLogTableSection('👥 سجلات الأعضاء (Members - انضمام/مغادرة)', 'badge-members', logsStore.members)}
    ${renderLogTableSection('🔨 سجلات الحظر (Bans)', 'badge-bans', logsStore.bans)}
  `;

  res.send(renderUltimateLayout('logs', content));
});

app.get('/moderation', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  
  let channelOptionsHTML = '<option value="" disabled selected>اختر القناة لنشر الإعلان...</option>';
  try {
    client.guilds.cache.forEach(guild => {
      guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach(channel => {
        channelOptionsHTML += `<option value="${channel.id}"># ${channel.name} — (${guild.name})</option>`;
      });
    });
  } catch (e) {}

  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:18px;">🔨 أدوات الإدارة السريعة</h1>
      <p style="color:#9ca3af; margin-top:4px; font-size:12px;">إرسال إعلانات رسمية من لوحة التحكم.</p>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 15px;" class="purple-gradient">📣 إرسال إعلان رسمي للسيرفر</h2>
      <form action="/send-announcement" method="POST">
        <label>اختر القناة:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <label>عنوان الإعلان:</label>
        <input type="text" name="title" placeholder="العنوان" required>
        <label>محتوى الإعلان:</label>
        <textarea name="message" rows="3" placeholder="نص الإعلان..." required></textarea>
        <button type="submit" class="btn">🚀 إرسال الإعلان</button>
      </form>
    </div>
  `;
  res.send(renderUltimateLayout('moderation', content));
});

app.post('/send-announcement', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  try {
    const channel = await client.channels.fetch(req.body.channel_id);
    const embed = new EmbedBuilder()
      .setTitle(`📢 ${req.body.title}`)
      .setDescription(req.body.message)
      .setColor('#6366f1')
      .setFooter({ text: 'Void Community Official Announcement' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    addLog('messages', 'إعلان رسمي', `تم إرسال إعلان بعنوان "${req.body.title}" في الروم #${channel.name}`);
    res.redirect('/moderation');
  } catch(e) {
    res.send(`<h2 style="color:red; text-align:center; margin-top:50px;">❌ خطأ: ${e.message}<br><br><a href="/moderation">العودة</a></h2>`);
  }
});

app.get('/security', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:18px;">🛡️ مركز الحماية والأمان</h1>
      <p style="color:#9ca3af; margin-top:4px; font-size:12px;">مراقبة درع الحماية التلقائي للبوت.</p>
    </div>

    <div class="glass-card">
      <h2 style="font-size:15px;" class="purple-gradient">⚡ خيارات الحماية الحالية</h2>
      <div style="margin-top: 12px; font-size: 12px;">
        <p>• الحماية من التكرار والسبام (Anti-Spam): <span style="color:#34d399; font-weight:700;">مفعلة</span></p>
        <p>• الحماية من الهجمات (Anti-Raid): <span style="color:#34d399; font-weight:700;">مفعلة</span></p>
        <p>• منع روابط الديسكورد والخارجية: <span style="color:#a855f7; font-weight:700;">نشطة</span></p>
      </div>
    </div>
  `;
  res.send(renderUltimateLayout('security', content));
});

app.post('/send-panel', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  try {
    const channel = await client.channels.fetch(req.body.channel_id);
    const baseOptions = Object.keys(basesData).map(key => ({
      label: basesData[key].name,
      value: key,
      description: `تقديم طلب لون ${basesData[key].name}`,
      emoji: basesData[key].emoji
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_base_color')
      .setPlaceholder('اختر لون القاعدة المطلوبة...')
      .addOptions(baseOptions);

    const embed = new EmbedBuilder()
      .setTitle('🎨 Void Community | نظام ألوان ماب النطة')
      .setDescription('اختر القاعدة التي تريد طلبها من القائمة المنسدلة أدناه لتقديم بياناتك ونوع المقابل بكل سهولة:')
      .setColor('#6366f1')
      .setFooter({ text: 'Void Community • Advanced Ticket System' });

    await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
    addLog('tickets', 'نشر لوحة الألوان', `تم نشر لوحة الألوان بنجاح في القناة: #${channel.name}`);
    res.redirect('/');
  } catch (err) {
    res.send(`<h2 style="color:red; text-align:center; margin-top:50px;">❌ خطأ أثناء النشر: ${err.message}<br><br><a href="/">العودة للوحة</a></h2>`);
  }
});

app.listen(PORT, () => console.log(`🌐 Dashboard Active on port ${PORT}`));

// ------------------- 7. بوت ديسكورد والمراقبة الشاملة والكاملة -------------------
const client = new Client({
  intents: [
    I.Guilds, I.GuildMembers, I.GuildMessages, I.MessageContent,
    I.GuildMessageReactions, I.GuildVoiceStates, I.GuildModeration, I.GuildInvites,
    I.GuildExpressions ?? I.GuildEmojisAndStickers
  ],
  partials: [P.Message, P.Channel, P.Reaction, P.User, P.GuildMember]
});

const userSessions = new Map();

async function createTranscriptBuffer(channel, closedByUser) {
  const fetchedMessages = await channel.messages.fetch({ limit: 100 });
  const sortedMessages = Array.from(fetchedMessages.values())
    .reverse()
    .filter(msg => !msg.content.includes('جاري حفظ محادثات التذكرة'));

  let transcriptContent = `========================================================\n`;
  transcriptContent += `             VOID COMMUNITY - TICKET TRANSCRIPT        \n`;
  transcriptContent += `========================================================\n`;
  transcriptContent += `• Ticket Name : ${channel.name}\n`;
  transcriptContent += `• Closed By   : ${closedByUser.tag}\n`;
  transcriptContent += `• Archive Date: ${new Date().toUTCString()}\n`;
  transcriptContent += `========================================================\n\n`;

  sortedMessages.forEach(msg => {
    const timeStr = msg.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let content = msg.content;

    if (msg.embeds.length > 0) {
      msg.embeds.forEach(e => {
        if (e.title) content += `\n[Embed Title: ${e.title}]`;
        if (e.description) content += `\n${e.description}`;
        if (e.fields) {
          e.fields.forEach(f => {
            content += `\n   ↳ ${f.name}: ${f.value}`;
          });
        }
      });
    }

    if (content.trim()) {
      transcriptContent += `[${timeStr}] ${msg.author.tag}: ${content.trim()}\n`;
    }
  });

  transcriptContent += `\n========================================================\n`;
  transcriptContent += `              End of Transcript - Void Bot              \n`;
  transcriptContent += `========================================================`;

  return {
    buffer: Buffer.from(transcriptContent, 'utf-8'),
    count: sortedMessages.length
  };
}

client.once('ready', () => {
  console.log(`✅ [Void Community] Bot Ready as: ${client.user.tag}`);
  addLog('roles', 'تشغيل البوت', `تم تشغيل البوت بنجاح باسم ${client.user.tag}`);
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

  addedRoles.forEach(role => {
    addLog('roles', 'إضافة رتبة لعضو', `تم إعطاء الرتبة [${role.name}] للعضو @${newMember.user.username}`);
  });

  removedRoles.forEach(role => {
    addLog('roles', 'إزالة رتبة من عضو', `تم إزالة الرتبة [${role.name}] من العضو @${newMember.user.username}`);
  });
});

client.on('messageDelete', message => {
  if (message.author?.bot) return;
  const authorName = message.author ? `@${message.author.username}` : 'عضو غير معروف';
  const contentStr = message.content ? `"${message.content}"` : 'وسائط / إمبد';
  const channelName = message.channel ? `#${message.channel.name}` : 'روم غير معروف';
  addLog('messages', 'حذف رسالة', `حذف رسالة للعضو ${authorName} في القناة ${channelName}: ${contentStr}`);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (oldMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  const authorName = oldMessage.author ? `@${oldMessage.author.username}` : 'عضو';
  const channelName = oldMessage.channel ? `#${oldMessage.channel.name}` : 'روم';
  addLog('messages', 'تعديل رسالة', `العضو ${authorName} في ${channelName} عدّل رسالته من: "${oldMessage.content}" إلى: "${newMessage.content}"`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const memberName = `@${newState.member.user.username}`;
  if (!oldState.channelId && newState.channelId) {
    addLog('voice', 'دخول روم صوتي', `انضم العضو ${memberName} إلى الروم الصوتي #${newState.channel.name}`);
  } else if (oldState.channelId && !newState.channelId) {
    addLog('voice', 'خروج روم صوتي', `غادر العضو ${memberName} الروم الصوتي #${oldState.channel.name}`);
  } else if (oldState.channelId !== newState.channelId) {
    addLog('voice', 'تنقل بين الرومات الصوتية', `انتقل العضو ${memberName} من #${oldState.channel?.name || 'روم'} إلى #${newState.channel.name}`);
  }
});

client.on('channelCreate', channel => {
  const chName = channel.name ? `#${channel.name}` : 'روم';
  const chType = channel.type === ChannelType.GuildText ? 'كتابي' : channel.type === ChannelType.GuildVoice ? 'صوتي' : 'كاتيجوري';
  addLog('channels', 'إنشاء روم جديد', `تم إنشاء روم ${chType} جديد باسم: ${chName}`);
});

client.on('channelDelete', channel => {
  const chName = channel.name ? `#${channel.name}` : 'روم';
  const chType = channel.type === ChannelType.GuildText ? 'كتابي' : channel.type === ChannelType.GuildVoice ? 'صوتي' : 'كاتيجوري';
  addLog('channels', 'حذف روم', `تم حذف روم ${chType}: ${chName}`);
});

client.on('channelUpdate', (oldChannel, newChannel) => {
  if (oldChannel.name !== newChannel.name) {
    addLog('channels', 'تعديل روم', `تم تغيير اسم الروم من #${oldChannel.name} إلى #${newChannel.name}`);
  }
});

client.on('guildMemberAdd', member => {
  addLog('members', 'انضمام عضو', `العضو @${member.user.username} انضم إلى السيرفر.`);
});

client.on('guildMemberRemove', member => {
  addLog('members', 'مغادرة عضو', `العضو @${member.user.username} غادر السيرفر.`);
});

client.on('guildBanAdd', ban => {
  addLog('bans', 'حظر عضو (Ban)', `تم حظر العضو @${ban.user.username} من السيرفر.`);
});

client.on('guildBanRemove', ban => {
  addLog('bans', 'فك حظر (Unban)', `تم فك الحظر عن العضو @${ban.user.username}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_base_color') {
    const selectedKey = interaction.values[0];
    const baseInfo = basesData[selectedKey] || { name: selectedKey };

    const modal = new ModalBuilder()
      .setCustomId(`modal_info_${selectedKey}`)
      .setTitle(`${baseInfo.name} بيانات ضمان`);

    const guaranteeInput = new TextInputBuilder()
      .setCustomId('guarantee_val').setLabel('اكتب الضمان حقك').setPlaceholder('اكتب الضمان').setStyle(TextInputStyle.Short).setRequired(true);

    const missingInput = new TextInputBuilder()
      .setCustomId('missing_val').setLabel('اكتب عدد نواقصك (أرقام فقط)').setPlaceholder('مثال: 15').setStyle(TextInputStyle.Short).setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(guaranteeInput), new ActionRowBuilder().addComponents(missingInput));
    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_info_')) {
    const baseKey = interaction.customId.replace('modal_info_', '');
    const missingValRaw = interaction.fields.getTextInputValue('missing_val');
    const missingNumber = parseInt(missingValRaw.replace(/[^0-9]/g, '')) || 1;

    userSessions.set(interaction.user.id, {
      baseKey: baseKey,
      guarantee: interaction.fields.getTextInputValue('guarantee_val'),
      missing: missingValRaw,
      missingNum: missingNumber
    });

    const paymentMenu = new StringSelectMenuBuilder()
      .setCustomId('select_payment')
      .setPlaceholder('اختر نوع المقابل')
      .addOptions([
        { label: 'مقابل مادي (حساب الشريحة تلقائياً)', value: 'money', description: 'عرض السعر حسب شريحة نواقصك', emoji: '💰' },
        { label: 'أغراض داخل اللعبة (حساب الشريحة تلقائياً)', value: 'items', description: 'عرض الأغراض حسب شريحة نواقصك', emoji: '🎁' }
      ]);

    await interaction.reply({
      content: `✅ **تم حفظ الضمان وعدد النواقص (${missingNumber}).**\n\n🎨 **اختر نوع المقابل الآن للحصول على ${basesData[baseKey]?.name || baseKey}:**`,
      components: [new ActionRowBuilder().addComponents(paymentMenu)],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_payment') {
    const payType = interaction.values[0];
    const session = userSessions.get(interaction.user.id);
    if (!session) return interaction.reply({ content: '❌ انتهت الجلسة، يرجى البدء من جديد.', ephemeral: true });

    const baseConfig = basesData[session.baseKey] || { name: session.baseKey, tiers: [], itemTiers: [] };
    
    let textDetails = '';
    if (payType === 'money') {
      const { price, tierText } = getTierPrice(baseConfig.tiers, session.missingNum);
      textDetails = `💰 **المقابل المادي للون ${baseConfig.name}:**\n💵 **السعر المطلوب لعدد (${session.missingNum}) نواقص:** ${price}\n*(شريحة ${tierText})*`;
    } else {
      const { items, tierText } = getTierItems(baseConfig.itemTiers, session.missingNum);
      textDetails = `🎁 **مقابل الأغراض للون ${baseConfig.name}:**\n📦 **الأغراض المطلوبة لعدد (${session.missingNum}) نواقص:** ${items}\n*(شريحة ${tierText})*`;
    }

    const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_accept').setLabel('قبول').setEmoji('✅').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn_reject').setLabel('رفض').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    await interaction.update({
      content: `${textDetails}\n\n**ضمانك:** ${session.guarantee}\n**عدد نواقصك:** ${session.missing}\n\n**هل توافق على هذا المقابل؟**`,
      components: [btns]
    });
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'btn_accept') {
      const session = userSessions.get(interaction.user.id);
      const baseName = basesData[session?.baseKey]?.name || 'Base';

      const permissionOverwrites = [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ];

      const specificRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === baseName.toLowerCase());
      if (specificRole) {
        permissionOverwrites.push({
          id: specificRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        });
      }

      const prefixKey = session?.baseKey ? session.baseKey : 'color';
      const channelName = `ticket-${prefixKey}-${interaction.user.username}`.toLowerCase();

      const channelOptions = {
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: permissionOverwrites
      };

      if (serverSettings.ticketCategories) {
        const categories = serverSettings.ticketCategories.split(',').map(c => c.trim()).filter(Boolean);
        if (categories.length > 0) {
          const randomCat = categories[Math.floor(Math.random() * categories.length)];
          channelOptions.parent = randomCat;
        }
      }

      const ch = await interaction.guild.channels.create(channelOptions);

      const openTimestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;
      ticketsDataMap.set(ch.id, {
        openedBy: interaction.user.id,
        claimedBy: null,
        openTime: openTimestamp,
        baseName: baseName
      });

      const actionMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_action_select')
        .setPlaceholder('⚙️ اختر إجراء التذكرة الاحترافي...')
        .addOptions([
          { label: 'Close with Reason', value: 'close_with_reason', description: 'إغلاق التذكرة مع كتابة السبب', emoji: '🔒' },
          { label: 'Add User to Ticket', value: 'add_user', description: 'إضافة عضو إلى التذكرة الحالية', emoji: '👥' },
          { label: 'Member PM Reminder', value: 'pm_reminder', description: 'إرسال تذكير خاص لصاحب التذكرة', emoji: '✉️' },
          { label: 'Request Ticket Copy', value: 'request_copy', description: 'طلب نسخة نصية من محادثات التذكرة', emoji: '📄' }
        ]);

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Void Community | طلب لون ${baseName}`)
        .setDescription('مرحباً بك في تذكرتك الخاصة. يرجى انتظار مسؤولي القاعدة لخدمتك.')
        .addFields(
          { name: '👤 العضو', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🛡️ الضمان', value: session ? session.guarantee : 'غير محدد', inline: true },
          { name: '🔢 عدد النواقص', value: session ? `${session.missing}` : 'غير محدد', inline: true },
          { name: '👑 الرتبة المخولة', value: specificRole ? `<@&${specificRole.id}>` : 'الإدارة العامة', inline: false }
        )
        .setColor('#6366f1')
        .setFooter({ text: 'Void Community • Advanced Ticket System' })
        .setTimestamp();

      await ch.send({ 
        content: `<@${interaction.user.id}> ${specificRole ? `<@&${specificRole.id}>` : ''}`, 
        embeds: [embed], 
        components: [new ActionRowBuilder().addComponents(actionMenu)] 
      });

      addLog('tickets', 'فتح تذكرة', `تم فتح تذكرة لون ${baseName} بواسطة @${interaction.user.username}`);
      await interaction.update({ content: `🎉 **تم قبول الطلب بنجاح!**\nتم فتح القناة الخاصة بك: ${ch}`, components: [] });
    }

    if (interaction.customId === 'btn_reject') {
      await interaction.update({ content: '❌ **تم إلغاء الطلب.**', components: [] });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_action_select') {
    const action = interaction.values[0];
    const member = interaction.member;
    const ticketData = ticketsDataMap.get(interaction.channel.id) || {};
    const baseName = ticketData.baseName || '';

    const isServerAdministrator = member.permissions.has(PermissionFlagsBits.Administrator);
    const hasBaseRole = member.roles.cache.some(r => r.name.toLowerCase() === baseName.toLowerCase());
    const hasOwnerRole = member.roles.cache.some(r => r.name.toLowerCase() === serverSettings.ownerRoleName.toLowerCase());

    if (!hasBaseRole && !hasOwnerRole && !isServerAdministrator) {
      return interaction.reply({ content: '❌ **عذراً، هذه القائمة مخصصة فقط لمسؤولي التذاكر وأصحاب الرتب!**', ephemeral: true });
    }

    if (action === 'close_with_reason') {
      if (!hasBaseRole && !hasOwnerRole && !isServerAdministrator) {
        return interaction.reply({ content: '❌ **عذراً، هذا الخيار مخصص فقط لأصحاب رتبة القاعدة أو الـ Owner!**', ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId('modal_close_reason')
        .setTitle('Close Ticket with Reason');

      const reasonInput = new TextInputBuilder()
        .setCustomId('close_reason_input')
        .setLabel('سبب إغلاق التذكرة')
        .setPlaceholder('اكتب سبب الإغلاق هنا...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
      return await interaction.showModal(modal);
    }

    if (['add_user', 'pm_reminder', 'request_copy'].includes(action)) {
      if (!hasOwnerRole && !isServerAdministrator) {
        return interaction.reply({ content: '❌ **عذراً، هذه الخيارات مخصصة حصرياً لرتبة الـ Owner فقط!**', ephemeral: true });
      }

      if (action === 'add_user') {
        await interaction.deferReply({ ephemeral: true });
        const userSelect = new UserSelectMenuBuilder()
          .setCustomId('select_user_to_add')
          .setPlaceholder('اختر العضو المراد إضافته للتذكرة...')
          .setMaxValues(1);

        return await interaction.editReply({
          content: '👤 **اختر العضو الذي تريد إضافته إلى التذكرة:**',
          components: [new ActionRowBuilder().addComponents(userSelect)]
        });
      }

      if (action === 'pm_reminder') {
        await interaction.deferReply({ ephemeral: true });
        const ownerId = ticketData.openedBy;
        if (ownerId) {
          try {
            const ownerUser = await client.users.fetch(ownerId);
            await ownerUser.send(`🔔 **تذكير:** بخصوص تذكرتك المفتوحة بـ Void Community في روم: ${interaction.channel}`);
            return await interaction.editReply({ content: '✅ **تم إرسال تذكير في الخاص لصاحب التذكرة بنجاح!**' });
          } catch (e) {
            return await interaction.editReply({ content: '❌ **تعذر إرسال التذكير، الخاص مغلق لدى العضو.**' });
          }
        } else {
          return await interaction.editReply({ content: '❌ **لم يتم العثور على بيانات صاحب التذكرة.**' });
        }
      }

      if (action === 'request_copy') {
        await interaction.deferReply({ ephemeral: true });
        const { buffer } = await createTranscriptBuffer(interaction.channel, interaction.user);
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });
        return await interaction.editReply({ content: '📄 **تفضل نسخة من محادثات التذكرة الحالية:**', files: [attachment] });
      }
    }
  }

  if (interaction.isUserSelectMenu() && interaction.customId === 'select_user_to_add') {
    const targetUserId = interaction.values[0];
    await interaction.channel.permissionOverwrites.edit(targetUserId, {
      ViewChannel: true,
      SendMessages: true
    });
    addLog('tickets', 'إضافة عضو لتذكرة', `تم إضافة العضو <@${targetUserId}> إلى التذكرة #${interaction.channel.name}`);
    await interaction.reply({ content: `✅ **تمت إضافة العضو <@${targetUserId}> للتذكرة بنجاح!**` });
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_close_reason')) {
    const reason = interaction.fields.getTextInputValue('close_reason_input');
    await interaction.reply('⏳ **جاري حفظ محادثات التذكرة وتسجيلها في لوحة التحكم وإغلاق القناة...**');

    const { count } = await createTranscriptBuffer(interaction.channel, interaction.user);

    addLog('tickets', 'إغلاق تذكرة', `التذكرة #${interaction.channel.name} أُغلقت بواسطة @${interaction.user.username} | السبب: ${reason} | عدد الرسائل: ${count}`);

    setTimeout(() => {
      ticketsDataMap.delete(interaction.channel.id);
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

client.login(TOKEN);
module.exports = client;
