module.exports = {
  name: 'untimeout',
  description: 'Bir kullanıcıyı timeout durumundan çıkarır.',
  async execute(message, args) {
    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    const user = message.mentions.members.first();
    if (!user) {
      return message.reply('Lütfen timeout kaldırılacak bir kullanıcı etiketleyin.');
    }

    try {
      await user.timeout(null);
      message.reply(`${user.user.tag} timeout durumundan çıkarıldı.`);
    } catch (error) {
      console.error('Timeout kaldırılırken bir hata oluştu:', error);
      message.reply('Timeout kaldırılırken bir hata oluştu.');
    }
  },
};