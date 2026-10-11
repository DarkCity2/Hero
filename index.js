require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'void_community_glassmorphism_secure_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 * 24 } // 24 ساعة
}));

const port = process.env.PORT || 3000;
const BASE_URL = (process.env.BASE_URL || 'https://void-community.onrender.com').replace(/\/$/, '');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'VD122';
const TOKEN = process.env.TOKEN;

const REDIRECT_URI = `${BASE_URL}/api/auth/callback`;

// ------------------- قاعدة البيانات الـ 17 لون -------------------
let basesData = {
  silver: { name: 'Silver Base', emoji: '⚪', money: 'اذا ناقصك 15 وتحت المبلغ ( 20 ريال ) اذا فوق 15 ( 40 ريال )', items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)' },
  gold: { name: 'Gold Base', emoji: '🟡', money: 'اذا ناقصك 15 وتحت المبلغ ( 20 ريال ) اذا فوق 15 ( 40 ريال )', items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)' },
  crystal: { name: 'Crystal Base', emoji: '💎', money: 'اذا ناقصك 15 وتحت المبلغ ( 25 ريال ) اذا فوق 15 ( 50 ريال )', items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)' },
  bloodmoon: { name: 'BloodMoon Base', emoji: '🌑', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)' },
  rainbow: { name: 'Rainbow Base GoUp', emoji: '🌈', money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )', items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)' },
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

