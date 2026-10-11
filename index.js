require('dotenv').config();
const fs = require('fs');
const path = require('path');
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

// ------------------- 1. بيانات قواعد الألوان (17 لون) -------------------
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
  ticketCategory: 'Tickets 🎫',
  supportRole: 'Staff Moderator 🛠️',
  logChannel: 'ticket-logs 📜',
  maxTickets: 1
};

// ------------------- 2. السيرفر والجسلسات -------------------
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
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'VD122';
const TOKEN = process.env.TOKEN;

// ------------------- 3. التصميم الأسطوري المطور الخرافي (مع الشعار والتأثيرات) -------------------
const VOID_LOGO_URL = 'https://i.ibb.co/L6S9bK9/IMG-6085.jpg'; // رابط صورة VOID المباشر

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
        background: #06040d;
        color: #f8fafc; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; 
      }

      /* Sidebar الخرافي */
      .sidebar {
        width: 280px; background: rgba(12, 9, 24, 0.95); backdrop-filter: blur(30px);
        border-left: 1px solid rgba(139, 92, 246, 0.25); padding: 25px 15px; display: flex;
        flex-direction: column; justify-content: space-between; position: fixed; right: 0; top: 0; bottom: 0; z-index: 100;
        box-shadow: -10px 0 40px rgba(0,0,0,0.8);
      }
      
      .brand-box { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(139, 92, 246, 0.15); }
      .brand-img { width: 90px; height: 90px; border-radius: 20px; border: 2px solid rgba(168, 85, 247, 0.6); box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); object-fit: cover; margin-bottom: 10px; }
      .brand-title { font-size: 22px; font-weight: 900; background: linear-gradient(135deg, #e9d5ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 2px; }

      .nav-group { margin-bottom: 20px; }
      .nav-label { font-size: 11px; color: #a855f7; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; padding-right: 12px; }
      
      .nav-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 16px; border-radius: 14px; color: #94a3b8; text-decoration: none;
        font-weight: 600; font-size: 14px; margin-bottom: 6px; transition: all 0.3s ease;
      }
      .nav-item:hover { background: rgba(124, 58, 237, 0.15); color: #fff; }
      .nav-item.active { background: linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(99, 102, 241, 0.25)); color: #fff; border: 1px solid rgba(139, 92, 246, 0.5); box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
      
      .badge-check { background: rgba(34, 197, 94, 0.2); color: #4ade80; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid rgba(34, 197, 94, 0.4); }

      /* Main Content */
      .main-content { margin-right: 280px; flex: 1; padding: 40px; max-width: 1200px; }
      
      .glass-card {
        background: rgba(18, 14, 32, 0.8); backdrop-filter: blur(25px);
        border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 22px;
        padding: 30px; margin-bottom: 25px; box-shadow: 0 15px 50px rgba(0,0,0,0.6);
      }

      h1, h2, h3 { color: #fff; margin-top: 0; }
      .purple-gradient { background: linear-gradient(135deg, #c084fc, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      
      input, textarea, select {
        width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(139, 92, 246, 0.3);
        background: rgba(8, 6, 16, 0.85); color: #fff; outline: none; margin-top: 8px; font-size: 15px; transition: 0.3s;
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
    </style>
  </head>
  <body>
    <div class="sidebar">
      <div>
        <div class="brand-box">
          <img src="${VOID_LOGO_URL}" class="brand-img" alt="VOID LOGO" onerror="this.style.display='none'">
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

// ------------------- 4. تسجيل الدخول السريع المباشر (بكلمة المرور فقط) -------------------
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
        .login-card { background: rgba(18, 14, 30, 0.9); backdrop-filter: blur(25px); border: 1px solid rgba(139, 92, 246, 0.35); padding: 45px; border-radius: 24px; text-align: center; width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); }
        .logo-img { width: 100px; height: 100px; border-radius: 20px; border: 2px solid #a855f7; box-shadow: 0 0 25px rgba(168, 85, 247, 0.5); margin-bottom: 15px; object-fit: cover; }
        input { width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(10, 8, 20, 0.9); color: #fff; text-align: center; font-size: 16px; margin-bottom: 20px; outline: none; }
        button { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 15px; border-radius: 14px; width: 100%; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,0.4); }
      </style>
    </head>
    <body>
      <div class="login-card">
        <img src="${VOID_LOGO_URL}" class="logo-img" alt="VOID LOGO" onerror="this.style.display='none'">
        <h1 style="font-size: 26px; margin-bottom: 5px;" class="purple-gradient">VOID COMMUNITY</h1>
        <p style="color: #a78bfa; font-size: 13px; margin-bottom: 25px;">أدخل كلمة المرور لدخول لوحة التحكم مباشرة</p>
        <form action="/login" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول اللوحة الفخمة</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  if (req.body.password === DASHBOARD_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ كلمة المرور خاطئة!<br><br><a href="/login">إعادة المحاولة</a></h2>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ------------------- 5. صفحات اللوحة الشغالة 100% -------------------

// أ) ألوان القواعد
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
        <p style="color: #94a3b8; margin: 5px 0 0 0;">تعديل أسعار وشروط القواعد ونشر اللوحة في القنوات مباشرة.</p>
      </div>
      <span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); padding: 8px 16px; border-radius: 20px; font-weight: 700;">🟢 النظام نشط ومفعل</span>
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

// ب) التذاكر
app.get('/tickets', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const content = `
    <div class="glass-card">
      <h1 class="purple-gradient" style="margin: 0; font-size: 24px;">🎫 إعدادات نظام التذاكر والدعم</h1>
      <p style="color: #94a3b8; margin-top: 5px;">تخصيص رتب الدعم الفني، الكاتيجوري، وسجلات التذاكر.</p>
    </div>
    
    <form action="/save-tickets" method="POST">
      <div class="glass-card">
        <label>اسم كاتيجوري التذاكر:</label>
        <input type="text" name="ticketCategory" value="${serverSettings.ticketCategory}">

        <label>رتبة الدعم الفني والإدارة:</label>
        <input type="text" name="supportRole" value="${serverSettings.supportRole}">

        <label>اسم روم سجلات التذاكر (Logs):</label>
        <input type="text" name="logChannel" value="${serverSettings.logChannel}">

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
  serverSettings.ticketCategory = req.body.ticketCategory;
  serverSettings.supportRole = req.body.supportRole;
  serverSettings.logChannel = req.body.logChannel;
  serverSettings.maxTickets = req.body.maxTickets;
  res.redirect('/tickets');
});

// ج) باقي الأزرار
app.get('/moderation', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('moderation', `
    <div class="glass-card">
      <h1 class="purple-gradient">🔨 إدارة السيرفر والعقوبات</h1>
      <p style="color: #94a3b8;">إعدادات الحظر والتنبيهات المباشرة لـ Void Community.</p>
    </div>
  `));
});

app.get('/logs', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('logs', `
    <div class="glass-card">
      <h1 class="purple-gradient">📜 سجلات الأحداث واللوقات</h1>
      <p style="color: #94a3b8;">تتبع حذف الرسائل ودخول وخروج الأعضاء.</p>
    </div>
  `));
});

app.get('/security', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  res.send(renderUltimateLayout('security', `
    <div class="glass-card">
      <h1 class="purple-gradient">🛡️ الحماية ومكافحة الهجمات (Anti-Raid)</h1>
      <p style="color: #94a3b8;">حماية السيرفر من السبام ودخول الحسابات الوهمية.</p>
    </div>
  `));
});

// نشر اللوحة
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

// ------------------- 6. تشغيل بوت ديسكورد -------------------
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
      const ch = await interaction.guild.channels.create({
        name: `ticket-${session?.baseKey || 'color'}-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Void Community | طلب لون ${basesData[session?.baseKey]?.name || 'Base'}`)
        .addFields(
          { name: '👤 العضو', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🛡️ الضمان', value: session ? session.guarantee : 'غير محدد', inline: true },
          { name: '🔢 عدد النواقص', value: session ? session.missing : 'غير محدد', inline: true }
        )
        .setColor('#57f287')
        .setFooter({ text: 'Void Community System' });

      await ch.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setEmoji('🔒').setStyle(ButtonStyle.Danger))] });
      await interaction.update({ content: `🎉 **تم قبول الطلب بنجاح!**\nتم فتح القناة الخاصة بك: ${ch}`, components: [] });
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
