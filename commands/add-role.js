const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'add-role',
  description: 'Bir kullanıcıya rol ekler.',
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
      return message.reply('Lütfen bir kullanıcıyı etiketleyin ve rol adını girin.');
    }

    // Rolü bul
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      return message.reply('Belirttiğiniz rol bulunamadı.');
    }

    // Hiyerarşi kontrolü: Eklenmek istenen rol, botun en yüksek rolünden yüksek mi?
    if (role.position >= botMember.roles.highest.position) {
      return message.reply(
        'Bu rol, botun rolünden daha yüksek olduğu için eklenemez. Rol hiyerarşisini kontrol edin.'
      );
    }

    try {
      // Rolü eklemeye çalış
      await user.roles.add(role);
      message.reply(`${user} kullanıcısına ${role.name} rolü başarıyla verildi.`);
    } catch (error) {
      console.error('Rol eklenirken bir hata oluştu:', error);
      message.reply('Rol eklenirken bir hata oluştu. Lütfen izinleri ve rol hiyerarşisini kontrol edin.');
    }
  },
};