// ------------------- قوالب التصميم الزجاجية -------------------
const renderGlassLayout = (title, content) => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
      body { 
        background: #080612; color: #f8fafc; margin: 0; padding: 0; min-height: 100vh;
        display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow-x: hidden;
      }
      .bg-glow-1, .bg-glow-2 {
        position: fixed; width: 450px; height: 450px; border-radius: 50%;
        filter: blur(120px); opacity: 0.35; pointer-events: none; z-index: 0; animation: pulse 10s infinite alternate;
      }
      .bg-glow-1 { background: #7c3aed; top: -10%; left: -10%; }
      .bg-glow-2 { background: #2563eb; bottom: -10%; right: -10%; animation-delay: 5s; }
      @keyframes pulse { 0% { transform: scale(1); opacity: 0.25; } 100% { transform: scale(1.2); opacity: 0.45; } }
      .main-wrapper { position: relative; z-index: 10; width: 100%; max-width: 1000px; padding: 20px; }
      .glass-card {
        background: rgba(18, 16, 28, 0.65);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 24px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        padding: 35px; margin-bottom: 25px; transition: all 0.3s ease;
      }
      .glass-card:hover { border-color: rgba(139, 92, 246, 0.45); box-shadow: 0 20px 60px rgba(124, 58, 237, 0.15); }
      h1, h2, h3 { color: #fff; margin-top: 0; }
      .purple-gradient-text { background: linear-gradient(135deg, #c084fc, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      input, textarea, select {
        width: 100%; padding: 14px 18px; border-radius: 12px;
        border: 1px solid rgba(139, 92, 246, 0.3); background: rgba(10, 8, 20, 0.7);
        color: #fff; font-size: 15px; outline: none; transition: 0.3s; margin-top: 8px;
      }
      input:focus, textarea:focus, select:focus {
        border-color: #a78bfa; box-shadow: 0 0 15px rgba(167, 139, 250, 0.25);
      }
      select option { background: #0c0a14; color: #fff; }
      label { font-size: 14px; font-weight: 600; color: #cbd5e1; display: block; margin-top: 15px; }
      .btn {
        background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none;
        padding: 15px 28px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer;
        width: 100%; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35); margin-top: 20px;
        text-align: center; text-decoration: none; display: inline-block;
      }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(124, 58, 237, 0.55); }
      .btn-blue { background: linear-gradient(135deg, #2563eb, #3b82f6); box-shadow: 0 4px 20px rgba(37, 99, 235, 0.35); }
      .btn-blue:hover { box-shadow: 0 6px 25px rgba(37, 99, 235, 0.55); }
      .badge { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    <div class="main-wrapper">${content}</div>
  </body>
  </html>
`;

// ------------------- مسارات الدخول والتوثيق -------------------

// 1. صفحة الدخول (كلمة المرور أولاً)
app.get('/login', (req, res) => {
  const content = `
    <div style="max-width: 420px; margin: 80px auto;">
      <div class="glass-card" style="text-align: center;">
        <div style="width: 80px; height: 80px; background: radial-gradient(circle, #7c3aed, #4c1d95); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);">🌌</div>
        <h2 style="font-size: 26px;" class="purple-gradient-text">لوحة تحكم Void</h2>
        <p style="color: #a78bfa; font-size: 14px; margin-bottom: 25px;">قم بإدخال كلمة المرور للانتقال التلقائي للربط</p>
        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور السرية" required style="text-align: center;">
          <button type="submit" class="btn">دخول للنظام</button>
        </form>
      </div>
    </div>
  `;
  res.send(renderGlassLayout('Void Community - Login', content));
});

// 2. التحقق من كلمة المرور ثم التحويل التلقائي لـ Discord
app.post('/login/pass', (req, res) => {
  if (req.body.password === DASHBOARD_PASSWORD) {
    req.session.passAuthenticated = true;
    const redirectUriEncoded = encodeURIComponent(REDIRECT_URI);
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUriEncoded}&response_type=code&scope=identify%20guilds`;
    res.redirect(discordAuthUrl);
  } else {
    const errorContent = `
      <div style="max-width: 420px; margin: 80px auto; text-align: center;">
        <div class="glass-card">
          <h2 style="color: #ef4444;">❌ كلمة المرور خاطئة</h2>
          <p style="color: #94a3b8; margin-bottom: 20px;">يرجى التأكد من كلمة المرور وإعادة المحاولة.</p>
          <a href="/login" class="btn">إعادة المحاولة</a>
        </div>
      </div>
    `;
    res.send(renderGlassLayout('خطأ في الدخول', errorContent));
  }
});

// 3. استقبال توثيق Discord OAuth2
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    req.session.authenticated = true;
    req.session.user = userResponse.data;
    res.redirect('/');
  } catch (error) {
    console.error('OAuth Error Details:', error.response?.data || error.message);
    const errContent = `
      <div style="max-width: 420px; margin: 80px auto; text-align: center;">
        <div class="glass-card">
          <h2 style="color: #ef4444;">❌ فشل الربط مع Discord</h2>
          <p style="color: #94a3b8; margin-bottom: 20px;">تأكد من مطابقة CLIENT_SECRET و Redirect URI في Render و Discord.</p>
          <a href="/login" class="btn">إعادة المحاولة</a>
        </div>
      </div>
    `;
    res.send(renderGlassLayout('خطأ التوثيق', errContent));
  }
});

// ------------------- اللوحة الرئيسية -------------------
app.get('/', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  const username = req.session.user ? req.session.user.username : 'المسؤول';
  const avatar = req.session.user && req.session.user.avatar 
    ? `https://cdn.discordapp.com/avatars/${req.session.user.id}/${req.session.user.avatar}.png` 
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  let channelOptionsHTML = '<option value="" disabled selected>اختر الروم المخصصة لإرسال اللوحة إليها...</option>';
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
      <div style="display: flex; align-items: center; gap: 15px;">
        <img src="${avatar}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #7c3aed;">
        <div>
          <h2 style="margin: 0; font-size: 20px;" class="purple-gradient-text">لوحة تحكم Void Community</h2>
          <span style="color: #a78bfa; font-size: 14px;">مرحباً بك، ${username} 👋</span>
        </div>
      </div>
      <span class="badge">🟢 النظام موثق ومتصل</span>
    </div>

    <div class="glass-card">
      <h2 style="font-size: 20px;" class="purple-gradient-text">📢 إرسال لوحة الألوان إلى ديسكورد</h2>
      <form action="/send-panel" method="POST">
        <label>اختر القناة من القائمة المنسدلة:</label>
        <select name="channel_id" required>
          ${channelOptionsHTML}
        </select>
        <button type="submit" class="btn btn-blue">🚀 إرسال اللوحة للقناة المحددة</button>
      </form>
    </div>

    <form action="/save" method="POST">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h2 style="font-size: 20px; margin: 0;" class="purple-gradient-text">🎨 تعديل أسعار وشروط الألوان (17 لون)</h2>
      </div>
      
      ${Object.keys(basesData).map(key => `
        <div class="glass-card" style="padding: 22px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #c084fc; font-size: 17px;">${basesData[key].emoji}${basesData[key].name}</h3>
          <label>💰 المقابل المادي:</label>
          <textarea name="${key}_money" rows="2">${basesData[key].money}</textarea>
          <label>🎁 مقابل الأغراض:</label>
          <textarea name="${key}_items" rows="2">${basesData[key].items}</textarea>
        </div>
      `).join('')}

      <button type="submit" class="btn" style="position: sticky; bottom: 20px; z-index: 100;">💾 حفظ كافة التعديلات</button>
    </form>
  `;

  res.send(renderGlassLayout('Void Community - Dashboard', content));
});

// حفظ التعديلات وإظهار صفحة زجاجية أنيقة
app.post('/save', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  Object.keys(basesData).forEach(key => {
    if (req.body[`${key}_money`]) basesData[key].money = req.body[`${key}_money`];
    if (req.body[`${key}_items`]) basesData[key].items = req.body[`${key}_items`];
  });

  const successContent = `
    <div style="max-width: 450px; margin: 80px auto; text-align: center;">
      <div class="glass-card">
        <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
        <h2 class="purple-gradient-text">تم حفظ التعديلات بنجاح!</h2>
        <p style="color: #94a3b8; margin-bottom: 25px;">تم تحديث أسعار وشروط جميع القواعد والألوان بالنظام.</p>
        <a href="/" class="btn">العودة للوحة التحكم</a>
      </div>
    </div>
  `;
  res.send(renderGlassLayout('تم الحفظ', successContent));
});

// إرسال اللوحة للقناة
app.post('/send-panel', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const channelId = req.body.channel_id;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error('القناة غير موجودة أو لا يملك البوت صلاحية الوصول إليها.');

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

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 Void Community | نظام ألوان ماب النطة')
      .setDescription('اختر القاعدة التي تريد طلبها من القائمة المنسدلة أدناه لتقديم بياناتك ونوع المقابل:')
      .setColor('#2b2d31')
      .setFooter({ text: 'Void Community System' });

    await channel.send({ embeds: [embed], components: [row] });

    const sentContent = `
      <div style="max-width: 450px; margin: 80px auto; text-align: center;">
        <div class="glass-card">
          <div style="font-size: 50px; margin-bottom: 10px;">🚀</div>
          <h2 class="purple-gradient-text">تم إرسال اللوحة بنجاح!</h2>
          <p style="color: #94a3b8; margin-bottom: 25px;">تم إرسال لوحة خيارات الألوان للقناة المحددة بنجاح.</p>
          <a href="/" class="btn">العودة للوحة التحكم</a>
        </div>
      </div>
    `;
    res.send(renderGlassLayout('تم الإرسال', sentContent));
  } catch (err) {
    const errContent = `
      <div style="max-width: 450px; margin: 80px auto; text-align: center;">
        <div class="glass-card">
          <h2 style="color: #ef4444;">❌ حدث خطأ أثناء الإرسال</h2>
          <p style="color: #94a3b8; margin-bottom: 25px;">${err.message}</p>
          <a href="/" class="btn">العودة للوحة التحكم</a>
        </div>
      </div>
    `;
    res.send(renderGlassLayout('خطأ إرسال', errContent));
  }
});

app.listen(port, () => console.log(`🌐 Dashboard Active on port ${port}`));

// ------------------- كود ديسكورد وبوت التذاكر -------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const userSessions = new Map();

client.once('ready', () => {
  console.log(`✅ [Void Community] البوت يعمل بنجاح باسم: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_base_color') {
    const selectedKey = interaction.values[0];
    const baseInfo = basesData[selectedKey] || { name: selectedKey };

    const modal = new ModalBuilder()
      .setCustomId(`modal_info_${selectedKey}`)
      .setTitle(`${baseInfo.name} بيانات ضمان`);

    const guaranteeInput = new TextInputBuilder()
      .setCustomId('guarantee_val')
      .setLabel('اكتب الضمان حقك')
      .setPlaceholder('اكتب الضمان')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const missingInput = new TextInputBuilder()
      .setCustomId('missing_val')
      .setLabel('اكتب عدد نواقصك')
      .setPlaceholder('مثال: 5')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(guaranteeInput),
      new ActionRowBuilder().addComponents(missingInput)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_info_')) {
    const baseKey = interaction.customId.replace('modal_info_', '');
    const guarantee = interaction.fields.getTextInputValue('guarantee_val');
    const missing = interaction.fields.getTextInputValue('missing_val');

    userSessions.set(interaction.user.id, {
      baseKey: baseKey,
      guarantee: guarantee,
      missing: missing
    });

    const paymentMenu = new StringSelectMenuBuilder()
      .setCustomId('select_payment')
      .setPlaceholder('اختر نوع المقابل')
      .addOptions([
        { label: 'مقابل مادي', value: 'money', description: 'عرض المقابل المادي المحدد لهذا اللون', emoji: '💰' },
        { label: 'أغراض داخل اللعبة', value: 'items', description: 'عرض الأغراض المحددة مسبقاً لهذا اللون', emoji: '🎁' }
      ]);

    const row = new ActionRowBuilder().addComponents(paymentMenu);

    await interaction.reply({
      content: `✅ **تم حفظ الضمان وعدد النواقص.**\n\n🎨 **الآن اختر نوع المقابل للحصول على ${basesData[baseKey]?.name || baseKey}:**`,
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_payment') {
    const payType = interaction.values[0];
    const session = userSessions.get(interaction.user.id);

    if (!session) {
      return interaction.reply({ content: '❌ انتهت الجلسة، يرجى البدء من جديد.', ephemeral: true });
    }

    const baseConfig = basesData[session.baseKey] || {
      name: session.baseKey,
      money: 'المقابل المادي غير محدد',
      items: 'الأغراض غير محدودة'
    };

    let textDetails = '';
    if (payType === 'money') {
      textDetails = `💰 **المقابل المادي للون ${baseConfig.name}:**\n${baseConfig.money}`;
    } else {
      textDetails = `🎁 **مقابل الأغراض للون ${baseConfig.name}:**\n${baseConfig.items}`;
    }

    const fullMessage = `${textDetails}\n\n**ضمانك:** ${session.guarantee}\n**عدد نواقصك:** ${session.missing}\n\n**هل توافق على هذا المقابل؟**`;

    const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_accept').setLabel('قبول').setEmoji('✅').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn_reject').setLabel('رفض').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    await interaction.update({
      content: fullMessage,
      components: [btns]
    });
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'btn_accept') {
      const session = userSessions.get(interaction.user.id);
      const baseName = basesData[session?.baseKey]?.name || 'Base';

      const ch = await interaction.guild.channels.create({
        name: `ticket-${session?.baseKey || 'color'}-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Void Community | طلب لون ${baseName}`)
        .addFields(
          { name: '👤 العضو', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🛡️ الضمان', value: session ? session.guarantee : 'غير محدد', inline: true },
          { name: '🔢 عدد النواقص', value: session ? session.missing : 'غير محدد', inline: true }
        )
        .setColor('#57f287')
        .setFooter({ text: 'Void Community System' });

      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setEmoji('🔒').setStyle(ButtonStyle.Danger)
      );

      await ch.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeBtn] });

      await interaction.update({
        content: `🎉 **تم قبول الطلب بنجاح!**\nتم فتح القناة الخاصة بك: ${ch}`,
        components: []
      });
    }

    if (interaction.customId === 'btn_reject') {
      await interaction.update({
        content: '❌ **تم إلغاء الطلب.**',
        components: []
      });
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  }
});

client.login(TOKEN);
