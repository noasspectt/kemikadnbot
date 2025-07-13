module.exports = {
  name: 'snipe',
  description: 'Son silinen mesajı gösterir.',
  execute(message, args) {
    const snipedMessage = message.client.snipes.get(message.channel.id); // client.snipes üzerinden eriş

    if (!snipedMessage) {
      return message.channel.send('Bu kanalda silinen bir mesaj yok.');
    }

    const embed = {
      color: 0x0099ff,
      author: { name: snipedMessage.author },
      description: snipedMessage.content || 'Mesaj içeriği bulunamadı.',
      footer: { text: `Silinme zamanı:` },
      timestamp: new Date(snipedMessage.timestamp).toISOString(), // ISO8601 formatına dönüştür
    };

    if (snipedMessage.attachment) {
      embed.image = { url: snipedMessage.attachment };
    }

    return message.channel.send({ embeds: [embed] });
  },
};