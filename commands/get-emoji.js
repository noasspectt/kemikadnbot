module.exports = {
  name: 'get-emoji',
  description: 'Belirtilen emoji hakkında bilgi verir.',
  async execute(message, args) {
    const emojiName = args[0];
    if (!emojiName) {
      return message.reply('Lütfen bir emoji adı belirtin.');
    }

    const emoji = message.guild.emojis.cache.find(e => e.name === emojiName);
    if (!emoji) {
      return message.reply('Belirttiğiniz emoji bulunamadı.');
    }

    message.reply(`Emoji bilgisi:\n**Ad:** ${emoji.name}\n**ID:** ${emoji.id}\n**URL:** ${emoji.url}`);
  },
};