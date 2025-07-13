module.exports = {
  name: 'restart',
  description: 'Botu yeniden başlatır (Yalnızca yetkili kullanıcılar için).',
  async execute(message) {
    if (message.author.id !== 'YOUR_USER_ID') {
      return message.reply('Bu komutu yalnızca bot sahibi kullanabilir.');
    }

    message.reply('Bot yeniden başlatılıyor...').then(() => {
      process.exit(0);
    });
  },
};