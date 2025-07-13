const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kanal-kilitle',
  description: 'Kanalı kilitler veya tekrar açar.',
  async execute(message, args) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    // Hedef kanal (komutun gönderildiği kanal)
    const channel = message.channel;

    // Kanalın mevcut durumu (kilitli mi, değil mi?)
    const isLocked = channel.permissionOverwrites.cache.some((overwrite) =>
      overwrite.id === message.guild.roles.everyone.id &&
      overwrite.deny.has(PermissionsBitField.Flags.SendMessages)
    );

    try {
      if (isLocked) {
        // Eğer kanal kilitliyse, tekrar aç
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: true,
        });
        message.reply('🔓 Kanal kilidi kaldırıldı! Artık herkes mesaj gönderebilir.');
      } else {
        // Eğer kanal açık durumdaysa, kilitle
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: false,
        });
        message.reply('🔒 Kanal kilitlendi! Artık kimse mesaj gönderemez.');
      }
    } catch (error) {
      console.error('Kanal izinleri düzenlenirken bir hata oluştu:', error);
      message.reply('Kanalı kilitlerken bir hata oluştu. Lütfen yetkilerinizi kontrol edin.');
    }
  },
};