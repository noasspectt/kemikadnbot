const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'add-emoji',
  description: 'Sunucuya yeni bir emoji ekler.',
  async execute(message, args) {
     // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
     if (!message.member.permissions.has(PermissionsBitField.Flags.ManageWebhooks)) {
      return message.reply('Bu komutu kullanmak için gerekli izniniz yok.');
    }

    const emojiName = args[0];
    const emojiURL = args[1];

    if (!emojiName || !emojiURL) {
      return message.reply('Lütfen bir emoji adı ve URL sağlayın.');
    }

    try {
      const emoji = await message.guild.emojis.create({ attachment: emojiURL, name: emojiName });
      message.reply(`Emoji başarıyla eklendi: ${emoji}`);
    } catch (error) {
      console.error('Emoji eklenirken bir hata oluştu:', error);
      message.reply('Emoji eklenirken bir hata oluştu.');
    }
  },
};