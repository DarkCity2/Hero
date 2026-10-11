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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// قاعدة البيانات الخاصة بالألوان والمبالغ
let basesData = {
  silver: {
    name: 'Silver Base',
    money: 'اذا ناقصك 15 وتحت المبلغ ( 20 ريال ) اذا فوق 15 ( 40 ريال )',
    items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)'
  },
  gold: {
    name: 'Gold Base',
    money: 'اذا ناقصك 15 وتحت المبلغ ( 20 ريال ) اذا فوق 15 ( 40 ريال )',
    items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)'
  },
  crystal: {
    name: 'Crystal Base',
    money: 'اذا ناقصك 15 وتحت المبلغ ( 25 ريال ) اذا فوق 15 ( 50 ريال )',
    items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)'
  },
  bloodmoon: {
    name: 'BloodMoon Base',
    money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )',
    items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)'
  },
  rainbow: {
    name: 'Rainbow Base GoUp',
    money: 'اذا ناقصك 15 وتحت المبلغ ( 30 ريال ) اذا فوق 15 ( 60 ريال )',
    items: '(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)'
  }
};

// 🖥️ رابط لوحة التحكم (Dashboard)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Void Community - Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #0f172a; color: #fff; padding: 20px; }
        .card { background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
        h1 { color: #38bdf8; text-align: center; }
        label { font-weight: bold; display: block; margin-top: 10px; }
        textarea, input { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; margin-top: 5px; }
        button { background: #22c55e; color: #fff; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; margin-top: 20px; width: 100%; }
        button:hover { background: #16a34a; }
      </style>
    </head>
    <body>
      <h1>🎮 Void Community | لوحة تحكم ألوان ماب النطة</h1>
      <form action="/save" method="POST">
        ${Object.keys(basesData).map(key => `
          <div class="card">
            <h3>🎨 ${basesData[key].name}</h3>
            <label>💰 المقابل المادي:</label>
            <textarea name="${key}_money" rows="2">${basesData[key].money}</textarea>
            <label>🎁 مقابل الأغراض:</label>
            <textarea name="${key}_items" rows="2">${basesData[key].items}</textarea>
          </div>
        `).join('')}
        <button type="submit">💾 حفظ كافة التعديلات</button>
      </form>
    </body>
    </html>
  `);
});

// حفظ البيانات من لوحة التحكم
app.post('/save', (req, res) => {
  Object.keys(basesData).forEach(key => {
    if (req.body[`${key}_money`]) basesData[key].money = req.body[`${key}_money`];
    if (req.body[`${key}_items`]) basesData[key].items = req.body[`${key}_items`];
  });
  res.send('<h1 style="text-align:center; margin-top:50px; font-family:sans-serif;">✅ تم حفظ الأسعار والشروط بنجاح! <br><br><a href="/">العودة للوحة التحكم</a></h1>');
});

app.listen(port, () => console.log(`🌐 Dashboard active on port ${port}`));

// ------------------- كود ديسكورد -------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const userSessions = new Map();

const baseSelectOptions = [
  { label: 'Silver Base', value: 'silver', description: 'تقديم طلب لون Silver Base', emoji: '⚪' },
  { label: 'Gold Base', value: 'gold', description: 'تقديم طلب لون Gold Base', emoji: '🟡' },
  { label: 'Crystal Base', value: 'crystal', description: 'تقديم طلب لون Crystal Base', emoji: '💎' },
  { label: 'BloodMoon Base', value: 'bloodmoon', description: 'تقديم طلب لون BloodMoon Base', emoji: '🌑' },
  { label: 'Rainbow Base GoUp', value: 'rainbow', description: 'تقديم طلب لون Rainbow Base GoUp', emoji: '🌈' }
];

client.once('ready', () => {
  console.log(`✅ [Void Community] البوت يعمل بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!panel') {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_base_color')
      .setPlaceholder('اختر لون القاعدة المطلوبة...')
      .addOptions(baseSelectOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 Void Community | نظام ألوان ماب النطة')
      .setDescription('اختر القاعدة التي تريد طلبها من القائمة المنسدلة أدناه لتقديم بيانتك ونوع المقابل:')
      .setColor('#2b2d31')
      .setFooter({ text: 'Void Community System' });

    await message.channel.send({ embeds: [embed], components: [row] });
  }
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

client.login(process.env.DISCORD_TOKEN);
