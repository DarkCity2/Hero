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
  ownerRoleName: 'Owner'
};

const ticketsDataMap = new Map();
const dashboardLogs = []; // تخزين السجلات لعرضها في الداشبورد

function addDashboardLog(type, title, description) {
  const time = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
  dashboardLogs.unshift({ type, title, description, time });
  if (dashboardLogs.length > 150) dashboardLogs.pop(); // الاحتفاظ بآخر 150 سجل
}

// ------------------- 2. إعدادات Express -------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'void_community_epic_2026',
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

// تصميم اللوحة الأسطوري الفاخر (Ultimate Futuristic Dashboard UI)
const renderUltimateLayout = (activeTab, content) => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>Void Community • Ultimate Command Center</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
      * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
      body { background: #030108; color: #f1f5f9; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; }
      
      /* خلفية جمالية بتأثيرات النيون */
      body::before {
        content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at 70% 20%, rgba(124, 58, 237, 0.08), transparent 40%),
                    radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.06), transparent 40%);
        z-index: 1; pointer-events: none;
      }

      .sidebar { width: 300px; background: rgba(8, 5, 18, 0.95); backdrop-filter: blur(40px); border-left: 1px solid rgba(139, 92, 246, 0.25); padding: 25px 18px; display: flex; flex-direction: column; justify-content: space-between; position: fixed; right: 0; top: 0; bottom: 0; z-index: 100; box-shadow: -15px 0 50px rgba(0,0,0,0.9); }
      .brand-box { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(139, 92, 246, 0.2); }
      .brand-logo-icon { font-size: 42px; margin-bottom: 8px; filter: drop-shadow(0 0 20px rgba(168,85,247,0.8)); }
      .brand-title { font-size: 21px; font-weight: 900; background: linear-gradient(135deg, #f3e8ff, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1.5px; }
      
      .nav-group { margin-bottom: 22px; }
      .nav-label { font-size: 11px; color: #a855f7; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; padding-right: 12px; letter-spacing: 1px; }
      .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 16px; color: #94a3b8; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 8px; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid transparent; }
      .nav-item:hover { background: rgba(124, 58, 237, 0.15); color: #fff; border-color: rgba(139, 92, 246, 0.3); transform: translateX(-3px); }
      .nav-item.active { background: linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(99, 102, 241, 0.25)); color: #fff; border: 1px solid rgba(139, 92, 246, 0.6); box-shadow: 0 0 25px rgba(124, 58, 237, 0.35); }
      
      .badge-live { background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 4px 10px; border-radius: 20px; font-size: 11px; border: 1px solid rgba(34, 197, 94, 0.3); font-weight: 800; }
      
      .main-content { margin-right: 300px; flex: 1; padding: 40px; max-width: 1280px; position: relative; z-index: 10; }
      .glass-card { background: rgba(14, 10, 26, 0.85); backdrop-filter: blur(30px); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 24px; padding: 35px; margin-bottom: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); transition: 0.3s; }
      .glass-card:hover { border-color: rgba(139, 92, 246, 0.45); box-shadow: 0 25px 70px rgba(124, 58, 237, 0.15); }
      
      h1, h2, h3 { color: #fff; margin-top: 0; }
      .purple-gradient { background: linear-gradient(135deg, #e9d5ff, #c084fc, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      
      input, textarea, select { width: 100%; padding: 15px 20px; border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); background: rgba(6, 4, 14, 0.9); color: #fff; outline: none; margin-top: 10px; font-size: 15px; transition: all 0.3s ease; }
      input:focus, textarea:focus, select:focus { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); background: rgba(10, 7, 22, 0.95); }
      select option { background: #0c0a14; color: #fff; }
      label { font-size: 14px; font-weight: 700; color: #cbd5e1; display: block; margin-top: 18px; letter-spacing: 0.5px; }
      
      .btn { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 16px 32px; border-radius: 16px; font-weight: 800; cursor: pointer; width: 100%; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 6px 30px rgba(124, 58, 237, 0.45); margin-top: 25px; font-size: 16px; text-align: center; text-decoration: none; display: inline-block; letter-spacing: 0.5px; }
      .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(124, 58, 237, 0.65); filter: brightness(1.1); }
      
      /* جدول اللوقات الفخم */
      .logs-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      .logs-table th, .logs-table td { padding: 15px 18px; text-align: right; border-bottom: 1px solid rgba(139, 92, 246, 0.15); font-size: 14px; }
      .logs-table th { color: #c084fc; font-weight: 800; background: rgba(124, 58, 237, 0.1); border-radius: 10px; }
      .logs-table tr:hover { background: rgba(124, 58, 237, 0.05); }
      .log-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
      .log-ticket { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
      .log-server { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.4); }
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
          <div class="nav-label">التحكم الرئيسي</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}"><span>🎨 ألوان القواعد (17)</span></a>
          <a href="/tickets" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}"><span>🎫 إعدادات التذاكر والكاتيجوري</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label">السجلات والتقارير</div>
          <a href="/logs" class="nav-item ${activeTab === 'logs' ? 'active' : ''}"><span>📜 سجلات السيرفر والتذاكر</span><div class="badge-live">LIVE</div></a>
          <a href="/moderation" class="nav-item ${activeTab === 'moderation' ? 'active' : ''}"><span>🔨 إدارة السيرفر</span></a>
          <a href="/security" class="nav-item ${activeTab === 'security' ? 'active' : ''}"><span>🛡️ حماية السيرفر</span></a>
        </div>
      </div>
      <a href="/logout" class="btn" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; margin-top: 0; box-shadow: none;">🚪 تسجيل الخروج</a>
    </div>
    <div class="main-content">${content}</div>
  </body>
  </html>
`;

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void • Login Center</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        body { background: #030108; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Cairo', sans-serif; }
        .login-card { background: rgba(14, 10, 26, 0.9); backdrop-filter: blur(40px); border: 1px solid rgba(139, 92, 246, 0.35); padding: 45px; border-radius: 28px; text-align: center; width: 440px; box-shadow: 0 25px 70px rgba(0,0,0,0.9); }
        .logo-icon { font-size: 55px; margin-bottom: 12px; filter: drop-shadow(0 0 25px rgba(168,85,247,0.8)); }
        input { width: 100%; padding: 16px; border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(6, 4, 14, 0.95); color: #fff; text-align: center; font-size: 16px; margin-bottom: 22px; outline: none; }
        input:focus { border-color: #a855f7; box-shadow: 0 0 25px rgba(168,85,247,0.4); }
        button { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 16px; border-radius: 16px; width: 100%; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 6px 25px rgba(124,58,237,0.5); transition: 0.3s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(124,58,237,0.7); }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div class="logo-icon">🌌</div>
        <h1 style="font-size: 28px; margin-bottom: 8px;" class="purple-gradient">VOID COMMUNITY</h1>
        <p style="color: #a78bfa; font-size: 13px; margin-bottom: 30px;">أدخل كلمة المرور السرية للدخول إلى مركز التحكم</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">تسجيل الدخول والتوثيق</button>
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
    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(14,10,26,0.95), rgba(76,29,149,0.25));">
      <div>
        <h1 class="purple-gradient" style="margin: 0; font-size: 26px; font-weight: 900;">🎨 إدارة ألوان القواعد (17 قاعدة)</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 15px;">مرحباً بك يا قائد، ${req.session.user?.username || 'المسؤول'} 👋 | تحكم كامل بأسعار وشروط القواعد ونشر اللوحة.</p>
      </div>
      <span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); padding: 10px 20px; border-radius: 30px; font-weight: 800; font-size: 14px;">🟢 النظام متصل ونشط</span>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 19px;" class="purple-gradient">📢 نشر لوحة الألوان في ديسكورد</h2>
      <form action="/send-panel" method="POST">
        <label>اختر الروم المخصص لنشر اللوحة:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <button type="submit" class="btn">🚀 نشر لوحة الألوان الفخمة الآن</button>
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
  addDashboardLog('server', 'تحديث الأسعار', 'تم تحديث أسعار وشروط ألوان القواعد بنجاح عبر لوحة التحكم.');
  res.redirect('/');
});

app.get('/tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card" style="background: linear-gradient(135deg, rgba(14,10,26,0.95), rgba(76,29,149,0.25));">
      <h1 class="purple-gradient" style="margin: 0; font-size: 26px; font-weight: 900;">🎫 إعدادات التذاكر والكاتيجوري</h1>
      <p style="color: #94a3b8; margin-top: 8px; font-size: 15px;">تحديد آيدي كاتيجوري التذاكر ورتبة التحكم (Owner).</p>
    </div>
    
    <form action="/save-tickets" method="POST">
      <div class="glass-card">
        <label>معرفات كاتيجوري التذاكر (Category IDs - يدعم أكثر من آيدي مفصول بفاصلة):</label>
        <input type="text" name="ticketCategories" value="${serverSettings.ticketCategories}" placeholder="مثال: 123456789012345678, 987654321098765432">

        <label>اسم رتبة الـ Owner المسؤول عن خيارات التحكم والإغلاق:</label>
        <input type="text" name="ownerRoleName" value="${serverSettings.ownerRoleName}" placeholder="Owner">

        <button type="submit" class="btn" style="font-size: 18px;">💾 حفظ إعدادات التذاكر</button>
      </div>
    </form>
  `;
  res.send(renderUltimateLayout('tickets', content));
});

app.post('/save-tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  if (req.body.ticketCategories !== undefined) serverSettings.ticketCategories = req.body.ticketCategories;
  if (req.body.ownerRoleName) serverSettings.ownerRoleName = req.body.ownerRoleName;
  addDashboardLog('server', 'إعدادات التذاكر', 'تم تحديث إعدادات كاتيجوري التذاكر ورتبة الإدارة بنجاح.');
  res.redirect('/tickets');
});

// صفحة اللوقات الأسطورية داخل لوحة التحكم
app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  const logsRows = dashboardLogs.length === 0 
    ? `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 30px;">لا توجد سجلات مسجلة حتى الآن. ستظهر هنا كافة الأحداث والتذاكر تلقائياً.</td></tr>`
    : dashboardLogs.map(log => `
      <tr>
        <td style="font-weight: 700; color: #c084fc;">${log.title}</td>
        <td>${log.description}</td>
        <td><span class="log-badge ${log.type === 'ticket' ? 'log-ticket' : 'log-server'}">${log.type === 'ticket' ? '🎫 تذكرة' : '⚙️ نظام'}</span></td>
        <td style="color: #94a3b8; font-size: 13px;">${log.time}</td>
      </tr>
    `).join('');

  const content = `
    <div class="glass-card" style="background: linear-gradient(135deg, rgba(14,10,26,0.95), rgba(76,29,149,0.25));">
      <h1 class="purple-gradient" style="margin: 0; font-size: 26px; font-weight: 900;">📜 مركز السجلات والتقارير الشامل (Dashboard Logs)</h1>
      <p style="color: #94a3b8; margin-top: 8px; font-size: 15px;">جميع تقارير السيرفر، إغلاق التذاكر، والسجلات الحية يتم عرضها هنا حصرياً بدون إزعاج في ديسكورد.</p>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 19px;" class="purple-gradient">🔍 السجلات والنشاطات الحديثة</h2>
      <div style="overflow-x: auto; margin-top: 20px;">
        <table class="logs-table">
          <thead>
            <tr>
              <th>حدث السجل</th>
              <th>التفاصيل والوقت</th>
              <th>النوع</th>
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

app.get('/moderation', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('moderation', `<div class="glass-card"><h1 class="purple-gradient">🔨 إدارة السيرفر والأعضاء</h1><p style="color:#94a3b8;">قريباً سيتم إضافة أدوات الإدارة السريعة هنا.</p></div>`));
});

app.get('/security', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('security', `<div class="glass-card"><h1 class="purple-gradient">🛡️ حماية السيرفر والأمان</h1><p style="color:#94a3b8;">أنظمة الحماية ضد الهجمات مفعلة بالكامل.</p></div>`));
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
    addDashboardLog('server', 'نشر لوحة الألوان', `تم نشر لوحة الألوان بنجاح في القناة: #${channel.name}`);
    res.redirect('/');
  } catch (err) {
    res.send(`<h2 style="color:red; text-align:center; margin-top:50px;">❌ خطأ أثناء النشر: ${err.message}<br><br><a href="/">العودة للوحة</a></h2>`);
  }
});

