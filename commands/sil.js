const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'sil',
  description: 'Belirtilen sayıda mesajı siler (100\'den fazla olamaz).',
  async execute(message, args) {
    // Kullanıcının gerekli izinlere sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    // Argümanlardan silinecek mesaj sayısını al
    const amount = parseInt(args[0]);

    // Girilen sayının geçerli bir sayı olup olmadığını kontrol et
    if (isNaN(amount)) {
      return message.reply('Lütfen geçerli bir sayı girin.');
    }

    // 100'den fazla bir sayı girilmişse uyarı ver
    if (amount > 100) {
      return message.reply('En fazla 100 mesaj silebilirsiniz.');
    }

    // 1 veya daha az bir sayı girilmişse uyarı ver
    if (amount < 1) {
      return message.reply('En az 1 mesaj silebilirsiniz.');
    }

    try {
      // Mesajları sil
      await message.channel.bulkDelete(amount, true);
      message.reply(`${amount} mesaj başarıyla silindi!`).then(msg => {
        setTimeout(() => msg.delete(), 5000); // Bilgilendirme mesajını 5 saniye sonra sil
      });
    } catch (error) {
      console.error('Mesajlar silinirken bir hata oluştu:', error);
      message.reply('Mesajlar silinirken bir hata oluştu. Lütfen yeterli izniniz olduğundan emin olun.');
    }
  },
};