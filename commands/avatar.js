module.exports = {
  name: 'avatar',
  description: 'Kullanıcının avatarını gösterir.',
  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    message.reply(`${user.username}'nin avatarı: ${user.displayAvatarURL({ dynamic: true })}`);
  },
};