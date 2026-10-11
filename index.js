const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// قائمة القواعد والألوان
const baseNames = {
  silver: 'Silver Base',
  gold: 'Gold Base',
  crystal: 'Crystal Base',
  bloodmoon: 'BloodMoon Base',
  rainbow: 'Rainbow Base GoUp',
  candy: 'Candy Base GoUp',
  cyber: 'Cyber Base GoUp',
  party: 'Party Base GoUp',
  bw: 'Black & White Base GoUp',
  aqua: 'Aqua Base GoUp',
  lava: 'Lava Base GoUp',
  football: 'Football Base GoUp',
  summer: 'Summer Base GoUp',
  dreamy: 'Dreamy Base GoUp',
  galaxy: 'Galaxy Base',
  radioactive: 'Radioactive Base',
  halloween: 'Halloween Base'
};

client.once('ready', () => {
  console.log(`✅ البوت شغال بنجاح: ${client.user.tag}`);
});

// أمر !panel لإرسال قائمة الأزرار
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!panel') {
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_silver').setLabel('Silver Base').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_gold').setLabel('Gold Base').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_crystal').setLabel('Crystal Base').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_rainbow').setLabel('Rainbow Base').setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setTitle('🎫 تذاكر الحصول على ألوان ماب النطة')
      .setDescription('اضغط على الزر الخاص بالقاعدة المطلوبة أدناه لفتح تذكرة خاصة بك والحصول على اللون:')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row1] });
  }
});

// معالجة فتح التذاكر عند الضغط على الأزرار
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('ticket_')) {
    const baseKey = interaction.customId.replace('ticket_', '');
    const baseName = baseNames[baseKey] || 'Custom Base';

    const ch = await interaction.guild.channels.create({
      name: `ticket-${baseKey}-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'AttachFiles'] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎫 تذكرة لون: ${baseName}`)
      .setDescription(`مرحباً <@${interaction.user.id}>!\nلقد فتحت تذكرة للحصول على لون **${baseName}**.\nالرجاء إرسال إثباتك أو متطلباتك هنا للإدارة.`)
      .setColor('#57f287');

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('إغلاق التذكرة')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeBtn] });
    return interaction.reply({ content: `تم إنشاء تذكرتك بنجاح: ${ch}`, ephemeral: true });
  }

  if (interaction.customId === 'close_ticket') {
    await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
});

// استخدام البيئة لتمرير التوكن بأمان
client.login(process.env.DISCORD_TOKEN);
