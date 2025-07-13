// commands/odaoluştur.js
const { ChannelType, PermissionsBitField } = require('discord.js');

// Map<userId, channelId>
const activeVoiceRooms = new Map();

module.exports = {
  name: 'odaoluştur',
  description: 'Ses kanalındayken sana özel bir oda oluşturur ve çıkınca kapatır.',
  async execute(message, args) {
    const { guild, member, channel: textChannel } = message;
    const userId = member.id;

    // 1) Kullanıcı seste değilse hata ver
    //    (Önbellek tazeleme için fetch ekliyoruz)
    await guild.members.fetch(userId);
    const fresh = guild.members.cache.get(userId);
    if (!fresh.voice.channel) {
      return textChannel.send('❗ Lütfen önce bir ses kanalına katıl.');
    }

    // 2) Aynı kullanıcıda zaten oda varsa
    if (activeVoiceRooms.has(userId)) {
      return textChannel.send('❗ Zaten bir ses odan var.');
    }

    // 3) Ses kanalı oluştur (sadece kendisine izinli)
    const voiceChannel = await guild.channels.create({
      name: `${member.user.username}-odası`,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.Connect],
        },
        {
          id: userId,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.MoveMembers,
            PermissionsBitField.Flags.ManageChannels,
          ],
        },
      ],
    });

    // 4) Haritaya ekle ve kullanıcıyı taşı
    activeVoiceRooms.set(userId, voiceChannel.id);
    await textChannel.send(`✅ Odan oluşturuldu: **${voiceChannel.name}**. Seni oraya taşıyorum…`);
    try {
      await fresh.voice.setChannel(voiceChannel);
    } catch (err) {
      console.error('Odaya taşıma hatası:', err);
      return textChannel.send('⚠️ Seni odaya taşıyamadım.');
    }
  },

  // Başka dosyada import etmek için export ediyoruz
  activeVoiceRooms,
};