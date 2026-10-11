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

// 1. تشغيل سيرفر الويب لخدمة Render المجانية
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Void Community System is Online!'));
app.listen(port, () => console.log(`🌐 Server active on port ${port}`));

// 2. إعداد البوت
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// تخزين بيانات طلبات المستخدمين المؤقتة
const userRequests = new Map();

// قائمة القواعد والألوان
const bases = [
  { label: 'Silver Base', value: 'silver', description: 'تقديم طلب لون Silver Base', emoji: '⚪' },
  { label: 'Gold Base', value: 'gold', description: 'تقديم طلب لون Gold Base', emoji: '🟡' },
  { label: 'Crystal Base', value: 'crystal', description: 'تقديم طلب لون Crystal Base', emoji: '💎' },
  { label: 'BloodMoon Base', value: 'bloodmoon', description: 'تقديم طلب لون BloodMoon Base', emoji: '🌑' },
  { label: 'Rainbow Base GoUp', value: 'rainbow', description: 'تقديم طلب لون Rainbow Base GoUp', emoji: '🌈' },
  { label: 'Candy Base GoUp', value: 'candy', description: 'تقديم طلب لون Candy Base GoUp', emoji: '🍬' },
  { label: 'Cyber Base GoUp', value: 'cyber', description: 'تقديم طلب لون Cyber Base GoUp', emoji: '🤖' },
  { label: 'Party Base GoUp', value: 'party', description: 'تقديم طلب لون Party Base GoUp', emoji: '🎉' },
  { label: 'Black & White Base GoUp', value: 'bw', description: 'تقديم طلب لون Black & White Base GoUp', emoji: '⬛' },
  { label: 'Aqua Base GoUp', value: 'aqua', description: 'تقديم طلب لون Aqua Base GoUp', emoji: '💧' },
  { label: 'Lava Base GoUp', value: 'lava', description: 'تقديم طلب لون Lava Base GoUp', emoji: '🌋' },
  { label: 'Football Base GoUp', value: 'football', description: 'تقديم طلب لون Football Base GoUp', emoji: '⚽' },
  { label: 'Summer Base GoUp', value: 'summer', description: 'تقديم طلب لون Summer Base GoUp', emoji: '☀️' },
  { label: 'Dreamy Base GoUp', value: 'dreamy', description: 'تقديم طلب لون Dreamy Base GoUp', emoji: '☁️' },
  { label: 'Galaxy Base', value: 'galaxy', description: 'تقديم طلب لون Galaxy Base', emoji: '🌌' },
  { label: 'Radioactive Base', value: 'radioactive', description: 'تقديم طلب لون Radioactive Base', emoji: '☢️' },
  { label: 'Halloween Base', value: 'halloween', description: 'تقديم طلب لون Halloween Base', emoji: '🎃' }
];

client.once('ready', () => {
  console.log(`✅ [Void Community] البوت يعمل بنجاح باسم: ${client.user.tag}`);
});

