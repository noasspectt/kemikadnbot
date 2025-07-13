module.exports = {
  name: 'istatistik',
  description: 'Botun istatistiklerini gösterir.',
  async execute(message) {
    const uptime = process.uptime();
    const uptimeMinutes = Math.floor(uptime / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    const stats = `
**Bot İstatistikleri**
- Çalışma Süresi: ${uptimeMinutes} dakika ${uptimeSeconds} saniye
- Kullanıcı Sayısı: ${message.client.users.cache.size}
- Sunucu Sayısı: ${message.client.guilds.cache.size}
- Kanal Sayısı: ${message.client.channels.cache.size}
    `;
    message.reply(stats);
  },
};