const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'forceban',
  description: 'Bir kullanıcıyı sunucuda bulunmasa bile banlar.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('Lütfen banlamak istediğiniz kullanıcının ID\'sini belirtin. Örneğin: `!forceban <Kullanıcı-ID>`');
    }

    try {
      await message.guild.members.ban(userId, { reason: 'Forceban komutuyla yasaklandı.' });
      message.reply(`Kullanıcı başarıyla banlandı: ${userId}`);
    } catch (error) {
      console.error('Forceban komutu sırasında bir hata oluştu:', error);
      message.reply('Kullanıcı banlanırken bir hata oluştu. Lütfen doğru bir kullanıcı ID\'si girdiğinizden emin olun ve botun yetkilerini kontrol edin.');
    }
  },
};