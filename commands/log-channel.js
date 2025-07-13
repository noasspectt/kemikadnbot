const fs = require('fs');
const path = require('path');
const { PermissionsBitField } = require('discord.js'); // Discord.js'den PermissionsBitField'ı doğru şekilde içe aktarın

// Log kanallarını saklamak için JSON dosyasının yolu
const logChannelsPath = path.join(__dirname, '../logChannels.json');

// Log kanallarını yüklemek için bir yardımcı fonksiyon
const loadLogChannels = () => {
  try {
    const data = fs.readFileSync(logChannelsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Log kanalları dosyası yüklenirken bir hata oluştu:', error);
    return {}; // Varsayılan olarak boş bir nesne döndür
  }
};

// Log kanallarını kaydetmek için bir yardımcı fonksiyon
const saveLogChannels = (logChannels) => {
  try {
    fs.writeFileSync(logChannelsPath, JSON.stringify(logChannels, null, 2));
  } catch (error) {
    console.error('Log kanalları dosyası kaydedilirken bir hata oluştu:', error);
  }
};

module.exports = {
  name: 'log-channel',
  description: 'Log kanalı ayarlar',
  async execute(message, args) {
    // Kullanıcının ADMINISTRATOR iznine sahip olup olmadığını kontrol edin
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bu komutu kullanmak için yeterli izniniz yok.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Lütfen bir kanal etiketleyin! Örneğin: `!log-channel #log-kanalı`');
    }

    const logChannels = loadLogChannels();
    logChannels[message.guild.id] = channel.id;
    saveLogChannels(logChannels);

    message.reply(`Log kanalı başarıyla ayarlandı: ${channel}`);
  },
};