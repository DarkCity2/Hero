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
  PermissionFlagsBits
} = require('discord.js');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

// ------------------- نظام السجلات الدائمة وملف التخزين -------------------
const LOGS_FILE_PATH = path.join(__dirname, 'persistent_logs.json');
const TRANSCRIPTS_DIR = path.join(__dirname, 'transcripts_store');

if (!fs.existsSync(TRANSCRIPTS_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
}

let logsStore = {
  roles: [],
  messages: [],
  voice: [],
  tickets: [],
  channels: [],
  members: [],
  bans: []
};

try {
  if (fs.existsSync(LOGS_FILE_PATH)) {
    const rawData = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
    logsStore = JSON.parse(rawData);
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

// ------------------- 1. بيانات قواعد الألوان (17 قاعدة) -------------------
let basesData = {
  silver: { 
    name: 'Silver Base', emoji: '⚪', 
    tiers: [{ maxQty: 20, price: '20 ريال' }, { maxQty: 40, price: '40 ريال' }, { maxQty: 999, price: '60 ريال' }],
    itemTiers: [{ maxQty: 10, items: 'كروماندو كاندي وفوق باستثناء البارتي' }, { maxQty: 999, items: 'دب كاندي وفوق' }]
  },
  gold: { 
    name: 'Gold Base', emoji: '🟡', 
    tiers: [{ maxQty: 20, price: '20 ريال' }, { maxQty: 40, price: '40 ريال' }, { maxQty: 999, price: '60 ريال' }],
    itemTiers: [{ maxQty: 10, items: 'كروماندو كاندي وفوق باستثناء البارتي' }, { maxQty: 999, items: 'دب كاندي وفوق' }]
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

// ------------------- 2. إعدادات Express والداشبورد الأسطوري -------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'void_elite_dashboard_2026',
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

const client = new Client({
  intents: [
    I.Guilds,
    I.GuildMessages,
    I.MessageContent,
    I.GuildMembers,
    I.GuildVoiceStates
  ],
  partials: [P.Channel, P.Message, P.User, P.GuildMember]
});

// 💎 تصميم لوحة التحكم الأسطوري الفائق (أفخم وأرتب من ProBot بكثير)
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

  let totalLogsCount = Object.values(logsStore).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0);

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Void • Elite Command Center</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
      * { box-sizing: border-box; font-family: 'Cairo', sans-serif; transition: all 0.2s ease; }
      body { background: #040507; color: #f3f4f6; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; }
      
      body::before {
        content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.08), transparent 45%),
                    radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.07), transparent 45%);
        z-index: 1; pointer-events: none;
      }

      .sidebar {
        width: 280px; background: rgba(9, 11, 17, 0.9); backdrop-filter: blur(30px);
        border-left: 1px solid rgba(255, 255, 255, 0.07); padding: 26px 20px;
        display: flex; flex-direction: column; justify-content: space-between;
        position: fixed; right: 0; top: 0; bottom: 0; z-index: 100;
        box-shadow: -15px 0 40px rgba(0,0,0,0.6);
      }

      .brand-box { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
      .brand-avatar { width: 48px; height: 48px; border-radius: 14px; border: 2px solid rgba(139, 92, 246, 0.5); box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); }
      .brand-title { font-size: 18px; font-weight: 900; background: linear-gradient(135deg, #ffffff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .brand-sub { font-size: 11px; color: #6b7280; font-weight: 700; }

      .nav-group { margin-bottom: 24px; }
      .nav-label { font-size: 10.5px; color: #a78bfa; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; padding-right: 8px; letter-spacing: 1.2px; }
      .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 12px; color: #9ca3af; text-decoration: none; font-weight: 700; font-size: 13.5px; margin-bottom: 6px; }
      .nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #fff; transform: translateX(-3px); }
      .nav-item.active { background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15)); color: #fff; border: 1px solid rgba(139, 92, 246, 0.45); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2); }

      .badge-live { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 3px 10px; border-radius: 20px; font-size: 10px; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 800; }

      .main-content { margin-right: 280px; flex: 1; padding: 32px 42px; max-width: 1400px; position: relative; z-index: 10; }
      
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 26px; }
      .stat-card { background: rgba(14, 17, 26, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.07); padding: 20px 22px; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .stat-card:hover { transform: translateY(-3px); border-color: rgba(139, 92, 246, 0.3); }
      .stat-num { font-size: 24px; font-weight: 900; color: #fff; }
      .stat-title { font-size: 12px; color: #9ca3af; font-weight: 700; }

      .glass-card { background: rgba(14, 17, 26, 0.65); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
      
      h1, h2, h3 { color: #fff; margin-top: 0; font-weight: 800; }
      .purple-gradient { background: linear-gradient(135deg, #ffffff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      
      .tier-row { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; background: rgba(6, 8, 14, 0.65); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
      .tier-row input[type="number"] { width: 130px; text-align: center; }
      .tier-row input[type="text"] { flex: 1; }
      .tier-label { font-size: 12px; font-weight: 800; color: #c084fc; white-space: nowrap; }
      
      .btn-del { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 10px; padding: 8px 14px; cursor: pointer; font-weight: 700; }
      .btn-del:hover { background: rgba(239, 68, 68, 0.4); color: #fff; }
      
      .btn-add { background: rgba(99, 102, 241, 0.2); color: #c7d2fe; border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 10px; padding: 8px 16px; cursor: pointer; font-weight: 700; font-size: 12.5px; margin-top: 8px; display: inline-block; }
      .btn-add:hover { background: rgba(99, 102, 241, 0.4); color: #fff; }

      input, textarea, select { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(6, 8, 14, 0.9); color: #f3f4f6; outline: none; margin-top: 6px; font-size: 13.5px; }
      input:focus, textarea:focus, select:focus { border-color: #8b5cf6; box-shadow: 0 0 20px rgba(139, 92, 246, 0.25); }
      select option { background: #0f1118; color: #fff; }
      label { font-size: 12.5px; font-weight: 700; color: #e5e7eb; display: block; margin-top: 12px; }
      
      .btn { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; padding: 13px 26px; border-radius: 12px; font-weight: 800; cursor: pointer; width: 100%; box-shadow: 0 5px 20px rgba(124, 58, 237, 0.35); margin-top: 18px; font-size: 14px; text-align: center; text-decoration: none; display: inline-block; }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124, 58, 237, 0.55); }

      .logs-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      .logs-table th, .logs-table td { padding: 14px 18px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13.5px; }
      .logs-table th { color: #9ca3af; font-weight: 800; background: rgba(255, 255, 255, 0.02); }
      
      .log-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-block; }
      .badge-roles { background: rgba(168, 85, 247, 0.15); color: #e9d5ff; border: 1px solid rgba(168, 85, 247, 0.3); }
      .badge-tickets { background: rgba(16, 185, 129, 0.15); color: #a7f3d0; border: 1px solid rgba(16, 185, 129, 0.3); }
      
      .btn-view-ticket { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 700; text-decoration: none; display: inline-block; margin-right: 8px; }
      .btn-view-ticket:hover { background: rgba(16, 185, 129, 0.4); color: #fff; }
      
      .btn-clear-logs { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
      .btn-clear-logs:hover { background: rgba(239, 68, 68, 0.35); color: #fff; }
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
          <div>
            <div class="brand-title">VOID ELITE</div>
            <div class="brand-sub">Command Center</div>
          </div>
        </div>
        <div class="nav-group">
          <div class="nav-label">التهيئة والتحكم</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}"><span>🎨 ألوان القواعد (17)</span></a>
          <a href="/tickets" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}"><span>🎫 نظام التذاكر</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label">المراقبة المباشرة</div>
          <a href="/logs" class="nav-item ${activeTab === 'logs' ? 'active' : ''}"><span>📜 السجلات الدائمة</span><div class="badge-live">ONLINE</div></a>
        </div>
      </div>
      <a href="/logout" class="btn" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; font-size: 13px; padding: 10px;">🚪 تسجيل الخروج</a>
    </div>

    <div class="main-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div><div class="stat-title">الأعضاء</div><div class="stat-num">${memberCount}</div></div>
          <div style="font-size:22px;">👥</div>
        </div>
        <div class="stat-card">
          <div><div class="stat-title">القواعد النشطة</div><div class="stat-num">17</div></div>
          <div style="font-size:22px;">🎨</div>
        </div>
        <div class="stat-card">
          <div><div class="stat-title">تذاكر جارية</div><div class="stat-num">${ticketsDataMap.size}</div></div>
          <div style="font-size:22px;">🎫</div>
        </div>
        <div class="stat-card">
          <div><div class="stat-title">إجمالي السجلات</div><div class="stat-num">${totalLogsCount}</div></div>
          <div style="font-size:22px;">📜</div>
        </div>
      </div>
      ${content}
    </div>
  </body>
  </html>
  `;
};

// صفحة تسجيل الدخول الفخمة
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
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');
        body { background: #040507; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Cairo', sans-serif; }
        .login-card { background: rgba(14, 17, 26, 0.85); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 40px 35px; border-radius: 24px; text-align: center; width: 360px; box-shadow: 0 25px 60px rgba(0,0,0,0.8); }
        .brand-avatar { width: 80px; height: 80px; border-radius: 20px; margin-bottom: 14px; border: 2px solid rgba(139, 92, 246, 0.5); box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
        input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(6, 8, 14, 0.9); color: #fff; text-align: center; font-size: 14px; margin-bottom: 18px; outline: none; }
        button { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; padding: 12px; border-radius: 12px; width: 100%; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 5px 20px rgba(124, 58, 237, 0.35); }
      </style>
    </head>
    <body>
      <div class="login-card">
        <img src="${botIconUrl}" class="brand-avatar" alt="Server Logo">
        <h1 style="font-size: 22px; margin-bottom: 4px;" class="purple-gradient">VOID COMMUNITY</h1>
        <p style="color: #9ca3af; font-size: 12.5px; margin-bottom: 22px;">تسجيل الدخول إلى لوحة التحكم الفخمة</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول للوحة التحكم</button>
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

// الصفحة الرئيسية لإدارة القواعد ونشر لوحة التذاكر
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
        <h1 class="purple-gradient" style="margin: 0; font-size: 19px;">🎨 شرائح أسعار النواقص والمقابل بالأغراض (17 قاعدة)</h1>
        <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 12.5px;">مرحباً، ${req.session.user?.username || 'المسؤول'} 👋 | لوحة تحكم ذكية وفخمة لإدارة السيرفر.</p>
      </div>
      <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 11.5px;">🟢 متصل وجاهز</span>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 15.5px;" class="purple-gradient">📢 نشر لوحة التذاكر (بالصورة العريضة والقائمة النظيفة)</h2>
      <form action="/send-panel" method="POST">
        <label>اختر القناة المخصصة:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <button type="submit" class="btn">🚀 نشر لوحة التذاكر الفخمة</button>
      </form>
    </div>

    <form action="/save-colors" method="POST">
      <h2 style="font-size: 16px; margin-bottom: 14px;" class="purple-gradient">⚡ إعدادات شرائح السعر والأغراض لكل قاعدة</h2>
      ${Object.keys(basesData).map(key => `
        <div class="glass-card" style="padding: 20px;">
          <h3 style="margin: 0 0 12px 0; color: #c084fc; font-size: 15.5px;">${basesData[key].emoji} ${basesData[key].name}</h3>
          
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
          <button type="button" class="btn-add" style="background: rgba(168, 85, 247, 0.2); color: #e9d5ff; border-color: rgba(168, 85, 247, 0.35);" onclick="addItemTierRow('${key}')">➕ إضافة شريحة أغراض جديدة</button>
        </div>
      `).join('')}
      <button type="submit" class="btn" style="position: sticky; bottom: 20px; z-index: 10;">💾 حفظ كافة التعديلات والشرائح</button>
    </form>
  `;

  res.send(renderUltimateLayout('colors', content));
});

// نشر لوحة التذاكر الفخمة ذات الصورة العريضة
app.post('/send-panel', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const channelId = req.body.channel_id;
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      const guild = channel.guild;
      const bannerUrl = guild.bannerURL({ size: 1024, extension: 'png' }) || guild.iconURL({ size: 1024, extension: 'png' }) || 'https://i.imgur.com/8Q9Z4yX.png';

      const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle(`✨ مركز التذاكر والخدمات الرسمية | ${guild.name}`)
        .setDescription(`> قم باختيار القسم المناسب لطلبك من القائمة أدناه ليتم فتح تذكرة خاصة بك فوراً.`)
        .setImage(bannerUrl);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select_menu')
        .setPlaceholder('اختر خيار التذكرة...')
        .addOptions([
          { label: 'الدعم الفني | Technical Support', value: 'ticket_support', emoji: '🎫' },
          { label: 'التقديم على الإدارة | Management Application', value: 'ticket_apply', emoji: '📋' }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);
      await channel.send({ embeds: [embed], components: [row] });
    }
  } catch (e) {
    console.error('Error sending panel:', e);
  }
  res.redirect('/');
});

app.post('/save-colors', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  Object.keys(basesData).forEach(key => {
    const maxQtys = req.body[`${key}_maxQty[]`];
    const prices = req.body[`${key}_price[]`];
    let newTiers = [];
    if (Array.isArray(maxQtys)) {
      for (let i = 0; i < maxQtys.length; i++) {
        if (maxQtys[i] && prices[i]) newTiers.push({ maxQty: Number(maxQtys[i]), price: prices[i] });
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
        if (itemMaxQtys[i] && itemTexts[i]) newItemTiers.push({ maxQty: Number(itemMaxQtys[i]), items: itemTexts[i] });
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
      <h1 class="purple-gradient" style="margin: 0; font-size: 19px;">🎫 إعدادات نظام التذاكر والكاتيجوري</h1>
      <p style="color: #9ca3af; margin-top: 4px; font-size: 12.5px;">تحديد الفئات المخصصة للتذاكر ورتبة التحكم العلياء.</p>
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

// صفحة السجلات الدائمة المفصلة
app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const allLogsHtml = Object.keys(logsStore).map(cat => {
    const items = logsStore[cat] || [];
    return items.map(l => `
      <tr>
        <td><span class="log-badge badge-${cat}">${cat.toUpperCase()}</span></td>
        <td style="font-weight: 700; color: #fff;">${l.action}</td>
        <td>${l.details}${l.transcriptId ? `<a href="/view-transcript/${l.transcriptId}" class="btn-view-ticket">📄 عرض التذكرة</a>` : ''}</td>
        <td style="color: #6b7280; font-size: 12px;">${l.time}</td>
      </tr>
    `).join('');
  }).join('');

  const content = `
    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="purple-gradient" style="margin: 0; font-size: 19px;">📜 سجلات الأحداث الدائمة</h1>
        <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 12.5px;">متابعة دقيقة لكافة تفاعلات السيرفر والأعضاء والتذاكر.</p>
      </div>
      <form action="/clear-logs" method="POST" onsubmit="return confirm('هل أنت متأكد من مسح كافة السجلات؟');">
        <button type="submit" class="btn-clear-logs">🗑️ مسح السجلات</button>
      </form>
    </div>

    <div class="glass-card" style="padding: 10px 20px;">
      <table class="logs-table">
        <thead>
          <tr>
            <th>القسم</th>
            <th>الحدث</th>
            <th>التفاصيل</th>
            <th>الوقت</th>
          </tr>
        </thead>
        <tbody>
          ${allLogsHtml || '<tr><td colspan="4" style="text-align: center; color: #6b7280; padding: 35px;">لا توجد سجلات مسجلة حتى الآن.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  res.send(renderUltimateLayout('logs', content));
});

app.post('/clear-logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  logsStore = { roles: [], messages: [], voice: [], tickets: [], channels: [], members: [], bans: [] };
  saveLogsToFile();
  res.redirect('/logs');
});

// صفحة عرض تفاصيل محادثات التذكرة
app.get('/view-transcript/:id', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const fileId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(TRANSCRIPTS_DIR, `${fileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.send('<h2 style="color:red; text-align:center; margin-top:50px; font-family:sans-serif;">❌ عذراً، لم يتم العثور على سجل محادثات هذه التذكرة.<br><br><a href="/logs" style="color:#a78bfa;">العودة للسجلات</a></h2>');
  }

  let transcriptData = { ticketName: 'Unknown', closedBy: 'Unknown', date: 'Unknown', messages: [], openedBy: 'Unknown', baseName: 'الدعم الفني' };
  try {
    transcriptData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch(e){}

  const messagesHtml = transcriptData.messages.map(m => `
    <div style="background: rgba(6, 8, 14, 0.7); border: 1px solid rgba(255,255,255,0.06); padding: 14px 18px; border-radius: 14px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 800; color: #c084fc; font-size: 14.5px;">${m.author}</span>
        <span style="color: #6b7280; font-size: 11.5px;">${m.time}</span>
      </div>
      <div style="color: #e5e7eb; font-size: 13.5px; white-space: pre-wrap; line-height: 1.6;">${m.content}</div>
    </div>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void • عرض تفاصيل التذكرة</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        body { background: #040507; color: #f3f4f6; margin: 0; padding: 35px; font-family: 'Cairo', sans-serif; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 950px; }
        .glass-card { background: rgba(14, 17, 26, 0.75); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 20px; padding: 28px; margin-bottom: 22px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); }
        h1, h2 { color: #fff; margin-top: 0; font-weight: 800; }
        .purple-gradient { background: linear-gradient(135deg, #ffffff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .info-row { display: flex; justify-content: space-between; background: rgba(6, 8, 14, 0.6); padding: 12px 16px; border-radius: 12px; margin-bottom: 10px; font-size: 13.5px; }
        .btn { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="glass-card">
          <h1 class="purple-gradient" style="font-size: 21px;">📄 سجل محادثات التذكرة: ${transcriptData.ticketName}</h1>
          <div class="info-row"><span>صاحب التذكرة:</span> <strong>${transcriptData.openedBy}</strong></div>
          <div class="info-row"><span>أغلق بواسطة:</span> <strong>${transcriptData.closedBy}</strong></div>
          <div class="info-row"><span>تاريخ الإغلاق:</span> <strong>${transcriptData.date}</strong></div>
        </div>
        <div class="glass-card">
          <h2 style="font-size: 17px; margin-bottom: 18px;">💬 المحادثة الكاملة:</h2>
          ${messagesHtml || '<p style="color:#6b7280; text-align:center;">لا توجد رسائل مسجلة.</p>'}
          <a href="/logs" class="btn">⬅️ العودة إلى السجلات</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ------------------- 3. نظام تفاعلات التذاكر بالديسكورد مع استجابة فورية وآمنة -------------------
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith('ticket_') || interaction.customId === 'close_ticket') {
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.deferReply({ ephemeral: true });
        }
      } catch (e) {}
    }
  }

  // التعامل مع اختيار التذكرة من القائمة المنسدلة
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_menu') {
    const selectedValue = interaction.values[0];
    const isApply = selectedValue === 'ticket_apply';
    
    const ticketType = isApply ? 'تقديم-إدارة' : 'دعم-فني';
    const ticketTitle = isApply ? '📋 التقديم على الإدارة' : '🎫 الدعم الفني';

    try {
      const ch = await interaction.guild.channels.create({
        name: `${ticketType}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, ''),
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] }
        ]
      });

      const openTimestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;

      const ticketEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setDescription(
          `### ${ticketTitle}\n` +
          `> أهلاً بك <@${interaction.user.id}>، يرجى كتابة تفاصيل طلبك هنا وسيرد عليك الإداري المختص قريباً.\n\n` +
          `• **الوقت:** ${openTimestamp}\n` +
          `• **المسؤول:** \`طاقم الإدارة\``
        )
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() || undefined });

      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('إغلاق التذكرة')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)
      );

      await ch.send({
        content: `|| <@${interaction.user.id}> ||`,
        embeds: [ticketEmbed],
        components: [closeBtn]
      });

      addLog('tickets', 'فتح تذكرة', `تم فتح تذكرة ${ticketTitle} بواسطة @${interaction.user.tag}`);

      return await interaction.editReply({ 
        content: `✨ **تم فتح تذكرتك بنجاح:** ${ch}` 
      });

    } catch (err) {
      console.error('Ticket Error:', err);
      return await interaction.editReply({ 
        content: '❌ حدث خطأ أثناء إنشاء التذكرة، يرجى التأكد من صلاحيات البوت.' 
      }).catch(() => {});
    }
  }

  // زر إغلاق التذكرة
  if (interaction.isButton() && interaction.customId === 'close_ticket') {
    try {
      await interaction.editReply({ 
        embeds: [new EmbedBuilder().setDescription('🔒 **سيتم حذف التذكرة خلال 5 ثوانٍ وحفظ السجل...**').setColor('#ed4245')]
      });

      const channel = interaction.channel;
      let fetchedMessages = [];
      try {
        const messages = await channel.messages.fetch({ limit: 100 });
        fetchedMessages = messages.map(m => ({
          author: m.author.tag,
          content: m.content || '[محتوى مدمج أو صورة]',
          time: new Date(m.createdTimestamp).toLocaleString('ar-SA')
        })).reverse();
      } catch(e){}

      const transcriptId = 'transcript_' + Date.now();
      const transcriptData = {
        ticketName: channel.name,
        openedBy: interaction.user.tag,
        closedBy: interaction.user.tag,
        date: new Date().toLocaleString('ar-SA'),
        messages: fetchedMessages
      };

      fs.writeFileSync(path.join(TRANSCRIPTS_DIR, `${transcriptId}.json`), JSON.stringify(transcriptData, null, 2), 'utf-8');
      addLog('tickets', 'إغلاق تذكرة', `تم إغلاق التذكرة ${channel.name} بواسطة @${interaction.user.tag}`, transcriptId);

      setTimeout(() => {
        channel.delete().catch(() => {});
      }, 5000);
    } catch (e) {}
  }
});

// أمر نشر لوحة التذاكر السريع
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!setup-tickets') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ هذا الأمر للمشرفين فقط.');
    }

    try {
      const bannerUrl = message.guild.bannerURL({ size: 1024, extension: 'png' }) || message.guild.iconURL({ size: 1024, extension: 'png' }) || 'https://i.imgur.com/8Q9Z4yX.png';
      const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle(`✨ مركز التذاكر والخدمات الرسمية | ${message.guild.name}`)
        .setDescription(`> قم باختيار القسم المناسب لطلبك من القائمة أدناه ليتم فتح تذكرة خاصة بك فوراً.`)
        .setImage(bannerUrl);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select_menu')
        .setPlaceholder('اختر خيار التذكرة...')
        .addOptions([
          { label: 'الدعم الفني | Technical Support', value: 'ticket_support', emoji: '🎫' },
          { label: 'التقديم على الإدارة | Management Application', value: 'ticket_apply', emoji: '📋' }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);
      await message.channel.send({ embeds: [embed], components: [row] });
      await message.delete().catch(() => {});
    } catch (err) {
      console.error(err);
      message.reply('❌ حدث خطأ أثناء نشر لوحة التذاكر.');
    }
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}! Void Elite System is fully operational.`);
});

app.listen(PORT, () => {
  console.log(`🚀 Elite Dashboard Server running on port ${PORT}`);
});

client.login(TOKEN);
