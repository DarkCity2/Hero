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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد الجلسات لحفظ تسجيل الدخول
app.use(session({
  secret: 'void_community_secret_key_2026',
  resave: false,
  saveUninitialized: true
}));

const port = process.env.PORT || 3000;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'void123'; // كلمة المرور للوحة

// ------------------- قاعدة بيانات القواعد الـ 17 -------------------
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

// ------------------- خادم الويب ولوحة التحكم -------------------
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void Control - تسجيل الدخول</title>
      <style>
        body { background: #0b0f19; color: #fff; font-family: 'Segoe UI', Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-card { background: #151c2c; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 320px; text-align: center; border: 1px solid #1e293b; }
        h2 { color: #38bdf8; margin-bottom: 24px; font-size: 22px; }
        input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; margin-bottom: 20px; box-sizing: border-box; text-align: center; font-size: 16px; }
        button { background: #3b82f6; color: #fff; border: none; padding: 12px; border-radius: 8px; width: 100%; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        button:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h2>🔒 Void Community Control</h2>
        <form action="/login" method="POST">
          <input type="password" name="password" placeholder="أدخل كلمة المرور" required>
          <button type="submit">دخول اللوحة</button>
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
    res.send('<h2 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">❌ كلمة المرور خاطئة! <a href="/login">إعادة المحاولة</a></h2>');
  }
});

// الصفحة الرئيسية للوحة التحكم
app.get('/', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void Community - Dashboard</title>
      <style>
        body { background: #0b0f19; color: #f8fafc; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; margin: 0; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; background: #151c2c; padding: 20px 30px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #1e293b; }
        h1 { margin: 0; color: #38bdf8; font-size: 24px; }
        .stats { display: flex; gap: 15px; margin-bottom: 25px; }
        .stat-card { flex: 1; background: #151c2c; padding: 18px; border-radius: 12px; border: 1px solid #1e293b; text-align: center; }
        .stat-card h3 { margin: 0; color: #94a3b8; font-size: 14px; }
        .stat-card p { margin: 8px 0 0 0; font-size: 20px; font-weight: bold; color: #38bdf8; }
        .panel-box { background: #151c2c; padding: 25px; border-radius: 16px; border: 1px solid #1e293b; margin-bottom: 30px; }
        .card { background: #0f172a; padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #1e293b; }
        label { font-weight: bold; display: block; margin-top: 10px; color: #cbd5e1; }
        textarea, input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #151c2c; color: #fff; margin-top: 5px; box-sizing: border-box; }
        button { background: #22c55e; color: #fff; border: none; padding: 14px 28px; font-size: 16px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 20px; }
        button:hover { background: #16a34a; }
        .btn-send { background: #3b82f6; width: auto; margin-top: 10px; }
        .btn-send:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 Void Community Control Center</h1>
          <span style="color:#22c55e; font-weight:bold;">🟢 البوت متصل</span>
        </div>

        <div class="stats">
          <div class="stat-card"><h3>إجمالي القواعد</h3><p>17 قاعدة</p></div>
          <div class="stat-card"><h3>حالة السيرفر</h3><p>Live 🟢</p></div>
          <div class="stat-card"><h3>نظام الحماية</h3><p>مفعل 🔒</p></div>
        </div>

        <!-- 📢 قسم إرسال لوحة التذاكر لأي روم -->
        <div class="panel-box">
          <h2 style="margin-top:0; color:#38bdf8;">📢 إرسال لوحة الألوان إلى ديسكورد</h2>
          <form action="/send-panel" method="POST">
            <label>ضع ايدي القناة (Channel ID):</label>

            <input type="text" name="channel_id" placeholder="مثال: 123456789012345678" required>
            <button type="submit" class="btn-send">إرسال اللوحة للقناة الآن 🚀</button>
          </form>
        </div>

        <!-- 🎨 تعديل أسعار وشروط القواعد -->
        <form action="/save" method="POST">
          <h2 style="color:#38bdf8; margin-bottom:15px;">🎨 تعديل أسعار وشروط الألوان</h2>
          ${Object.keys(basesData).map(key => `
            <div class="card">
              <h3 style="margin:0; color:#f8fafc;">${basesData[key].emoji}${basesData[key].name}</h3>
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

// حفظ البيانات
app.post('/save', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  Object.keys(basesData).forEach(key => {
    if (req.body[`${key}_money`]) basesData[key].money = req.body[`${key}_money`];
    if (req.body[`${key}_items`]) basesData[key].items = req.body[`${key}_items`];
  });
  res.send('<h2 style="text-align:center; color:#22c55e; font-family:sans-serif; margin-top:50px;">✅ تم حفظ الأسعار والشروط بنجاح!<br><br><a href="/" style="color:#38bdf8;">العودة للوحة التحكم</a></h2>');
});

// إرسال اللوحة مباشرة إلى روم محدد من اللوحة
app.post('/send-panel', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');
  const channelId = req.body.channel_id;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.send('❌ لم يتم العثور على القناة! التأكد من الايدي.');

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
    res.send(`<h2 style="text-align:center; color:#22c55e; font-family:sans-serif; margin-top:50px;">✅ تم إرسال لوحة الألوان بنجاح إلى القناة: ${channel.name}<br><br><a href="/" style="color:#38bdf8;">العودة للوحة التحكم</a></h2>`);
  } catch (err) {
    res.send(`<h2 style="text-align:center; color:red; font-family:sans-serif; margin-top:50px;">❌ حدث خطأ أثناء الإرسال: ${err.message}<br><br><a href="/" style="color:#38bdf8;">العودة للوحة التحكم</a></h2>`);
  }
});

app.listen(port, () => console.log(`🌐 Dashboard Online on port ${port}`));

// ------------------- كود ديسكورد الأساسي -------------------
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

// التعامل مع جميع التفاعلات (القوائم والنماذج والأزرار)
client.on('interactionCreate', async interaction => {
  // 1. اختيار قاعدة -> نموذج الضمان والنواقص
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

  // 2. إرسال النموذج -> اختيار نوع المقابل
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

  // 3. عرض شروط المقابل وأزرار القبول/الرفض
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

  // 4. أزرار القبول والرفض والتذاكر
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

client.login(process.env.DISCORD_TOKEN);
