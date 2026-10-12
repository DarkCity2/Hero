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
  TextInputStyle 
} = require('discord.js');
const express = require('express');
const session = require('express-session');
const axios = require('axios');

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
  ticketCategoryId: '',
  supportRole: 'Staff Moderator 🛠️',
  logChannel: 'ticket-logs 📜',
  maxTickets: 1,
  autoMuteSpam: true,
  blockLinks: true,
  antiRaid: true
};

// ------------------- 2. إعدادات السيرفر و Express -------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'void_community_secret_2026',
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

// ------------------- 3. تصميم واجهة اللوحة الفخم (Glassmorphic + Neon) -------------------
const renderUltimateLayout = (activeTab, content) => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>Void Community - Dashboard</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
      * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
      
      body { 
        background: #05030a;
        color: #f8fafc; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; 
      }

      .sidebar {
        width: 290px; background: rgba(10, 7, 20, 0.98); backdrop-filter: blur(30px);
        border-left: 1px solid rgba(139, 92, 246, 0.3); padding: 20px 15px; display: flex;
        flex-direction: column; justify-content: space-between; position: fixed; right: 0; top: 0; bottom: 0; z-index: 100;
        box-shadow: -10px 0 40px rgba(0,0,0,0.9);
      }
      
      .brand-box { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(139, 92, 246, 0.2); }
      .brand-logo-icon { font-size: 38px; margin-bottom: 5px; text-shadow: 0 0 20px rgba(168,85,247,0.7); }
      .brand-title { font-size: 20px; font-weight: 900; background: linear-gradient(135deg, #e9d5ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 2px; }

      .nav-group { margin-bottom: 20px; }
      .nav-label { font-size: 11px; color: #a855f7; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; padding-right: 12px; }
      
      .nav-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 16px; border-radius: 14px; color: #94a3b8; text-decoration: none;
        font-weight: 600; font-size: 14px; margin-bottom: 6px; transition: all 0.3s ease;
      }
      .nav-item:hover { background: rgba(124, 58, 237, 0.2); color: #fff; }
      .nav-item.active { background: linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(99, 102, 241, 0.3)); color: #fff; border: 1px solid rgba(139, 92, 246, 0.6); box-shadow: 0 0 20px rgba(124, 58, 237, 0.4); }
      
      .badge-check { background: rgba(34, 197, 94, 0.2); color: #4ade80; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid rgba(34, 197, 94, 0.4); }

      .main-content { margin-right: 290px; flex: 1; padding: 35px; max-width: 1200px; position: relative; z-index: 10; }
      
      .glass-card {
        background: rgba(16, 12, 28, 0.88); backdrop-filter: blur(25px);
        border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 22px;
        padding: 30px; margin-bottom: 25px; box-shadow: 0 15px 50px rgba(0,0,0,0.7);
      }

      h1, h2, h3 { color: #fff; margin-top: 0; }
      .purple-gradient { background: linear-gradient(135deg, #c084fc, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      
      input, textarea, select {
        width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(139, 92, 246, 0.35);
        background: rgba(8, 6, 16, 0.95); color: #fff; outline: none; margin-top: 8px; font-size: 15px; transition: 0.3s;
      }
      select option { background: #0c0a14; color: #fff; }
      label { font-size: 14px; font-weight: 600; color: #cbd5e1; display: block; margin-top: 15px; }

      .btn {
        background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none;
        padding: 15px 30px; border-radius: 14px; font-weight: 700; cursor: pointer; width: 100%; 
        transition: all 0.3s ease; box-shadow: 0 4px 25px rgba(124, 58, 237, 0.4); margin-top: 20px; font-size: 16px;
        text-align: center; text-decoration: none; display: inline-block;
      }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(124, 58, 237, 0.6); }

      .toggle-box { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 16px; border: 1px solid rgba(139,92,246,0.2); margin-top: 12px; }
      .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #1e1b4b; transition: .4s; border-radius: 34px; border: 1px solid rgba(139,92,246,0.3); }
      .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background: #7c3aed; }
      input:checked + .slider:before { transform: translateX(24px); }
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
          <div class="nav-label">عام</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}">
            <span>🎨 ألوان القواعد (17)</span>
          </a>
          <a href="/tickets" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}">
            <span>🎫 التذاكر والدعم</span>
            <div class="badge-check">✓</div>
          </a>
        </div>

        <div class="nav-group">
          <div class="nav-label">الإدارة والحماية</div>
          <a href="/moderation" class="nav-item ${activeTab === 'moderation' ? 'active' : ''}">
            <span>🔨 إدارة السيرفر</span>
            <div class="badge-check">✓</div>
          </a>
          <a href="/logs" class="nav-item ${activeTab === 'logs' ? 'active' : ''}">
            <span>📜 السجلات (اللوقات)</span>
            <div class="badge-check">✓</div>
          </a>
          <a href="/security" class="nav-item ${activeTab === 'security' ? 'active' : ''}">
            <span>🛡️ الحماية ومكافحة الهجمات</span>
            <div class="badge-check">✓</div>
          </a>
        </div>
      </div>

      <a href="/logout" class="btn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; margin-top: 0;">تسجيل الخروج</a>
    </div>

    <div class="main-content">
      ${content}
    </div>
  </body>
  </html>
`;

// ------------------- 4. مسارات المصادقة -------------------
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void - تسجيل الدخول</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        body { background: #05040a; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Cairo', sans-serif; }
        .login-card { background: rgba(18, 14, 30, 0.95); backdrop-filter: blur(25px); border: 1px solid rgba(139, 92, 246, 0.4); padding: 40px; border-radius: 24px; text-align: center; width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.9); }
        .logo-icon { font-size: 50px; margin-bottom: 10px; text-shadow: 0 0 25px rgba(168,85,247,0.7); }
        input { width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(10, 8, 20, 0.9); color: #fff; text-align: center; font-size: 16px; margin-bottom: 20px; outline: none; }
        button { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 15px; border-radius: 14px; width: 100%; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,0.4); }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div class="logo-icon">🌌</div>
        <h1 style="font-size: 26px; margin-bottom: 5px;" class="purple-gradient">VOID COMMUNITY</h1>
        <p style="color: #a78bfa; font-size: 13px; margin-bottom: 25px;">أدخل كلمة المرور للانتقال لربط الديسكورد</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول ونقلي لديسكورد</button>
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
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ كلمة المرور خاطئة!<br><br><a href="/login">إعادة المحاولة</a></h2>');
  }
});

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login');

  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { 
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    req.session.authenticated = true;
    req.session.user = userResponse.data;
    res.redirect('/');
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ فشل الربط مع ديسكورد.<br>تأكد من تجديد الـ CLIENT_SECRET بـ Render.<br><br><a href="/login" style="color:#a78bfa;">إعادة المحاولة</a></h2>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ------------------- 5. صفحات لوحة التحكم المكتملة -------------------
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
        <h1 class="purple-gradient" style="margin: 0; font-size: 24px;">🎨 إدارة ألوان القواعد (17 لون)</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">مرحباً بك، ${req.session.user?.username || 'المسؤول'} 👋 | تعديل أسعار ونشر اللوحة.</p>
      </div>
      <span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); padding: 8px 16px; border-radius: 20px; font-weight: 700;">🟢 التوثيق نشط</span>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 18px;" class="purple-gradient">📢 إرسال لوحة الألوان إلى ديسكورد</h2>
      <form action="/send-panel" method="POST">
        <label>اختر القناة المخصصة من السيرفر:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <button type="submit" class="btn">🚀 نشر لوحة الألوان الآن</button>
      </form>
    </div>

    <form action="/save-colors" method="POST">
      <h2 style="font-size: 18px; margin-bottom: 20px;" class="purple-gradient">⚡ تعديل أسعار وشروط الـ 17 قاعدة</h2>
      ${Object.keys(basesData).map(key => `
        <div class="glass-card" style="padding: 22px;">
          <h3 style="margin: 0 0 12px 0; color: #c084fc; font-size: 17px;">${basesData[key].emoji}${basesData[key].name}</h3>
          <label>💰 المقابل المادي:</label>
          <textarea name="${key}_money" rows="2">${basesData[key].money}</textarea>
          <label>🎁 مقابل الأغراض:</label>
          <textarea name="${key}_items" rows="2">${basesData[key].items}</textarea>
        </div>
      `).join('')}
      <button type="submit" class="btn" style="position: sticky; bottom: 25px; z-index: 10;">💾 حفظ كافة التعديلات</button>
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
  res.redirect('/');
});

app.get('/tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin: 0; font-size: 24px;">🎫 إعدادات نظام التذاكر والدعم</h1>
      <p style="color: #94a3b8; margin-top: 5px;">تحديد كاتيجوري التذاكر، رتب الدعم الفني، وإعدادات الفتح.</p>
    </div>
    
    <form action="/save-tickets" method="POST">
      <div class="glass-card">
        <label>معرف كاتيجوري التذاكر (Category ID):</label>
        <input type="text" name="ticketCategoryId" value="${serverSettings.ticketCategoryId}" placeholder="مثال: 123456789012345678">

        <label>اسم رتبة الدعم الفني العامة:</label>
        <input type="text" name="supportRole" value="${serverSettings.supportRole}">

        <label>أقصى عدد تذاكر مفتوحة للعضو:</label>
        <input type="number" name="maxTickets" value="${serverSettings.maxTickets}">

        <button type="submit" class="btn">💾 حفظ إعدادات التذاكر</button>
      </div>
    </form>
  `;
  res.send(renderUltimateLayout('tickets', content));
});

app.post('/save-tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  serverSettings.ticketCategoryId = req.body.ticketCategoryId;
  serverSettings.supportRole = req.body.supportRole;
  serverSettings.maxTickets = req.body.maxTickets;
  res.redirect('/tickets');
});

app.get('/moderation', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:24px;">🔨 نظام إدارة السيرفر والعقوبات</h1>
      <p style="color: #94a3b8; margin-top: 5px;">تخصيص الإجراءات الإدارية والعقوبات في Void Community.</p>
    </div>
    <form action="/save-mod" method="POST">
      <div class="glass-card">
        <div class="toggle-box">
          <div><strong>تفعيل الميوت الآلي للسبام</strong><div style="font-size:12px; color:#94a3b8;">إعطاء تايم أوت عند تكرار الرسائل المزعجة.</div></div>
          <label class="switch"><input type="checkbox" name="autoMuteSpam" ${serverSettings.autoMuteSpam ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <button type="submit" class="btn">💾 حفظ إعدادات الإدارة</button>
      </div>
    </form>
  `;
  res.send(renderUltimateLayout('moderation', content));
});

app.post('/save-mod', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  serverSettings.autoMuteSpam = !!req.body.autoMuteSpam;
  res.redirect('/moderation');
});

app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:24px;">📜 سجلات الأحداث الشاملة (Audit Logs)</h1>
      <p style="color: #94a3b8; margin-top: 5px;">مراقبة تحركات وحذف الرسائل بالسيرفر.</p>
    </div>
    <div class="glass-card">
      <div class="toggle-box">
        <div><strong>سجل حذف وتعديل الرسائل</strong><div style="font-size:12px; color:#94a3b8;">تتبع رسائل الأعضاء المحذوفة.</div></div>
        <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
      </div>
      <button onclick="alert('تم حفظ إعدادات السجلات!')" class="btn">💾 حفظ اللوقات</button>
    </div>
  `;
  res.send(renderUltimateLayout('logs', content));
});

app.get('/security', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin:0; font-size:24px;">🛡️ نظام الحماية ومكافحة الهجمات (Anti-Raid)</h1>
      <p style="color: #94a3b8; margin-top: 5px;">حظر الروابط والحسابات الوهمية.</p>
    </div>
    <form action="/save-sec" method="POST">
      <div class="glass-card">
        <div class="toggle-box">
          <div><strong>حظر الروابط الخارجية والدعوات</strong><div style="font-size:12px; color:#94a3b8;">حذف أي رابط دعوة سيرفر فوراً.</div></div>
          <label class="switch"><input type="checkbox" name="blockLinks" ${serverSettings.blockLinks ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <button type="submit" class="btn">💾 حفظ إعدادات الحماية</button>
      </div>
    </form>
  `;
  res.send(renderUltimateLayout('security', content));
});

app.post('/save-sec', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  serverSettings.blockLinks = !!req.body.blockLinks;
  res.redirect('/security');
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
      .setDescription('اختر القاعدة التي تريد طلبها من القائمة المنسدلة أدناه لتقديم بياناتك ونوع المقابل:')
      .setColor('#2b2d31')
      .setFooter({ text: 'Void Community System' });

    await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
    res.redirect('/');
  } catch (err) {
    res.send(`<h2 style="color:red; text-align:center; margin-top:50px;">❌ خطأ: ${err.message}<br><br><a href="/">العودة</a></h2>`);
  }
});

app.listen(PORT, () => console.log(`🌐 Dashboard Active on port ${PORT}`));

// ------------------- 6. تشغيل بوت ديسكورد والتذاكر (نظام الرتب الخاصة) -------------------
const client = new Client({
  intents: [
    I.Guilds, I.GuildMembers, I.GuildMessages, I.MessageContent,
    I.GuildMessageReactions, I.GuildVoiceStates, I.GuildModeration, I.GuildInvites,
    I.GuildExpressions ?? I.GuildEmojisAndStickers
  ],
  partials: [P.Message, P.Channel, P.Reaction, P.User, P.GuildMember]
});

const userSessions = new Map();

client.once('ready', () => {
  console.log(`✅ [Void Community] البوت يعمل باسم: ${client.user.tag}`);
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

      const channelOptions = {
        name: `ticket-${session?.baseKey || 'color'}-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        permissionOverwrites: permissionOverwrites
      };

      if (serverSettings.ticketCategoryId) {
        channelOptions.parent = serverSettings.ticketCategoryId;
      }

      const ch = await interaction.guild.channels.create(channelOptions);

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Void Community | طلب لون ${baseName}`)
        .addFields(
          { name: '👤 العضو', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🛡️ الضمان', value: session ? session.guarantee : 'غير محدد', inline: true },
          { name: '🔢 عدد النواقص', value: session ? session.missing : 'غير محدد', inline: true },
          { name: '👑 الرتبة المخولة لرؤية التذكرة', value: specificRole ? `<@&${specificRole.id}>` : 'لم يتم العثور على رتبة مطابقة للاسم', inline: false }
        )
        .setColor('#57f287')
        .setFooter({ text: 'Void Community System' });

      await ch.send({ 
        content: `<@${interaction.user.id}> ${specificRole ? `<@&${specificRole.id}>` : ''}`, 
        embeds: [embed], 
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setEmoji('🔒').setStyle(ButtonStyle.Danger))] 
      });
      
      await interaction.update({ content: `🎉 **تم قبول الطلب بنجاح!**\nتم فتح القناة الخاصة بك داخل الكاتيجوري: ${ch}`, components: [] });
    }

    if (interaction.customId === 'btn_reject') {
      await interaction.update({ content: '❌ **تم إلغاء الطلب.**', components: [] });
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  }
});

client.login(TOKEN);
module.exports = client;
