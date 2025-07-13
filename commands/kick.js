const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Belirtilen kullanıcıyı sunucudan atar.',
  async execute(message, args) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    // Etiketlenen kullanıcıyı al
    const user = message.mentions.members.first();

    if (!user) {
      return message.reply('Lütfen sunucudan atmak istediğiniz kullanıcıyı etiketleyin.');
    }

    if (!user.kickable) {
      return message.reply('Bu kullanıcıyı sunucudan atamıyorum. Kullanıcının rolü benim rolümden yüksek olabilir veya yeterli iznim olmayabilir.');
    }

    const reason = args.slice(1).join(' ') || 'Belirtilmedi';

    try {
      // Kullanıcıyı sunucudan at
      await user.kick(reason);
      message.reply(`${user.user.tag} sunucudan atıldı. Sebep: ${reason}`);
    } catch (error) {
      console.error('Kullanıcı atılırken bir hata oluştu:', error);
      message.reply('Kullanıcıyı atarken bir hata oluştu. Lütfen izninizin yeterli olduğundan emin olun.');
    }
  },
};