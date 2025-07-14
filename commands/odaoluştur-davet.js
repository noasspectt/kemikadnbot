const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const activeInviteRooms = new Map();

module.exports = {
  name: 'odaoluştur-davet',
  description: 'Özel bir oda oluşturur ve etiketlenen kişiyi davet eder.',
  async execute(message) {
    const guild = message.guild;
    const author = message.member;
    const target = message.mentions.members.first();

    if (!author.voice?.channel) {
      return message.reply('❗ Bu komutu kullanabilmek için bir sesli kanalda olmalısın.');
    }

    if (!target) {
      return message.reply('❗ Lütfen davet edeceğin kişiyi etiketle.');
    }

    if (activeInviteRooms.has(author.id)) {
      return message.reply('❗ Zaten bir aktif davet odan var.');
    }

    // Ses kanalı oluştur
    const voiceChannel = await guild.channels.create({
      name: `${author.user.username}-VIP`,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.Connect] },
        { id: author.id, allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.MoveMembers] },
        { id: target.id, deny: [PermissionsBitField.Flags.Connect] }, // Şimdilik engelli
      ],
    });

    activeInviteRooms.set(author.id, voiceChannel.id);
    await author.voice.setChannel(voiceChannel);
    message.channel.send(`✅ Özel odan oluşturuldu: **${voiceChannel.name}**`);

    // 🎯 Oda boşsa silme kontrolü
    const interval = setInterval(async () => {
      const kontrol = guild.channels.cache.get(voiceChannel.id);
      if (!kontrol) return clearInterval(interval);
      if (kontrol.members.size === 0) {
        await kontrol.delete().catch(() => {});
        activeInviteRooms.delete(author.id);
        message.channel.send(`🚪 Oda boşaldığı için silindi.`);
        clearInterval(interval);
      }
    }, 5000);

    // Davet butonu
    const acceptButton = new ButtonBuilder()
      .setCustomId('kabul')
      .setLabel('Katılmak istiyorum 🎧')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(acceptButton);

    const inviteMessage = await target.send({
      content: `${author.user.username} seni özel bir ses odasına davet ediyor. Kabul etmek için aşağıya tıkla.`,
      components: [row],
    }).catch(() => {
      message.channel.send('⚠️ Kullanıcıya mesaj gönderilemedi.');
    });

    const collector = inviteMessage?.createMessageComponentCollector({ time: 300000 });

    if (collector) {
      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'kabul') {
          if (!target.voice?.channel) {
            return interaction.reply({
              content: '❌ Daveti kabul etmek için önce herhangi bir ses kanalında olmalısın.',
              ephemeral: true,
            });
          }

          await voiceChannel.permissionOverwrites.edit(target.id, { Connect: true });
          await target.voice.setChannel(voiceChannel).catch(() => {});
          await interaction.reply({ content: '🎉 Odaya taşınıyorsun!', ephemeral: true });
          message.channel.send(`👥 ${target.user.username} odaya daveti kabul etti.`);
        }
      });

      collector.on('end', () => {
        inviteMessage.edit({ content: '⏳ Davet süresi sona erdi.', components: [] }).catch(() => {});
      });
    }
  },
};
