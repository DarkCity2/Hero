const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder, 
  ChannelType, 
  PermissionFlagsBits 
} = require('discord.js');
const express = require('express');

// 1. تشغيل سيرفر خفيف لإنهاء التعليق في Render فوراً
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Void Community Parkour Bot is Live!');
});

app.listen(port, () => {
  console.log(`🌐 Web server running on port ${port}`);
});

// 2. إعداد بوت الديسكورد
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// قائمة القواعد والألوان المخصصة لماب النطة
const bases = [
  { label: 'Silver Base', value: 'silver', description: 'فتح تذكرة للحصول على لون Silver Base', emoji: '⚪' },
  { label: 'Gold Base', value: 'gold', description: 'فتح تذكرة للحصول على لون Gold Base', emoji: '🟡' },
  { label: 'Crystal Base', value: 'crystal', description: 'فتح تذكرة للحصول على لون Crystal Base', emoji: '💎' },
  { label: 'BloodMoon Base', value: 'bloodmoon', description: 'فتح تذكرة للحصول على لون BloodMoon Base', emoji: '🌑' },
  { label: 'Rainbow Base GoUp', value: 'rainbow', description: 'فتح تذكرة للحصول على لون Rainbow Base', emoji: '🌈' },
  { label: 'Candy Base GoUp', value: 'candy', description: 'فتح تذكرة للحصول على لون Candy Base', emoji: '🍬' },
  { label: 'Cyber Base GoUp', value: 'cyber', description: 'فتح تذكرة للحصول على لون Cyber Base', emoji: '🤖' },
  { label: 'Party Base GoUp', value: 'party', description: 'فتح تذكرة للحصول على لون Party Base', emoji: '🎉' },
  { label: 'Black & White Base GoUp', value: 'bw', description: 'فتح تذكرة للحصول على لون Black & White Base', emoji: '⬛' },
  { label: 'Aqua Base GoUp', value: 'aqua', description: 'فتح تذكرة للحصول على لون Aqua Base', emoji: '💧' },
  { label: 'Lava Base GoUp', value: 'lava', description: 'فتح تذكرة للحصول على لون Lava Base', emoji: '🌋' },
  { label: 'Football Base GoUp', value: 'football', description: 'فتح تذكرة للحصول على لون Football Base', emoji: '⚽' },
  { label: 'Summer Base GoUp', value: 'summer', description: 'فتح تذكرة للحصول على لون Summer Base', emoji: '☀️' },
  { label: 'Dreamy Base GoUp', value: 'dreamy', description: 'فتح تذكرة للحصول على لون Dreamy Base', emoji: '☁️' },
  { label: 'Galaxy Base', value: 'galaxy', description: 'فتح تذكرة للحصول على لون Galaxy Base', emoji: '🌌' },
  { label: 'Radioactive Base', value: 'radioactive', description: 'فتح تذكرة للحصول على لون Radioactive Base', emoji: '☢️' },
  { label: 'Halloween Base', value: 'halloween', description: 'فتح تذكرة للحصول على لون Halloween Base', emoji: '🎃' }
];

client.once('ready', () => {
  console.log(`✅ [Void Community] البوت يعمل بنجاح باسم: ${client.user.tag}`);
});

// الأوامر النصية
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 1. أمر لوحة تذاكر ألوان القواعد (!panel)
  if (message.content === '!panel') {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_base_ticket')
      .setPlaceholder('اختر القاعدة للحصول على اللون...')
      .addOptions(bases);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 Void Community | نظام ألوان ماب النطة')
      .setDescription('مرحباً بك في سيرفر **Void Community**!\nاختر القاعدة التي حققتها من القائمة المنسدلة أدناه لفتح تذكرة وإرسال إثباتك للإدارة:')
      .setColor('#2b2d31')
      .setFooter({ text: 'Void Community - Parkour Map' });

    await message.channel.send({ embeds: [embed], components: [row] });
  }

  // 2. أمر لوحة التوثيق الفوري (!verify-panel)
  if (message.content === '!verify-panel') {
    const verifyBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_member')
        .setLabel('تأكيد الدخول / Verify')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)
    );

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Void Community | التوثيق والدخول')
      .setDescription('اضغط على الزر أدناه للتحقق والحصول على رتبة الأعضاء والوصول لكافة الرومات.')
      .setColor('#57f287')
      .setFooter({ text: 'Void Community Security' });

    await message.channel.send({ embeds: [embed], components: [verifyBtn] });
  }
});

// التعامل مع التفاعلات والضغطات
client.on('interactionCreate', async interaction => {
  // أ) نظام التوثيق
  if (interaction.isButton() && interaction.customId === 'verify_member') {
    return interaction.reply({ content: 'مرحباً بك في **Void Community**! تم توثيق حسابك بنجاح 🎉', ephemeral: true });
  }

  // ب) فتح التذاكر عند اختيار قاعدة من القائمة
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_base_ticket') {
    const selectedValue = interaction.values[0];
    const selectedBase = bases.find(b => b.value === selectedValue);

    const ch = await interaction.guild.channels.create({
      name: `ticket-${selectedValue}-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Void Community | تذكرة لون: ${selectedBase.label}`)
      .setDescription(`مرحباً <@${interaction.user.id}>!\nلقد فتحت تذكرة خاصة بـ **${selectedBase.label}**.\n\n📸 **الرجاء إرفاق صورة/فيديو لإثبات وصورك للقاعدة وسيتم تسليمك اللون من قبل إدارة Void Community.**`)
      .setColor('#f1c40f');

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('إغلاق التذكرة')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeBtn] });
    return interaction.reply({ content: `تم فتح تذكرتك بنجاح في القناة: ${ch}`, ephemeral: true });
  }

  // ج) إغلاق التذكرة
  if (interaction.isButton() && interaction.customId === 'close_ticket') {
    await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
});

client.login(process.env.DISCORD_TOKEN);
