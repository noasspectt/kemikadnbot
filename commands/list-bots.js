module.exports = {
  name: 'list-bots',
  description: 'Sunucudaki botların listesini gösterir.',
  async execute(message) {
    const bots = message.guild.members.cache.filter(member => member.user.bot).map(bot => `**${bot.user.tag}**`).join('\n');
    if (!bots) {
      return message.reply('Sunucuda hiçbir bot bulunmuyor.');
    }

    message.reply(`Sunucudaki botlar:\n${bots}`);
  },
};