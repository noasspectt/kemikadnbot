const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'reklam-engel',
  description: 'Reklam engelleme sistemini açar veya kapatır.',
  async execute(message, args, settings, saveSettings) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    const settingValue = args[0]?.toLowerCase();

    if (!['aç', 'kapat'].includes(settingValue)) {
      return message.reply('Geçerli bir değer belirtin: aç veya kapat.');
    }

    const isEnabled = settingValue === 'aç';
    settings.reklamengel = isEnabled;
    saveSettings(settings);

    message.reply(`Reklam engelleme sistemi başarıyla \`${settingValue}\` olarak ayarlandı.`);
  },
};