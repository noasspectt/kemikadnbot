const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'timeout',
  description: 'Bir kullanıcıyı belirli bir süre boyunca susturur.',
  async execute(message, args) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    // Kullanıcıyı etiketle ve süreyi al
    const user = message.mentions.members.first();
    const duration = parseInt(args[1]);

    if (!user || isNaN(duration)) {
      return message.reply('Lütfen bir kullanıcıyı etiketleyin ve geçerli bir süre girin.');
    }

    try {
      // Kullanıcıyı sustur
      await user.timeout(duration * 1000, 'Susturma nedeni belirtilmedi.');
      message.reply(`${user} kullanıcısı ${duration} saniye boyunca susturuldu.`);
    } catch (error) {
      console.error('Kullanıcı susturulurken bir hata oluştu:', error);
      message.reply('Kullanıcı susturulurken bir hata oluştu. Lütfen yetkilerinizi kontrol edin.');
    }
  },
};