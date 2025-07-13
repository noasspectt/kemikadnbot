module.exports = {
  name: 'userinfo',
  description: 'Bir kullanıcının bilgilerini gösterir.',
  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const userInfo = `
**Kullanıcı Adı:** ${user.username}
**ID:** ${user.id}
**Hesap Oluşturulma Tarihi:** ${user.createdAt.toDateString()}
**Avatar:** ${user.displayAvatarURL({ dynamic: true })}
    `;

    message.reply(userInfo);
  },
};