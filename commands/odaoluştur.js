const { ChannelType, PermissionsBitField } = require('discord.js');

const activeVoiceRooms = new Map();

module.exports = {
  name: 'odaoluştur',
  description: 'Geçici bir ses kanalı oluşturur.',
  async execute(message, args) {
    if (!message.member.voice.channel) {
      return message.reply('Sesli bir kanalda olmalısın!');
    }

    const channelName = args.join(' ') || `${message.author.username} Odası`;

    const channel = await message.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: message.guild.id,
          allow: [PermissionsBitField.Flags.Connect],
        },
        {
          id: message.author.id,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.Speak,
          ],
        },
      ],
    });

    await message.reply(`✅ Odan oluşturuldu: ${channel.name}`);

    // Kullanıcıyı yeni odaya taşı
    if (message.member.voice.channel) {
      await message.member.voice.setChannel(channel);
    }

    activeVoiceRooms.set(message.author.id, channel.id);
  },
  activeVoiceRooms,
};
