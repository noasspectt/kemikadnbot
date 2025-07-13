module.exports = {
  name: 'unban',
  description: 'Bir kullanıcının yasağını kaldırır.',
  async execute(message, args) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('Lütfen yasağı kaldırılacak kullanıcının ID\'sini girin.');
    }

    try {
      await message.guild.members.unban(userId);
      message.reply(`Kullanıcı başarıyla yasağı kaldırıldı. ID: ${userId}`);
    } catch (error) {
      console.error('Yasak kaldırılırken bir hata oluştu:', error);
      message.reply('Yasak kaldırılırken bir hata oluştu.');
    }
  },
};