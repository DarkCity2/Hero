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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// قائمة كافة قواعد الألوان الخاصة بماب النطة
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
  console.log(`✅ بوت ماب النطة جاهز ويعمل باسم: ${client.user.tag}`);
});

// أوامر الأدمن والمشرفين
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 1. أمر لوحة تذاكر الألوان (!panel)
  if (message.content === '!panel') {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_base_ticket')
      .setPlaceholder('اختر القاعدة للحصول على اللون...')
      .addOptions(bases);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 لوحة تذاكر ألوان القواعد (Parkour Bases)')
      .setDescription('اختر القاعدة التي حققتها من القائمة المنسدلة أدناه لفتح تذكرة وإرسال الإثبات للإدارة:')
      .setColor('#2b2d31')
      .setFooter({ text: 'Parkour Map Color System' });

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
      .setTitle('🛡️ التوثيق والدخول للسيرفر')
      .setDescription('اضغط على الزر أدناه للتحقق والحصول على رتبة الأعضاء والوصول لكافة الرومات.')
      .setColor('#57f287');

    await message.channel.send({ embeds: [embed], components: [verifyBtn] });
  }
});

// معالجة الضغط على التفاعلات
client.on('interactionCreate', async interaction => {
  // أ) نظام التوثيق الضغطة الواحدة
  if (interaction.isButton() && interaction.customId === 'verify_member') {
    return interaction.reply({ content: 'تم توثيق حسابك بنجاح! استمتع باللعب 🎮', ephemeral: true });
  }

  // ب) نظام فتح التذكرة عبر القائمة المنسدلة
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_base_ticket') {
    const selectedValue = interaction.values[0];
    const selectedBase = bases.find(b => b.value === selectedValue);

    // إنشاء قناة التذكرة
    const ch = await interaction.guild.channels.create({
      name: `ticket-${selectedValue}-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎫 تذكرة لون: ${selectedBase.label}`)
      .setDescription(`مرحباً <@${interaction.user.id}>!\nفتح التذكرة خاص بـ **${selectedBase.label}**.\n\n📸 **الرجاء إرفاق صورة/فيديو لإثبات وصورك للقاعدة وسيتم تسليمك اللون قريباً.**`)
      .setColor('#f1c40f');

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('إغلاق التذكرة')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeBtn] });
    return interaction.reply({ content: `تم فتح تذكرتك بنجاح في الروم: ${ch}`, ephemeral: true });
  }

  // ج) زر إغلاق التذكرة
  if (interaction.isButton() && interaction.customId === 'close_ticket') {
    await interaction.reply('سيتم إغلاق وتنظيف التذكرة خلال 5 ثوانٍ...');
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
});

client.login(process.env.DISCORD_TOKEN);