app.listen(PORT, () => console.log(`🌐 Ultimate Dashboard Active on port ${PORT}`));

// ------------------- 7. بوت ديسكورد -------------------
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
  addDashboardLog('server', 'تشغيل البوت', `تم تشغيل بوت ديسكورد بنجاح باسم ${client.user.tag}`);
});

// تسجيل الأحداث في لوحة التحكم بدلاً من ديسكورد
client.on('guildMemberAdd', member => {
  addDashboardLog('server', 'انضمام عضو', `العضو ${member.user.tag} انضم إلى السيرفر.`);
});

client.on('guildMemberRemove', member => {
  addDashboardLog('server', 'مغادرة عضو', `العضو ${member.user.tag} غادر السيرفر.`);
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

      addDashboardLog('ticket', 'فتح تذكرة جديدة', `تم فتح تذكرة لون ${baseName} بواسطة العضو @${interaction.user.username}`);
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
    await interaction.reply({ content: `✅ **تمت إضافة العضو <@${targetUserId}> للتذكرة بنجاح!**` });
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_close_reason')) {
    const reason = interaction.fields.getTextInputValue('close_reason_input');
    await interaction.reply('⏳ **جاري حفظ سجلات التذكرة وإغلاق القناة...**');

    const ticketData = ticketsDataMap.get(interaction.channel.id) || {};
    const { count } = await createTranscriptBuffer(interaction.channel, interaction.user);

    // تسجيل إغلاق التذكرة في لوحة التحكم حصرياً (بدون رومات في ديسكورد)
    addDashboardLog('ticket', 'إغلاق تذكرة', `التذكرة #${interaction.channel.name} أُغلقت بواسطة @${interaction.user.username} | السبب: ${reason} | عدد الرسائل: ${count}`);

    setTimeout(() => {
      ticketsDataMap.delete(interaction.channel.id);
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

client.login(TOKEN);
module.exports = client;
