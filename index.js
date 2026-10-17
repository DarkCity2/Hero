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
  UserSelectMenuBuilder,
  AuditLogEvent
} = require('discord.js');
const express = require('express');
const session = require('express-session');

// ------------------- 1. بيانات قواعد الألوان الـ 17 -------------------
let basesData = {
  silver: { name: 'Silver Base', emoji: '⚪', money: 'اذا ناقصك 15 وتحت المبلغ ( 20 ريال ) اذا فوق 15 ( 40 ريال )', items: '(١٠ وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق)' },
  gold: { name: 'Gold Base', emoji: '🟡', money: 'اذا ناقصك 15 وتحت المبلغ ( 20 ريال ) اذا فوق 15 ( 40 ريال )', items: '(١٠ وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق)' },
  crystal: { name: 'Crystal Base', emoji: '💎', money: 'اذا ناقصك 15 وتحت المبلغ ( 25 ريال ) اذا فوق 15 ( 50 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  bloodmoon: { name: 'BloodMoon Base', emoji: '🌑', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  rainbow: { name: 'Rainbow Base GoUp', emoji: '🌈', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  candy: { name: 'Candy Base GoUp', emoji: '🍬', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  cyber: { name: 'Cyber Base GoUp', emoji: '🤖', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  party: { name: 'Party Base GoUp', emoji: '🎉', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  bw: { name: 'Black & White Base GoUp', emoji: '⬛', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  aqua: { name: 'Aqua Base GoUp', emoji: '💧', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  lava: { name: 'Lava Base GoUp', emoji: '🌋', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  football: { name: 'Football Base GoUp', emoji: '⚽', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  summer: { name: 'Summer Base GoUp', emoji: '☀️', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  dreamy: { name: 'Dreamy Base GoUp', emoji: '☁️', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  galaxy: { name: 'Galaxy Base', emoji: '🌌', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  radioactive: { name: 'Radioactive Base', emoji: '☢️', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' },
  halloween: { name: 'Halloween Base', emoji: '🎃', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: 'شروط الأغراض المحددة مسبقاً' }
};

let serverSettings = {
  ticketCategories: '',
  ownerRoleName: 'Owner',
  antiSpam: true,
  blockLinks: false,
  antiRaid: true
};

const ticketsDataMap = new Map();
const dashboardLogs = []; // قائمة السجلات الشاملة

function addDashboardLog(category, action, details) {
  const time = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
  dashboardLogs.unshift({ category, action, details, time });
  if (dashboardLogs.length > 250) dashboardLogs.pop(); // الاحتفاظ بآخر 250 سجل
}

// ------------------- 2. إعدادات Express -------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'void_community_ultra_epic_2026',
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

