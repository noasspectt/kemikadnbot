module.exports = {
  name: 'ship',
  description: 'İki kullanıcı arasındaki uyumu hesaplar.',
  async execute(message, args) {
    const user1 = message.mentions.users.first();
    const user2 = message.mentions.users.last();

    if (!user1 || !user2 || user1.id === user2.id) {
      return message.reply('Lütfen iki farklı kullanıcıyı etiketleyin.');
    }

    const compatibility = Math.floor(Math.random() * 101);
    message.reply(`${user1} ve ${user2} arasındaki uyum: ${compatibility}%`);
  },
};