const { Collection } = require('discord.js');

// AFK kullanıcılarını ve soğuma süresini depolamak için koleksiyonlar
const afkUsers = new Collection();
const cooldowns = new Collection();
let isAFKListenerAdded = false; // Olay dinleyicisinin yalnızca bir kez eklenmesini kontrol eder

module.exports = {
  name: 'afk',
  description: 'Kullanıcının AFK (Away From Keyboard) durumuna geçmesini sağlar.',
  async execute(message, args) {
    const reason = args.join(' ') || 'AFK';

    // Kullanıcı zaten AFK mı?
    if (afkUsers.has(message.author.id)) {
      // AFK sebebini güncelle
      afkUsers.set(message.author.id, { reason, timestamp: Date.now() });
      return message.reply(`AFK sebebiniz güncellendi: **${reason}**`);
    }

    // Kullanıcıyı AFK durumuna geçir
    afkUsers.set(message.author.id, { reason, timestamp: Date.now() });
    // Kullanıcıya bir soğuma süresi ekle
    cooldowns.set(message.author.id, Date.now() + 2000); // 2 saniyelik soğuma süresi

    message.reply(`Artık AFK modundasınız: **${reason}**`);
  },
  // AFK kontrol fonksiyonunu modüle ekleyin
  checkAFKStatus(client) {
    if (isAFKListenerAdded) return; // Eğer dinleyici zaten eklenmişse, tekrar ekleme
    isAFKListenerAdded = true; // Dinleyiciyi eklediğimizi işaretle

    client.on('messageCreate', (message) => {
      if (message.author.bot) return; // Bot mesajlarını kontrol etme

      // Kullanıcının soğuma süresinde olup olmadığını kontrol et
      const cooldown = cooldowns.get(message.author.id);
      if (cooldown && cooldown > Date.now()) {
        return; // Eğer kullanıcı soğuma süresindeyse, işlemi durdur
      }

      // Kullanıcı AFK mı? Eğer öyleyse, AFK durumunu kaldır
      if (afkUsers.has(message.author.id)) {
        afkUsers.delete(message.author.id);
        cooldowns.delete(message.author.id); // Soğuma süresini kaldır
        return message.reply('Artık AFK modundan çıktınız.');
      }

      // Mesajda bir kullanıcıyı etiketlemiş mi? Eğer öyleyse, etiketlenen kullanıcının AFK durumunu kontrol et
      message.mentions.members.forEach((member) => {
        if (afkUsers.has(member.id)) {
          const afkInfo = afkUsers.get(member.id);
          message.reply(`**${member.user.tag}** şu anda AFK: ${afkInfo.reason}`);
        }
      });
    });
  },
};