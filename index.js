const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { prefix } = require('./config.json');
const afk = require('./commands/afk.js'); // Dosya yolu doğru olmalı
const snipes = new Map(); // Snipe için Map tanımlandı

// Ayarları JSON dosyasından okumak için bir yardımcı fonksiyon
const loadSettings = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ayarlar yüklenirken bir hata oluştu:', error);
    return {
      reklamEngel: true,
      capslockEngel: true,
      kufurEngel: true,
    }; // Varsayılan ayarlar
  }
};

// Ayarları JSON dosyasına yazmak için bir yardımcı fonksiyon
const saveSettings = (settings) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Ayarlar kaydedilirken bir hata oluştu:', error);
  }
};

// Discord.js istemcisi
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Komutları tutmak için bir Collection
client.commands = new Collection();

// Komut dosyalarını yükleme
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name && typeof command.execute === 'function') {
    client.commands.set(command.name, command);
  } else {
    console.warn(`Komut dosyası ${file} geçerli bir execute fonksiyonuna sahip değil.`);
  }
}

client.snipes = new Map(); // snipes değişkenini client nesnesine ekle

// Silinen mesajları yakalama
client.on('messageDelete', (message) => {
  if (message.partial) return; // Eğer mesaj cache'de değilse atla
  client.snipes.set(message.channel.id, {
    content: message.content,
    author: message.author.tag,
    timestamp: message.createdTimestamp,
    attachment: message.attachments.first()?.proxyURL || null,
  });

  // “odaoluştur” komutundan export edileni import et 62
const { activeVoiceRooms } = require('./commands/odaoluştur');
  

  // Veriyi sadece 1 saat boyunca sakla
  setTimeout(() => client.snipes.delete(message.channel.id), 3600000); // 1 saat
});

// Bot hazır olduğunda çalıştırılacak kod
client.once('ready', () => {
  console.log(`${client.user.tag} başarıyla giriş yaptı!`);

  // DOĞUM GÜNÜ KONTROLÜ 78
const checkBirthdays = () => {
  const today = new Date();
  const gün = today.getDate();
  const ay = today.getMonth() + 1;
  let birthdays = {};
  try {
    birthdays = JSON.parse(fs.readFileSync(path.join(__dirname, 'birthdays.json'), 'utf8'));
  } catch (error) {
    console.error('Doğum günü verisi yüklenemedi:', error);
    return;
  }
  for (const userId in birthdays) {
    const [dgün, day] = birthdays[userId].split('.');
    if (parseInt(dgün) === gün && parseInt(day) === ay) {
      const kanal = client.channels.cache.get('1392630423216980099');
      if (kanal) kanal.send(`🎉 Bugün <@${userId}> doğmuş! İyi ki doğdun! 🥳`);
    }
  }
};

// READY 99
client.once('ready', () => {
  console.log(`${client.user.tag} başarıyla giriş yaptı!`);
  checkBirthdays();
  client.user.setPresence({
    activities: [{ name: `kemikadn`, type: 3 }],
    status: 'online',
  });
});


// Mesajları işleme
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Güncel ayarları yükle
  const settings = loadSettings();

  // Reklam Engelleme
  if (settings.reklamengel && (message.content.includes('http') || message.content.includes('www'))) {
    try {
      await message.delete();
      message.channel.send(`${message.author}, reklam yapmak yasaktır!`).catch(console.error);
    } catch (error) {
      console.error('Reklam mesajı silinirken bir hata oluştu:', error);
    }
    return;
  }

  // Capslock Engelleme
  if (
    settings.capslockengel &&
    message.content.length > 5 && // Mesaj 5 karakterden uzun olmalı
    message.content === message.content.toUpperCase() && // Tamamen büyük harflerden oluşmalı
    /[A-Z]/.test(message.content) // Mesajda en az bir büyük harf olmalı
  ) {
    try {
      await message.delete();
      message.channel.send(`${message.author}, lütfen tamamen büyük harf kullanmayınız!`).catch(console.error);
    } catch (error) {
      console.error('Capslock mesajı silinirken bir hata oluştu:', error);
    }
    return;
  }

  // Küfür Engelleme
  if (settings.kufurengel) {
    const kufurKelime = [
      'küfür1',
      'küfür2',
      'küfür3',
      'aq',
      'amk',
      'oe',
      'amına',
      'amına koyayım',
      'siktirin',
      'siktir',
      'sg',
      'orospu',
      'ananı',
      'babanı',
      'bacını',
      'karını',
      'sikeyim',
      'allahını',
      'amcık',
      'feriştah',
      'oç',
      'göt',
      'amck',
    ];
    if (kufurKelime.some((kelime) => message.content.toLowerCase().includes(kelime))) {
      try {
        await message.delete();
        message.channel.send(`${message.author}, küfür yasaktır!`).catch(console.error);
      } catch (error) {
        console.error('Küfür mesajı silinirken bir hata oluştu:', error);
      }
      return;
    }
  }

  // Komutları işleme
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // log-channel komutunu tetiklemek için gerekli kod
if (commandName === 'log-channel') {
  const command = client.commands.get('log-channel');
  if (command) {
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error('Log-channel komutu çalıştırılırken bir hata oluştu:', error);
      message.reply('Log-channel komutu çalıştırılırken bir hata oluştu!').catch(console.error);
    }
  } else {
    message.reply('Log-channel komutu bulunamadı!');
  }
}

// Sunucuya özel log kanalını saklayacağımız JSON dosyasının yolu
const logChannelsPath = path.join(__dirname, 'logChannels.json');

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

// Sunucu log kanalları için global değişken
const logChannels = loadLogChannels();

// Silinen mesajları loglama
client.on('messageDelete', async (message) => {
  if (message.partial) return; // Eğer mesaj cache'de değilse atla
  const guildId = message.guild?.id;
  if (!guildId || !logChannels[guildId]) return; // Eğer log kanalı ayarlanmamışsa atla

  const logChannelId = logChannels[guildId];
  const logChannel = message.guild.channels.cache.get(logChannelId);
  if (!logChannel) return; // Eğer log kanalı bulunamıyorsa atla

  logChannel.send(`📋 Bir mesaj silindi:\n\`\`\`\n${message.content || 'Mesaj bulunamadı.'}\n\`\`\`\nGönderen: ${message.author.tag}`);
});

// Komutları yükleme
  const command = client.commands.get(commandName);

    // Diğer komutları yükledikten sonra AFK olay dinleyicisini çalıştırın
afk.checkAFKStatus(client);

  if (!command) return;
 
  try {
    await command.execute(message, args, settings, saveSettings);
  } catch (error) {
    console.error(`Komut çalıştırılırken bir hata oluştu: ${commandName}`, error);
    message.reply('Komut çalıştırılırken bir hata oluştu!').catch(console.error);
  }

});

// —— YENİ EKLENDİ: voiceStateUpdate ile oda silme ——  
client.on('voiceStateUpdate', async (oldState, newState) => {
  const userId = oldState.member.id;
  const roomId = activeVoiceRooms.get(userId);
  if (!roomId) return;
  // Eğer oda sahibinin eski kanalı bizim kanalımızsa
  if (oldState.channelId === roomId && newState.channelId !== roomId) {
    const ch = oldState.guild.channels.cache.get(roomId);
    if (ch) await ch.delete().catch(console.error);
    activeVoiceRooms.delete(userId);
  }
});

// Sunucu oluşturma ve proje aktivitesi sağlama.
const app = express();
const port = 3000;

// Web sunucu
app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Sunucu ${port} numaralı bağlantı noktasında yürütülüyor.`);
});

// Botu başlatma
client.login(process.env.token);
