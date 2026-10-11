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
  secret: 'void_community_oauth_glass_2026',
  resave: false,
  saveUninitialized: true
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

// ------------------- مسارات الربط والدخول -------------------

// صفحة الدخول: إدخال الباسوورد أولاً
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void Community - تسجيل الدخول</title>
      <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { 
          background: #05040a; color: #fff; display: flex; justify-content: center; align-items: center; 
          height: 100vh; margin: 0; overflow: hidden; position: relative; 
        }
        .glow-1, .glow-2 {
          position: absolute; width: 350px; height: 350px; border-radius: 50%;
          filter: blur(100px); opacity: 0.5; animation: pulse 8s infinite alternate;
        }
        .glow-1 { background: #7c3aed; top: 10%; left: 20%; }
        .glow-2 { background: #3b82f6; bottom: 10%; right: 20%; animation-delay: 4s; }
        @keyframes pulse { 0% { transform: scale(1); } 100% { transform: scale(1.3); } }

        .login-card {
          background: rgba(18, 16, 28, 0.65);
          backdrop-filter: blur(20px);
          padding: 40px 35px; border-radius: 24px;
          box-shadow: 0 0 40px rgba(124, 58, 237, 0.25);
          width: 380px; text-align: center;
          border: 1px solid rgba(139, 92, 246, 0.3); z-index: 10;
        }
        .logo-box {
          width: 80px; height: 80px; margin: 0 auto 15px;
          background: radial-gradient(circle, #7c3aed, #4c1d95);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 0 25px #7c3aed; font-size: 32px;
        }
        h2 { font-size: 26px; margin: 0 0 8px; color: #fff; }
        p { color: #a78bfa; font-size: 14px; margin-bottom: 25px; }
        input {
          width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.4);
          background: rgba(15, 13, 25, 0.8); color: #fff; margin-bottom: 15px; text-align: center; outline: none; font-size: 16px;
        }
        .btn-pass {
          background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none;
          padding: 14px; border-radius: 12px; width: 100%; cursor: pointer; font-weight: bold; font-size: 16px; transition: 0.3s;
        }
        .btn-pass:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4); }
      </style>
    </head>
    <body>
      <div class="glow-1"></div>
      <div class="glow-2"></div>
      <div class="login-card">
        <div class="logo-box">🌌</div>
        <h2>لوحة تحكم Void</h2>
        <p>أدخل كلمة المرور للانتقال لربط الحساب</p>

        <form action="/login/pass" method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required>
          <button type="submit" class="btn-pass">دخول بالنظام</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// التحقق من كلمة المرور ثم التحويل التلقائي لتسجيل ديسكورد
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

// استقبال رد ديسكورد OAuth2
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login');

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    req.session.authenticated = true;
    req.session.user = userResponse.data;
    res.redirect('/');
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ فشل التوثيق من ديسكورد. <a href="/login">إعادة المحاولة</a></h2>');
  }
});