// أمر إرسال لوحة الألوان
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!panel') {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_base_color')
      .setPlaceholder('اختر لون القاعدة المطلوبة...')
      .addOptions(bases);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 Void Community | نظام طلبات ألوان القواعد')
      .setDescription('اختر القاعدة التي تريد طلبها من القائمة المنسدلة أدناه لتقديم بيانتك ونوع المقابل:')
      .setColor('#2b2d31')
      .setFooter({ text: 'Void Community System' });

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// التعامل مع جميع التفاعلات (النماذج، القوائم، الأزرار)
client.on('interactionCreate', async interaction => {

  // Step 1: اختيار القاعدة من القائمة -> فتح النموذج (Modal)
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_base_color') {
    const selectedValue = interaction.values[0];
    const selectedBase = bases.find(b => b.value === selectedValue);

    const modal = new ModalBuilder()
      .setCustomId(`modal_guarantee_${selectedValue}`)
      .setTitle(`${selectedBase.label} بيانات ضمان`);

    const guaranteeInput = new TextInputBuilder()
      .setCustomId('guarantee_value')
      .setLabel('اكتب الضمان حقك')
      .setPlaceholder('اكتب الضمان')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const missingInput = new TextInputBuilder()
      .setCustomId('missing_count')
      .setLabel('اكتب عدد نواقصك')
      .setPlaceholder('مثال: 2')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(guaranteeInput),
      new ActionRowBuilder().addComponents(missingInput)
    );

    await interaction.showModal(modal);
  }

  // Step 2: استقبال بيانات النموذج -> عرض اختيار نوع المقابل
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_guarantee_')) {
    const baseKey = interaction.customId.replace('modal_guarantee_', '');
    const selectedBase = bases.find(b => b.value === baseKey);

    const guarantee = interaction.fields.getTextInputValue('guarantee_value');
    const missing = interaction.fields.getTextInputValue('missing_count');

    // حفظ البيانات مؤقتاً للمستخدم
    userRequests.set(interaction.user.id, {
      base: selectedBase.label,
      baseKey: baseKey,
      guarantee: guarantee,
      missing: missing
    });

    const paymentMenu = new StringSelectMenuBuilder()
      .setCustomId('select_payment_type')
      .setPlaceholder('اختر نوع المقابل')
      .addOptions([
        { label: 'مقابل مادي', value: 'money', description: 'عرض المقابل المادي المحدد لهذا اللون', emoji: '💰' },
        { label: 'أغراض داخل اللعبة', value: 'in_game', description: 'عرض الأغراض المحتدة مسبقاً لهذا اللون', emoji: '🎁' }
      ]);

    const row = new ActionRowBuilder().addComponents(paymentMenu);

    await interaction.reply({
      content: `✅ **تم حفظ الضمان وعدد النواقص.**\n\n🎨 **الآن اختر نوع المقابل للحصول على ${selectedBase.label}:**`,
      components: [row],
      ephemeral: true
    });
  }

  // Step 3: اختيار نوع المقابل -> عرض ملخص الطلب مع أزرار القبول والرفض
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_payment_type') {
    const paymentType = interaction.values[0];
    const userData = userRequests.get(interaction.user.id);

    if (!userData) {
      return interaction.reply({ content: '❌ حدث خطأ، يرجى إعادة محاولة التقديم من البداية.', ephemeral: true });
    }

    userData.paymentType = paymentType === 'money' ? 'مقابل مادي 💰' : 'أغراض داخل اللعبة 🎁';

    const confirmBtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_request')
        .setLabel('قبول')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('reject_request')
        .setLabel('رفض')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    const summaryText = `🎁 **مقابل الأغراض للون ${userData.base}:**\n(١٠ وتحت وتحت كروماندو كاندي وفوق باستثناء البارتي، ١٠٠ وفوق دب كاندي وفوق باستثناء البارتي)\n\n:ضمانك **${userData.guarantee}**\n:عدد نواقصك **${userData.missing}**\n\n**هل توافق على هذا المقابل؟**`;

    await interaction.update({
      content: summaryText,
      components: [confirmBtns]
    });
  }

  // Step 4: التعامل مع زري القبول والرفض
  if (interaction.isButton()) {
    if (interaction.customId === 'accept_request') {
      const userData = userRequests.get(interaction.user.id);

      // إنشاء روم التذكرة للإدارة
      const ch = await interaction.guild.channels.create({
        name: `ticket-${userData ? userData.baseKey : 'base'}-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Void Community | طلب لون ${userData ? userData.base : ''}`)
        .addFields(
          { name: '👤 صاحب الطلب', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🛡️ الضمان', value: userData ? userData.guarantee : 'غير محدد', inline: true },
          { name: '🔢 عدد النواقص', value: userData ? userData.missing : 'غير محدد', inline: true },
          { name: '💳 نوع المقابل', value: userData ? userData.paymentType : 'غير محدد', inline: false }
        )
        .setColor('#57f287')
        .setFooter({ text: 'Void Community System' });

      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('إغلاق التذكرة')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)
      );

      await ch.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeBtn] });

      await interaction.update({
        content: `🎉 **تم قبولك للطلب بنجاح!**\nتم فتح التذكرة الخاصة بك هنا: ${ch}`,
        components: []
      });
    }

    if (interaction.customId === 'reject_request') {
      await interaction.update({
        content: '❌ **تم إلغاء الطلب.** يمكنك التقديم مجدداً في أي وقت.',
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
