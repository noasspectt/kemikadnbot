const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'remove-role',
  description: 'Bir kullanıcıdan belirli bir rolü kaldırır.',
  async execute(message, args) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    // Sunucuda çalıştığından emin olun
    if (!message.guild) {
      return message.reply('Bu komut yalnızca bir sunucuda çalıştırılabilir.');
    }

    // Botun kendisine ait bilgileri al
    const botMember = message.guild.members.me;
    if (!botMember) {
      return message.reply('Botun sunucudaki rol bilgilerine erişilemiyor. Lütfen botun sunucuda olduğundan emin olun.');
    }

    // Etiketlenen kullanıcıyı ve rol adını al
    const user = message.mentions.members.first();
    const roleName = args.slice(1).join(' ');

    if (!user || !roleName) {
      return message.reply('Lütfen bir kullanıcıyı etiketleyin ve kaldırmak istediğiniz rolün adını girin.');
    }

    // Rolü bul
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      return message.reply('Belirttiğiniz rol bulunamadı.');
    }

    // Hiyerarşi kontrolü: Kaldırılmak istenen rol botun en yüksek rolünden yüksek mi?
    if (role.position >= botMember.roles.highest.position) {
      return message.reply(
        'Bu rol, botun rolünden daha yüksek olduğu için kaldırılamaz. Rol hiyerarşisini kontrol edin.'
      );
    }

    try {
      // Rolü kaldırmaya çalış
      await user.roles.remove(role);
      message.reply(`${user} kullanıcısından ${role.name} rolü başarıyla kaldırıldı.`);
    } catch (error) {
      console.error('Rol kaldırılırken bir hata oluştu:', error);
      message.reply('Rol kaldırılırken bir hata oluştu. Lütfen izinleri ve rol hiyerarşisini kontrol edin.');
    }
  },
};