module.exports = {
  name: 'ban-list',
  description: 'Sunucuda yasaklanmış kullanıcıların listesini gösterir.',
  async execute(message) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    try {
      const bans = await message.guild.bans.fetch();
      if (bans.size === 0) {
        return message.reply('Bu sunucuda yasaklanmış kullanıcı yok.');
      }

      const banList = bans.map(ban => `**${ban.user.tag}** (ID: ${ban.user.id})`).join('\n');
      message.reply(`Yasaklanmış kullanıcılar:\n${banList}`);
    } catch (error) {
      console.error('Ban listesi alınırken bir hata oluştu:', error);
      message.reply('Ban listesi alınırken bir hata oluştu.');
    }
  },
};