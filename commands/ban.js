const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Belirtilen kullanıcıyı sunucudan yasaklar.',
  async execute(message, args) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    // Etiketlenen kullanıcıyı al
    const user = message.mentions.members.first();

    if (!user) {
      return message.reply('Lütfen sunucudan yasaklamak için bir kullanıcıyı etiketleyin.');
    }

    if (!user.bannable) {
      return message.reply('Bu kullanıcıyı yasaklayamıyorum. Kullanıcının rolü benim rolümden yüksek olabilir veya yeterli iznim olmayabilir.');
    }

    const reason = args.slice(1).join(' ') || 'Belirtilmedi';

    try {
      // Kullanıcıyı sunucudan yasakla
      await user.ban({ reason });
      message.reply(`${user.user.tag} sunucudan yasaklandı. Sebep: ${reason}`);
    } catch (error) {
      console.error('Kullanıcı yasaklanırken bir hata oluştu:', error);
      message.reply('Kullanıcı yasaklanırken bir hata oluştu. Lütfen yetkilerinizi kontrol edin.');
    }
  },
};