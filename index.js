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
const axios = require('axios');

// ------------------- 1. قاعدة البيانات الـ 17 لون -------------------
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

// ------------------- 2. إعدادات السيرفر والتوثيق -------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'void_community_secure_key_2026',
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

// ------------------- 3. تصميم اللوحة الشفاف (ProBot Glassmorphism) -------------------
const renderProLayout = (activeTab, content) => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>Void Community - Dashboard</title>
    <style>
      * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
      body { background: #06040e; color: #f8fafc; margin: 0; padding: 0; display: flex; min-height: 100vh; overflow-x: hidden; }
      
      .sidebar {
        width: 260px; background: rgba(13, 10, 25, 0.85); backdrop-filter: blur(20px);
        border-left: 1px solid rgba(139, 92, 246, 0.2); padding: 25px 15px; display: flex;
        flex-direction: column; justify-content: space-between; position: fixed; right: 0; top: 0; bottom: 0; z-index: 100;
      }
      .brand-title { font-size: 22px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 25px; letter-spacing: 2px; }
      .brand-title span { color: #a78bfa; }
      .nav-group { margin-bottom: 20px; }
      .nav-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; padding-right: 10px; }
      .nav-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px; border-radius: 12px; color: #94a3b8; text-decoration: none;
        font-weight: 600; font-size: 14px; margin-bottom: 5px; transition: 0.3s;
      }
      .nav-item:hover, .nav-item.active { background: rgba(124, 58, 237, 0.2); color: #fff; border: 1px solid rgba(139, 92, 246, 0.3); }

      .main-content { margin-right: 260px; flex: 1; padding: 35px; }
      .glass-card {
        background: rgba(18, 16, 28, 0.65); backdrop-filter: blur(20px);
        border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 20px;
        padding: 30px; margin-bottom: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      }
      h1, h2 { color: #fff; margin-top: 0; }
      .purple-text { color: #c084fc; }
      input, textarea, select {
        width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.3);
        background: rgba(8, 6, 18, 0.8); color: #fff; outline: none; margin-top: 8px; font-size: 14px;
      }
      select option { background: #0c0a14; color: #fff; }
      .btn {
        background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none;
        padding: 14px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%; transition: 0.3s; margin-top: 15px;
      }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(124, 58, 237, 0.5); }
      .badge { background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 6px 12px; border-radius: 20px; font-size: 12px; border: 1px solid rgba(34, 197, 94, 0.4); }
    </style>
  </head>
  <body>
    <div class="sidebar">
      <div>
        <div class="brand-title">🌌 V<span>OID</span></div>
        
        <div class="nav-group">
          <div class="nav-label">عام</div>
          <a href="/" class="nav-item ${activeTab === 'colors' ? 'active' : ''}">
            <span>🎨 ألوان القواعد (17)</span>
          </a>
          <a href="#" class="nav-item ${activeTab === 'tickets' ? 'active' : ''}">
            <span>🎫 التذاكر</span> <span class="badge">✔</span>
          </a>
        </div>

        <div class="nav-group">
          <div class="nav-label">الإدارة والحماية</div>
          <a href="#" class="nav-item"><span>🔨 الإدارة</span></a>
          <a href="#" class="nav-item"><span>📜 اللوقات</span> <span class="badge">✔</span></a>
          <a href="#" class="nav-item"><span>🛡️ الحماية التلقائية</span> <span class="badge">✔</span></a>
          <a href="#" class="nav-item"><span>🚨 مكافحة الهجمات</span> <span class="badge">✔</span></a>
        </div>
      </div>

      <a href="/login" class="btn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;">تسجيل الخروج</a>
    </div>

    <div class="main-content">
      ${content}
    </div>
  </body>
  </html>
`;

// ------------------- 4. مسارات الدخول والتوثيق -------------------
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void - تسجيل الدخول</title>
      <style>
        body { background: #05040a; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
        .login-card { background: rgba(18, 16, 28, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(139, 92, 246, 0.3); padding: 40px; border-radius: 24px; text-align: center; width: 360px; }
        input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(10, 8, 20, 0.8); color: #fff; text-align: center; font-size: 16px; margin-bottom: 15px; outline: none; }
        button { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; padding: 14px; border-radius: 12px; width: 100%; font-weight: bold; font-size: 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div style="font-size: 40px; margin-bottom: 10px;">🌌</div>
        <h2>لوحة تحكم Void</h2>
        <p style="color: #a78bfa; font-size: 13px;">أدخل كلمة المرور للانتقال لربط الديسكورد</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required>
          <button type="submit">دخول النظام</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/login/pass', (req, res) => {
  if (req.body.password === DASHBOARD_PASSWORD) {
    req.session.passAuthenticated = true;
    const redirectUriEncoded = encodeURIComponent(REDIRECT_URI);
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUriEncoded}&response_type=code&scope=identify%20guilds`;
    res.redirect(discordAuthUrl);
  } else {
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ كلمة المرور خاطئة! <a href="/login">إعادة المحاولة</a></h2>');
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

// ------------------- 5. الصفحة الرئيسية -------------------
app.get('/', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  let channelOptionsHTML = '<option value="" disabled selected>اختر القناة من السيرفر إلكترونياً...</option>';
  try {
    client.guilds.cache.forEach(guild => {
      const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      textChannels.forEach(channel => {
        channelOptionsHTML += `<option value="${channel.id}"># ${channel.name} — (${guild.name})</option>`;
      });
    });
  } catch (e) {
    console.error(e);
  }

  const content = `
    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="margin:0;" class="purple-text">لوحة تحكم Void Community</h2>
        <span style="color:#a78bfa; font-size:14px;">مرحباً بك، ${req.session.user?.username || 'المسؤول'} 👋</span>
      </div>
      <span class="badge">🟢 النظام متصل</span>
    </div>

    <div class="glass-card">
      <h2 class="purple-text">📢 إرسال لوحة الألوان إلى ديسكورد</h2>
      <form action="/send-panel" method="POST">
        <label>اختر القناة المخصصة:</label>
        <select name="channel_id" required>${channelOptionsHTML}</select>
        <button type="submit" class="btn">🚀 إرسال اللوحة للقناة المحددة</button>
      </form>
    </div>

    <form action="/save" method="POST">
      <h2 class="purple-text" style="margin-bottom: 20px;">🎨 أسعار وشروط القواعد (17 لون)</h2>
      ${Object.keys(basesData).map(key => `
        <div class="glass-card" style="padding:20px;">
          <h3 style="margin:0 0 10px 0; color:#a78bfa;">${basesData[key].emoji}${basesData[key].name}</h3>
          <label>💰 المقابل المادي:</label>
          <textarea name="${key}_money" rows="2">${basesData[key].money}</textarea>
          <label>🎁 مقابل الأغراض:</label>
          <textarea name="${key}_items" rows="2">${basesData[key].items}</textarea>
        </div>
      `).join('')}
      <button type="submit" class="btn" style="position: sticky; bottom:20px;">💾 حفظ كل التعديلات</button>
    </form>
  `;

  res.send(renderProLayout('colors', content));
});

app.post('/save', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  Object.keys(basesData).forEach(key => {
    if (req.body[`${key}_money`]) basesData[key].money = req.body[`${key}_money`];
    if (req.body[`${key}_items`]) basesData[key].items = req.body[`${key}_items`];
  });
  res.send('<h2 style="text-align:center; color:#4ade80; font-family:sans-serif; margin-top:50px;">✅ تم حفظ التعديلات بنجاح!<br><br><a href="/" style="color:#a78bfa;">العودة للوحة التحكم</a></h2>');
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
    res.send(`<h2 style="text-align:center; color:#4ade80; font-family:sans-serif; margin-top:50px;">✅ تم إرسال اللوحة للقناة بنجاح!<br><br><a href="/" style="color:#a78bfa;">العودة للوحة التحكم</a></h2>`);
  } catch (err) {
    res.send(`<h2 style="text-align:center; color:#ef4444; font-family:sans-serif; margin-top:50px;">❌ حدث خطأ: ${err.message}<br><br><a href="/" style="color:#a78bfa;">العودة للوحة التحكم</a></h2>`);
  }
});

