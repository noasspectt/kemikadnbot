const fs = require('fs');
const path = './settings.json';

module.exports = (client) => {
  client.on('messageCreate', (message) => {
    // Bot mesajlarını ve DM mesajlarını yok say
    if (message.author.bot || !message.guild) return;

    // Ayarları dosyadan yükle
    let settings;
    try {
      if (fs.existsSync(path)) {
        settings = JSON.parse(fs.readFileSync(path, 'utf8')) || {};
      } else {
        settings = {};
      }
    } catch (err) {
      console.error('Ayarlar dosyası okunurken bir hata oluştu:', err);
      return;
    }

    const guildSettings = settings[message.guild.id] || {};

    // Küfür engelleme
    if (guildSettings.kufurEngel && /küfür|örnek/i.test(message.content)) {
      message.delete().catch(() => {});
      message.channel.send(`${message.author}, küfür etmek yasaktır!`);
    }

    // Reklam engelleme
    if (guildSettings.reklamEngel && /(http:\/\/|https:\/\/|www\.)/i.test(message.content)) {
      message.delete().catch(() => {});
      message.channel.send(`${message.author}, reklam yapmak yasaktır!`);
    }

    // Capslock engelleme
    if (guildSettings.capslockEngel) {
      const capsRate = (message.content.replace(/[^A-Z]/g, '').length / message.content.length) * 100;
      if (capsRate > 50) {
        message.delete().catch(() => {});
        message.channel.send(`${message.author}, lütfen fazla büyük harf kullanmayın!`);
      }
    }
  });
};