// تصميم اللوحة الأسطوري المتطور الفاخر
const renderUltimateLayout = (activeTab, content) => {
  let memberCount = 0;
  let guildName = 'Void Community';
  try {
    const firstGuild = client.guilds.cache.first();
    if (firstGuild) {
      memberCount = firstGuild.memberCount;
      guildName = firstGuild.name;
    }
  } catch(e){}

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Void Community • Ultimate Master Dashboard</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
      * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
      body { background: #020106; color: #f1f5f9; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; }
      
      body::before {
        content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at 75% 15%, rgba(139, 92, 246, 0.12), transparent 45%),
                    radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.10), transparent 45%);
        z-index: 1; pointer-events: none;
      }

      .sidebar { width: 310px; background: rgba(7, 4, 16, 0.96); backdrop-filter: blur(40px); border-left: 1px solid rgba(139, 92, 246, 0.3); padding: 25px 20px; display: flex; flex-direction: column; justify-content: space-between; position: fixed; right: 0; top: 0; bottom: 0; z-index: 100; box-shadow: -15px 0 60px rgba(0,0,0,0.95); }
      .brand-box { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(139, 92, 246, 0.2); }
      .brand-logo-icon { font-size: 45px; margin-bottom: 6px; filter: drop-shadow(0 0 25px rgba(168,85,247,0.9)); }
      .brand-title { font-size: 22px; font-weight: 900; background: linear-gradient(135deg, #f3e8ff, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 2px; }
      
      .nav-group { margin-bottom: 22px; }
      .nav-label { font-size: 11px; color: #a855f7; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; padding-right: 12px; letter-spacing: 1.2px; }
      .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 16px; color: #94a3b8; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 8px; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid transparent; }
      .nav-item:hover { background: rgba(124, 58, 237, 0.18); color: #fff; border-color: rgba(139, 92, 246, 0.35); transform: translateX(-4px); }
      .nav-item.active { background: linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(99, 102, 241, 0.3)); color: #fff; border: 1px solid rgba(139, 92, 246, 0.7); box-shadow: 0 0 30px rgba(124, 58, 237, 0.4); }
      
      .badge-live { background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 11px; border: 1px solid rgba(34, 197, 94, 0.4); font-weight: 800; animation: pulse 2s infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

      .main-content { margin-right: 310px; flex: 1; padding: 40px; max-width: 1320px; position: relative; z-index: 10; }
      
      /* إحصائيات علوية حية */
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
      .stat-card { background: rgba(13, 9, 24, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(139, 92, 246, 0.25); padding: 22px; border-radius: 20px; text-align: center; transition: 0.3s; }
      .stat-card:hover { border-color: #a855f7; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(124, 58, 237, 0.2); }
      .stat-num { font-size: 28px; font-weight: 900; color: #a855f7; margin-top: 5px; }
      .stat-title { font-size: 13px; color: #94a3b8; font-weight: 700; }

      .glass-card { background: rgba(13, 9, 24, 0.88); backdrop-filter: blur(35px); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 26px; padding: 35px; margin-bottom: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.85); transition: 0.3s; }
      .glass-card:hover { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 25px 70px rgba(124, 58, 237, 0.2); }
      
      h1, h2, h3 { color: #fff; margin-top: 0; }
      .purple-gradient { background: linear-gradient(135deg, #f3e8ff, #c084fc, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      
      input, textarea, select { width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); background: rgba(5, 3, 12, 0.95); color: #fff; outline: none; margin-top: 10px; font-size: 15px; transition: all 0.3s ease; }
      input:focus, textarea:focus, select:focus { border-color: #a855f7; box-shadow: 0 0 25px rgba(168, 85, 247, 0.35); background: rgba(9, 6, 20, 0.95); }
      select option { background: #0c0a14; color: #fff; }
      label { font-size: 14px; font-weight: 700; color: #cbd5e1; display: block; margin-top: 18px; letter-spacing: 0.5px; }
      
      .btn { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 16px 32px; border-radius: 16px; font-weight: 800; cursor: pointer; width: 100%; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 6px 30px rgba(124, 58, 237, 0.45); margin-top: 25px; font-size: 16px; text-align: center; text-decoration: none; display: inline-block; }
      .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(124, 58, 237, 0.7); filter: brightness(1.1); }
      
      /* جدول اللوقات الشامل والفاخر */
      .logs-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .logs-table th, .logs-table td { padding: 16px 20px; text-align: right; border-bottom: 1px solid rgba(139, 92, 246, 0.15); font-size: 14px; }
      .logs-table th { color: #c084fc; font-weight: 800; background: rgba(124, 58, 237, 0.12); }
      .logs-table tr:hover { background: rgba(124, 58, 237, 0.08); }
      .log-badge { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-block; }
      
      /* ألوان شارات اللوقات حسب الفئة */
      .badge-role { background: rgba(168, 85, 247, 0.2); color: #e9d5ff; border: 1px solid rgba(168, 85, 247, 0.4); }
      .badge-msg { background: rgba(234, 179, 8, 0.2); color: #fef08a; border: 1px solid rgba(234, 179, 8, 0.4); }
      .badge-voice { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
      .badge-ticket { background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.4); }
      .badge-ban { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
      .badge-member { background: rgba(14, 165, 233, 0.2); color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.4); }
    </style>
  </head>
  <body>
    <div class="sidebar">
      <div>
        <div class="brand-box">
          <div class="brand-logo-icon">🌌</div>
          <div class="brand-title">VOID COMMUNITY</div>
        </div>
        <div class="nav-group">
          <div class="nav-label">التحكم والتهيئة</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}"><span>🎨 ألوان القواعد (17)</span></a>
          <a href="/tickets" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}"><span>🎫 التذاكر والكاتيجوري</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label">المركز الرئيسي والمراقبة</div>
          <a href="/logs" class="nav-item ${activeTab === 'logs' ? 'active' : ''}"><span>📜 سجلات ديسكورد الشاملة</span><div class="badge-live">LIVE</div></a>
          <a href="/moderation" class="nav-item ${activeTab === 'moderation' ? 'active' : ''}"><span>🔨 أدوات الإدارة السريعة</span></a>
          <a href="/security" class="nav-item ${activeTab === 'security' ? 'active' : ''}"><span>🛡️ مركز الحماية والأمان</span></a>
        </div>
      </div>
      <a href="/logout" class="btn" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; margin-top: 0; box-shadow: none;">🚪 تسجيل الخروج</a>
    </div>

    <div class="main-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">👥 أعضاء السيرفر</div>
          <div class="stat-num">${memberCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">🎨 قواعد الألوان المتاحة</div>
          <div class="stat-num">17</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">🎫 التذاكر المفتوحة حالياً</div>
          <div class="stat-num">${ticketsDataMap.size}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">📜 السجلات المحفوظة</div>
          <div class="stat-num">${dashboardLogs.length}</div>
        </div>
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
    <head>
      <meta charset="UTF-8">
      <title>Void • Admin Center Login</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        body { background: #020106; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Cairo', sans-serif; }
        .login-card { background: rgba(13, 9, 24, 0.92); backdrop-filter: blur(40px); border: 1px solid rgba(139, 92, 246, 0.35); padding: 50px; border-radius: 30px; text-align: center; width: 450px; box-shadow: 0 25px 75px rgba(0,0,0,0.95); }
        .logo-icon { font-size: 60px; margin-bottom: 12px; filter: drop-shadow(0 0 30px rgba(168,85,247,0.9)); }
        input { width: 100%; padding: 16px; border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(5, 3, 12, 0.95); color: #fff; text-align: center; font-size: 16px; margin-bottom: 25px; outline: none; }
        input:focus { border-color: #a855f7; box-shadow: 0 0 25px rgba(168,85,247,0.4); }
        button { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 16px; border-radius: 16px; width: 100%; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 6px 30px rgba(124,58,237,0.55); transition: 0.3s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(124,58,237,0.75); }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div class="logo-icon">🌌</div>
        <h1 style="font-size: 28px; margin-bottom: 8px;" class="purple-gradient">VOID COMMUNITY</h1>
        <p style="color: #a78bfa; font-size: 13px; margin-bottom: 30px;">أدخل كلمة المرور السرية للمصادقة وتفعيل اللوحة</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول وتوثيق التوقيع الرقمي</button>
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
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ فشل الربط والمصادقة.<br><a href="/login" style="color:#a78bfa;">إعادة المحاولة</a></h2>');
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
    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(13,9,24,0.95), rgba(124,58,237,0.2));">
      <div>
        <h1 class="purple-gradient" style="margin: 0; font-size: 26px; font-weight: 900;">🎨 إدارة ألوان القواعد (17 قاعدة)</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 15px;">أهلاً بك، ${req.session.user?.username || 'المسؤول'} 👋 | تحديث الأسعار والمقابل فوراً لنظام التذاكر.</p>
      </div>
      <span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); padding: 10px 20px; border-radius: 30px; font-weight: 800; font-size: 14px;">🟢 النظام نشط ومزامن</span>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 19px;" class="purple-gradient">📢 إرسال لوحة الألوان الفخمة إلى ديسكورد</h2>
      <form action="/send-panel" method="POST">
        <label>اختر الروم المخصص لنشر اللوحة:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <button type="submit" class="btn">🚀 نشر لوحة الألوان الآن</button>
      </form>
    </div>

    <form action="/save-colors" method="POST">
      <h2 style="font-size: 19px; margin-bottom: 20px;" class="purple-gradient">⚡ تعديل أسعار وشروط الـ 17 قاعدة</h2>
      ${Object.keys(basesData).map(key => `
        <div class="glass-card" style="padding: 25px;">
          <h3 style="margin: 0 0 14px 0; color: #c084fc; font-size: 18px; font-weight: 800;">${basesData[key].emoji}${basesData[key].name}</h3>
          <label>💰 المقابل المادي:</label>
          <textarea name="${key}_money" rows="2">${basesData[key].money}</textarea>
          <label>🎁 المقابل بالأغراض:</label>
          <textarea name="${key}_items" rows="2">${basesData[key].items}</textarea>
        </div>
      `).join('')}
      <button type="submit" class="btn" style="position: sticky; bottom: 30px; z-index: 10; font-size: 18px;">💾 حفظ كافة التعديلات والتحديث الفوري</button>
    </form>
  `;

  res.send(renderUltimateLayout('colors', content));
});

app.post('/save-colors', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  Object.keys(basesData).forEach(key => {
    if (req.body[`${key}_money`]) basesData[key].money = req.body[`${key}_money`];
    if (req.body[`${key}_items`]) basesData[key].items = req.body[`${key}_items`];
  });
  addDashboardLog('badge-role', 'تحديث القواعد', `تم تحديث أسعار وشروط القواعد بواسطة @${req.session.user?.username}`);
  res.redirect('/');
});

app.get('/tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card" style="background: linear-gradient(135deg, rgba(13,9,24,0.95), rgba(124,58,237,0.2));">
      <h1 class="purple-gradient" style="margin: 0; font-size: 26px; font-weight: 900;">🎫 إعدادات الكاتيجوري ورتب التحكم</h1>
      <p style="color: #94a3b8; margin-top: 8px; font-size: 15px;">ربط التذاكر بالكاتيجوري ورتبة الـ Owner لإدارة الخيارات.</p>
    </div>
    
    <form action="/save-tickets" method="POST">
      <div class="glass-card">
        <label>معرفات كاتيجوري التذاكر (Category IDs - يدعم أكثر من آيدي مفصول بفاصلة):</label>
        <input type="text" name="ticketCategories" value="${serverSettings.ticketCategories}" placeholder="مثال: 123456789012345678, 987654321098765432">

        <label>اسم رتبة الـ Owner المسؤول عن التحكم:</label>
        <input type="text" name="ownerRoleName" value="${serverSettings.ownerRoleName}" placeholder="Owner">

        <button type="submit" class="btn" style="font-size: 18px;">💾 حفظ الإعدادات</button>
      </div>
    </form>
  `;
  res.send(renderUltimateLayout('tickets', content));
});

app.post('/save-tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  if (req.body.ticketCategories !== undefined) serverSettings.ticketCategories = req.body.ticketCategories;
  if (req.body.ownerRoleName) serverSettings.ownerRoleName = req.body.ownerRoleName;
  addDashboardLog('badge-ticket', 'إعدادات التذاكر', `تم تحديث الكاتيجوري ورتب التحكم بواسطة @${req.session.user?.username}`);
  res.redirect('/tickets');
});

// صفحة اللوقات الأسطورية الشاملة بالداشبورد
app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  const logsRows = dashboardLogs.length === 0 
    ? `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 35px; font-size: 16px;">لا توجد سجلات مسجلة حتى الآن. ستظهر جميع أحداث الديسكورد والتذاكر هنا تلقائياً مباشرة!</td></tr>`
    : dashboardLogs.map(log => `
      <tr>
        <td style="font-weight: 800; color: #c084fc;">${log.action}</td>
        <td style="line-height: 1.6;">${log.details}</td>
        <td><span class="log-badge ${log.category}">${log.category.replace('badge-', '').toUpperCase()}</span></td>
        <td style="color: #94a3b8; font-size: 13px; white-space: nowrap;">${log.time}</td>
      </tr>
    `).join('');

  const content = `
    <div class="glass-card" style="background: linear-gradient(135deg, rgba(13,9,24,0.95), rgba(124,58,237,0.25));">
      <h1 class="purple-gradient" style="margin: 0; font-size: 26px; font-weight: 900;">📜 سجلات ديسكورد الشاملة (Universal Live Logs)</h1>
      <p style="color: #94a3b8; margin-top: 8px; font-size: 15px;">مركز مراقبة حقيقي يسجل: إزالة/إضافة الرتب، التذاكر، إغلاق القنوات، الحذف، التعديل، والمكالمات الصوتية مباشرة هنا حصرياً!</p>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 20px;" class="purple-gradient">🔍 الأحداث المباشرة المسجلة (${dashboardLogs.length})</h2>
      <div style="overflow-x: auto; margin-top: 20px;">
        <table class="logs-table">
          <thead>
            <tr>
              <th>حدث السجل</th>
              <th>التفاصيل الكاملة</th>
              <th>التصنيف</th>
              <th>التوقيت</th>
            </tr>
          </thead>
          <tbody>
            ${logsRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
  res.send(renderUltimateLayout('logs', content));
});

// أدوات الإدارة السريعة
app.get('/moderation', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  
  let channelOptionsHTML = '<option value="" disabled selected>اختر الروم لنشر الإعلان...</option>';
  try {
    client.guilds.cache.forEach(guild => {
      guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach(channel => {
        channelOptionsHTML += `<option value="${channel.id}"># ${channel.name} — (${guild.name})</option>`;
      });
    });
  } catch (e) {}

  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:26px;">🔨 أدوات الإدارة السريعة والإعلانات</h1>
      <p style="color:#94a3b8; margin-top:8px;">إرسال إعلانات رسمية أو التحكم بالأعضاء بآيدي العضو.</p>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 19px;" class="purple-gradient">📣 إرسال إعلان رسمي للسيرفر</h2>
      <form action="/send-announcement" method="POST">
        <label>اختر الروم:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <label>عنوان الإعلان:</label>
        <input type="text" name="title" placeholder="مثال: إعلان هويتي الجديد" required>
        <label>محتوى الإعلان:</label>
        <textarea name="message" rows="4" placeholder="اكتب نص الإعلان هنا..." required></textarea>
        <button type="submit" class="btn">🚀 إرسال الإعلان الآن</button>
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
      .setColor('#7c3aed')
      .setFooter({ text: 'Void Community Official Announcement' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    addDashboardLog('badge-msg', 'إعلان رسمي', `تم إرسال إعلان بعنوان "${req.body.title}" في الروم #${channel.name}`);
    res.redirect('/moderation');
  } catch(e) {
    res.send(`<h2 style="color:red; text-align:center; margin-top:50px;">❌ خطأ: ${e.message}<br><br><a href="/moderation">العودة</a></h2>`);
  }
});

// مركز الحماية
app.get('/security', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:26px;">🛡️ مركز الحماية والأمان المتقدم</h1>
      <p style="color:#94a3b8; margin-top:8px;">تفعيل وتعطيل أنظمة الحماية التلقائية للسيرفر.</p>
    </div>

    <div class="glass-card">
      <h2 style="font-size:19px;" class="purple-gradient">⚡ خيارات الحماية الحالية</h2>
      <div style="margin-top: 20px;">
        <p style="font-size: 16px; font-weight:700;">• الحماية من التكرار والسبام (Anti-Spam): <span style="color:#4ade80;">مفعلة تلقائياً</span></p>
        <p style="font-size: 16px; font-weight:700;">• الحماية من الهجمات (Anti-Raid): <span style="color:#4ade80;">مفعلة تلقائياً</span></p>
        <p style="font-size: 16px; font-weight:700;">• منع روابط الديسكورد والخارجية: <span style="color:#a855f7;">نشطة</span></p>
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
      .setColor('#7c3aed')
      .setFooter({ text: 'Void Community • Advanced Ticket System' });

    await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
    addDashboardLog('badge-ticket', 'نشر لوحة الألوان', `تم نشر لوحة الألوان بنجاح في القناة: #${channel.name}`);
    res.redirect('/');
  } catch (err) {
    res.send(`<h2 style="color:red; text-align:center; margin-top:50px;">❌ خطأ أثناء النشر: ${err.message}<br><br><a href="/">العودة للوحة</a></h2>`);
  }
});

app.listen(PORT, () => console.log(`🌐 Ultimate Dashboard Active on port ${PORT}`));

// ------------------- 7. بوت ديسكورد والمراقبة الشاملة -------------------
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
  addDashboardLog('badge-role', 'تشغيل البوت', `تم تشغيل بوت ديسكورد بنجاح باسم ${client.user.tag}`);
});

// ------------------- سجلات الديسكورد الشاملة حظياً -------------------

// 1. لوقات تعديل إزالة/إضافة الرتب
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

  addedRoles.forEach(role => {
    addDashboardLog('badge-role', 'إضافة رتبة', `تم إعطاء الرتبة [${role.name}] للعضو @${newMember.user.username}`);
  });

  removedRoles.forEach(role => {
    addDashboardLog('badge-role', 'إزالة رتبة', `تم إزالة الرتبة [${role.name}] من العضو @${newMember.user.username}`);
  });
});

// 2. لوقات حذف الرسائل
client.on('messageDelete', message => {
  if (message.author?.bot) return;
  const authorName = message.author ? `@${message.author.username}` : 'عضو غير معروف';
  const contentStr = message.content ? `"${message.content}"` : 'وسائط / إمبد';
  const channelName = message.channel ? `#${message.channel.name}` : 'روم غير معروف';
  addDashboardLog('badge-msg', 'حذف رسالة', `تم حذف رسالة للعضو ${authorName} في القناة ${channelName}: ${contentStr}`);
});

// 3. لوقات تعديل الرسائل
client.on('messageUpdate', (oldMessage, newMessage) => {
  if (oldMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  const authorName = oldMessage.author ? `@${oldMessage.author.username}` : 'عضو';
  addDashboardLog('badge-msg', 'تعديل رسالة', `العضو ${authorName} عدّل رسالته من: "${oldMessage.content}" إلى: "${newMessage.content}"`);
});

// 4. لوقات المكالمات الصوتية
client.on('voiceStateUpdate', (oldState, newState) => {
  const memberName = `@${newState.member.user.username}`;
  if (!oldState.channelId && newState.channelId) {
    addDashboardLog('badge-voice', 'دخول صوتي', `انضم العضو ${memberName} إلى الروم الصوتي #${newState.channel.name}`);
  } else if (oldState.channelId && !newState.channelId) {
    addDashboardLog('badge-voice', 'خروج صوتي', `غادر العضو ${memberName} الروم الصوتي #${oldState.channel.name}`);
  } else if (oldState.channelId !== newState.channelId) {
    addDashboardLog('badge-voice', 'تنقل صوتي', `انتقل العضو ${memberName} من #${oldState.channel.name} إلى #${newState.channel.name}`);
  }
});

// 5. لوقات الحظر وفك الحظر
client.on('guildBanAdd', ban => {
  addDashboardLog('badge-ban', 'حظر عضو (Ban)', `تم حظر العضو @${ban.user.username} من السيرفر.`);
});

client.on('guildBanRemove', ban => {
  addDashboardLog('badge-ban', 'فك حظر (Unban)', `تم فك الحظر عن العضو @${ban.user.username}`);
});

// 6. لوقات الانضمام والمغادرة
client.on('guildMemberAdd', member => {
  addDashboardLog('badge-member', 'انضمام عضو', `العضو @${member.user.username} انضم إلى السيرفر.`);
});

client.on('guildMemberRemove', member => {
  addDashboardLog('badge-member', 'مغادرة عضو', `العضو @${member.user.username} غادر السيرفر.`);
});

// ------------------- التفاعلات والتذاكر -------------------
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
      .setCustomId('missing_val').setLabel('اكتب عدد نواقصك').setPlaceholder('مثال: 5').setStyle(TextInputStyle.Short).setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(guaranteeInput), new ActionRowBuilder().addComponents(missingInput));
    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_info_')) {
    const baseKey = interaction.customId.replace('modal_info_', '');
    userSessions.set(interaction.user.id, {
      baseKey: baseKey,
      guarantee: interaction.fields.getTextInputValue('guarantee_val'),
      missing: interaction.fields.getTextInputValue('missing_val')
    });

    const paymentMenu = new StringSelectMenuBuilder()
      .setCustomId('select_payment')
      .setPlaceholder('اختر نوع المقابل')
      .addOptions([
        { label: 'مقابل مادي', value: 'money', description: 'عرض المقابل المادي المحدد لهذا اللون', emoji: '💰' },
        { label: 'أغراض داخل اللعبة', value: 'items', description: 'عرض الأغراض المحددة مسبقاً لهذا اللون', emoji: '🎁' }
      ]);

    await interaction.reply({
      content: `✅ **تم حفظ الضمان وعدد النواقص.**\n\n🎨 **الآن اختر نوع المقابل للحصول على ${basesData[baseKey]?.name || baseKey}:**`,
      components: [new ActionRowBuilder().addComponents(paymentMenu)],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_payment') {
    const payType = interaction.values[0];
    const session = userSessions.get(interaction.user.id);
    if (!session) return interaction.reply({ content: '❌ انتهت الجلسة، يرجى البدء من جديد.', ephemeral: true });

    const baseConfig = basesData[session.baseKey] || { name: session.baseKey, money: 'غير محدد', items: 'غير محدد' };
    let textDetails = payType === 'money' ? `💰 **المقابل المادي للون ${baseConfig.name}:**\n${baseConfig.money}` : `🎁 **مقابل الأغراض للون ${baseConfig.name}:**\n${baseConfig.items}`;

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
          { name: '🔢 عدد النواقص', value: session ? session.missing : 'غير محدد', inline: true },
          { name: '👑 الرتبة المخولة', value: specificRole ? `<@&${specificRole.id}>` : 'الإدارة العامة', inline: false }
        )
        .setColor('#7c3aed')
        .setFooter({ text: 'Void Community • Advanced Ticket System' })
        .setTimestamp();

      await ch.send({ 
        content: `<@${interaction.user.id}> ${specificRole ? `<@&${specificRole.id}>` : ''}`, 
        embeds: [embed], 
        components: [new ActionRowBuilder().addComponents(actionMenu)] 
      });

      addDashboardLog('badge-ticket', 'فتح تذكرة', `تم فتح تذكرة لون ${baseName} بواسطة @${interaction.user.username}`);
      await interaction.update({ content: `🎉 **تم قبول الطلب بنجاح!**\nتم فتح القناة الخاصة بك: ${ch}`, components: [] });
    }

    if (interaction.customId === 'btn_reject') {
      await interaction.update({ content: '❌ **تم إلغاء الطلب.**', components: [] });
    }
  }

  // ------------------- فحص الصلاحيات الصارم -------------------
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
    addDashboardLog('badge-ticket', 'إضافة عضو لتذكرة', `تم إضافة العضو <@${targetUserId}> إلى التذكرة #${interaction.channel.name}`);
    await interaction.reply({ content: `✅ **تمت إضافة العضو <@${targetUserId}> للتذكرة بنجاح!**` });
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_close_reason')) {
    const reason = interaction.fields.getTextInputValue('close_reason_input');
    await interaction.reply('⏳ **جاري حفظ محادثات التذكرة وتسجيلها في لوحة التحكم وإغلاق القناة...**');

    const { count } = await createTranscriptBuffer(interaction.channel, interaction.user);

    // تسجيل إغلاق التذكرة باللوحة حصرياً
    addDashboardLog('badge-ticket', 'إغلاق تذكرة', `التذكرة #${interaction.channel.name} أُغلقت بواسطة @${interaction.user.username} | السبب: ${reason} | عدد الرسائل: ${count}`);

    setTimeout(() => {
      ticketsDataMap.delete(interaction.channel.id);
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

client.login(TOKEN);
module.exports = client;