app.listen(PORT, () => console.log(`🌐 Dashboard Active on port ${PORT}`));

// ------------------- 6. إعداد وتجهيز بوت الديسكورد -------------------
const client = new Client({
  intents: [
    I.Guilds, I.GuildMembers, I.GuildMessages, I.MessageContent,
    I.GuildMessageReactions, I.GuildVoiceStates, I.GuildModeration, I.GuildInvites,
    I.GuildExpressions ?? I.GuildEmojisAndStickers
  ],
  partials: [P.Message, P.Channel, P.Reaction, P.User, P.GuildMember]
});

client.commands = new Collection();

const loadFiles = dir => {
  const fullDir = path.join(__dirname, dir);
  if (fs.existsSync(fullDir)) {
    return fs.readdirSync(fullDir).filter(f => f.endsWith('.js')).map(f => require(path.join(fullDir, f)));
  }
  return [];
};

for (const c of loadFiles('commands')) client.commands.set(c.data.name, c);
for (const m of loadFiles('events')) {
  for (const ev of [].concat(m)) {
    client[ev.once ? 'once' : 'on'](ev.name, (...args) =>
      Promise.resolve(ev.execute(...args, client)).catch(e => console.error(`[${ev.name}]`, e)));
  }
}

// ------------------- 7. التذاكر والتفاعلات -------------------
const userSessions = new Map();

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
