module.exports = {
  name: 'settings',
  description: 'Bot ayarlarını değiştirir (reklamEngel, capslockEngel, kufurEngel).',
  async execute(message, args, settings, saveSettings) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    const settingName = args[0]?.toLowerCase();
    const settingValue = args[1]?.toLowerCase();

    if (!['reklamengel', 'capslockengel', 'kufurengel'].includes(settingName)) {
      return message.reply('Geçerli bir ayar ismi belirtin: reklamEngel, capslockEngel, kufurEngel.');
    }

    if (!['aç', 'kapat'].includes(settingValue)) {
      return message.reply('Geçerli bir değer belirtin: aç veya kapat.');
    }

    const isEnabled = settingValue === 'aç';
    settings[settingName] = isEnabled;
    saveSettings(settings);

    message.reply(`\`${settingName}\` ayarı başarıyla \`${settingValue}\` olarak güncellendi.`);
  },
};