// ------------------- اللوحة الرئيسية مع سحب الرومات تلقائياً -------------------
app.get('/', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  const userInfo = req.session.user ? `<span style="color:#a78bfa;">مرحباً، ${req.session.user.username} 👋</span>` : '';

  // سحب كافة القنوات النصية للسيرفرات التي يملك فيها البوت صلاحيات
  let channelOptionsHTML = '<option value="" disabled selected>اختر الروم المراد إرسال اللوحة إليها...</option>';
  try {
    client.guilds.cache.forEach(guild => {
      const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      textChannels.forEach(channel => {
        channelOptionsHTML += `<option value="${channel.id}"># ${channel.name} (${guild.name})</option>`;
      });
    });
  } catch (e) {
    console.error(e);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void Community - Dashboard</title>
      <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background: #05040a; color: #f8fafc; padding: 40px 20px; margin: 0; min-height: 100vh; position: relative; }
        .glow-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; background: radial-gradient(circle at 50% 10%, rgba(124, 58, 237, 0.15), transparent 70%); }
        .container { max-width: 1000px; margin: 0 auto; position: relative; z-index: 10; }
        .header { 
          display: flex; justify-content: space-between; align-items: center; 
          background: rgba(18, 16, 28, 0.65); backdrop-filter: blur(15px);
          padding: 20px 30px; border-radius: 20px; margin-bottom: 30px; 
          border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        h1 { margin: 0; color: #c084fc; font-size: 24px; text-shadow: 0 0 15px rgba(192, 132, 252, 0.4); }
        .badge { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        .panel-box { 
          background: rgba(18, 16, 28, 0.65); backdrop-filter: blur(15px);
          padding: 30px; border-radius: 20px; border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .card { 
          background: rgba(10, 8, 18, 0.6); padding: 20px; border-radius: 16px; 
          margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.08); transition: 0.3s;
        }
        .card:hover { border-color: rgba(167, 139, 250, 0.4); box-shadow: 0 5px 20px rgba(124, 58, 237, 0.15); }
        label { font-weight: bold; display: block; margin-top: 12px; color: #cbd5e1; }
        textarea, input, select { 
          width: 100%; padding: 12px; border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.3); 
          background: rgba(5, 4, 10, 0.8); color: #fff; margin-top: 6px; box-sizing: border-box; outline: none; transition: 0.3s;
        }
        select option { background: #0c0a14; color: #fff; }
        textarea:focus, input:focus, select:focus { border-color: #a78bfa; box-shadow: 0 0 10px rgba(167, 139, 250, 0.3); }
        button { 
          background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border: none; 
          padding: 16px 30px; font-size: 17px; border-radius: 12px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 20px;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4); transition: 0.3s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(124, 58, 237, 0.6); }
        .btn-send { background: linear-gradient(135deg, #2563eb, #3b82f6); margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="glow-bg"></div>
      <div class="container">
        <div class="header">
          <div>
            <h1>🎮 لوحة تحكم Void Community</h1>
            ${userInfo}
          </div>
          <span class="badge">🟢 موثق ومتصل</span>
        </div>

        <div class="panel-box">
          <h2 style="margin-top:0; color:#c084fc;">📢 إرسال لوحة الألوان إلى ديسكورد</h2>
          <form action="/send-panel" method="POST">
            <label>اختر القناة المخصصة من السيرفر:</label>
            <select name="channel_id" required>
              ${channelOptionsHTML}
            </select>
            <button type="submit" class="btn-send">🚀 إرسال اللوحة للقناة المحددة</button>
          </form>
        </div>

        <form action="/save" method="POST">
          <h2 style="color:#c084fc; margin-bottom:20px;">🎨 تعديل أسعار وشروط الألوان (17 لون)</h2>
          ${Object.keys(basesData).map(key => `
            <div class="card">
              <h3 style="margin:0; color:#a78bfa;">${basesData[key].emoji}${basesData[key].name}</h3>
              <label>💰 المقابل المادي:</label>
              <textarea name="${key}_money" rows="2">${basesData[key].money}</textarea>
              <label>🎁 مقابل الأغراض:</label>
              <textarea name="${key}_items" rows="2">${basesData[key].items}</textarea>
            </div>
          `).join('')}
          <button type="submit">💾 حفظ كافة التعديلات</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// حفظ البيانات وإرسال اللوحة
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
  const channelId = req.body.channel_id;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.send('❌ لم يتم العثور على القناة!');

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
    res.send(`<h2 style="text-align:center; color:#4ade80; font-family:sans-serif; margin-top:50px;">✅ تم إرسال اللوحة للقناة: ${channel.name}<br><br><a href="/" style="color:#a78bfa;">العودة للوحة التحكم</a></h2>`);
  } catch (err) {
    res.send(`<h2 style="text-align:center; color:#ef4444; font-family:sans-serif; margin-top:50px;">❌ حدث خطأ أثناء الإرسال: ${err.message}<br><br><a href="/" style="color:#a78bfa;">العودة للوحة التحكم</a></h2>`);
  }
});

app.listen(port, () => console.log(`🌐 Dashboard Active on port ${port}`));

// ------------------- كود ديسكورد -------------------
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
        { label: 'أغراض داخل اللعبة', value: 'items', description: 'عرض الأغراض المحتدة مسبقاً لهذا اللون', emoji: '🎁' }
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
