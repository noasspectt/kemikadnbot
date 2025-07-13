const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'slowmode',
  description: 'Bir kanalda yavaş mod ayarlar.',
  async execute(message, args) {
     // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
     if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    const duration = parseInt(args[0], 10);

    if (isNaN(duration) || duration < 0) {
      return message.reply('Lütfen geçerli bir süre (saniye) girin.');
    }

    try {
      await message.channel.setRateLimitPerUser(duration);
      message.reply(`Yavaş mod süresi başarıyla ${duration} saniye olarak ayarlandı.`);
    } catch (error) {
      console.error('Yavaş mod ayarlanırken bir hata oluştu:', error);
      message.reply('Yavaş mod ayarlanırken bir hata oluştu.');
    }
  },
};