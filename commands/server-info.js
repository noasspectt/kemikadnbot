module.exports = {
  name: 'server-info',
  description: 'Sunucunun bilgilerini gösterir.',
  async execute(message) {
    const serverInfo = `
**Sunucu Adı:** ${message.guild.name}
**Toplam Üye Sayısı:** ${message.guild.memberCount}
**Sunucu Kuruluş Tarihi:** ${message.guild.createdAt.toDateString()}
**Sunucu Sahibi:** ${await message.guild.fetchOwner().then(owner => owner.user.tag)}
    `;
    message.reply(serverInfo);
  },
};