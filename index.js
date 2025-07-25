const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { prefix } = require('./config.json');
const afk = require('./commands/afk.js');
const { activeVoiceRooms } = require('./commands/odaoluştur'); // ← Burası

const snipes = new Map();

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
    };
  }
};

const saveSettings = (settings) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Ayarlar kaydedilirken bir hata oluştu:', error);
  }
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.commands = new Collection();

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

client.snipes = new Map();

client.on('messageDelete', (message) => {
  if (message.partial) return;
  client.snipes.set(message.channel.id, {
    content: message.content,
    author: message.author.tag,
    timestamp: message.createdTimestamp,
    attachment: message.attachments.first()?.proxyURL || null,
  });
  setTimeout(() => client.snipes.delete(message.channel.id), 3600000);
});

// Doğum günü kontrol fonksiyonu
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

// Ready event (tek ve düzenli)
client.once('ready', () => {
  console.log(`${client.user.tag} başarıyla giriş yaptı!`);
  checkBirthdays();
  client.user.setPresence({
    activities: [{ name: `kemikadn`, type: 3 }],
    status: 'online',
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const settings = loadSettings();

  if (
    settings.reklamengel &&
    (message.content.includes('http') || message.content.includes('www'))
  ) {
    try {
      await message.delete();
      message.channel.send(`${message.author}, reklam yapmak yasaktır!`).catch(console.error);
    } catch (error) {
      console.error('Reklam mesajı silinirken bir hata oluştu:', error);
    }
    return;
  }

  if (
    settings.capslockengel &&
    message.content.length > 5 &&
    message.content === message.content.toUpperCase() &&
    /[A-Z]/.test(message.content)
  ) {
    try {
      await message.delete();
      message.channel.send(`${message.author}, lütfen tamamen büyük harf kullanmayınız!`).catch(console.error);
    } catch (error) {
      console.error('Capslock mesajı silinirken bir hata oluştu:', error);
    }
    return;
  }

  if (settings.kufurengel) {
    const kufurKelime = [
      'küfür1', 'küfür2', 'küfür3', 'aq', 'amk', 'oe', 'amına', 'amına koyayım', 'siktirin',
      'siktir', 'sg', 'orospu', 'ananı', 'babanı', 'bacını', 'karını', 'sikeyim', 'allahını',
      'amcık', 'feriştah', 'oç', 'göt', 'amck',
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

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  afk.checkAFKStatus(client);

  if (commandName === 'log-channel') {
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
    return;
  }

  if (!command) return;

  try {
    await command.execute(message, args, settings, saveSettings);
  } catch (error) {
    console.error(`Komut çalıştırılırken bir hata oluştu: ${commandName}`, error);
    message.reply('Komut çalıştırılırken bir hata oluştu!').catch(console.error);
  }
});

// Log kanal dosyası ve fonksiyonları
const logChannelsPath = path.join(__dirname, 'logChannels.json');

const loadLogChannels = () => {
  try {
    const data = fs.readFileSync(logChannelsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Log kanalları dosyası yüklenirken bir hata oluştu:', error);
    return {};
  }
};

const saveLogChannels = (logChannels) => {
  try {
    fs.writeFileSync(logChannelsPath, JSON.stringify(logChannels, null, 2));
  } catch (error) {
    console.error('Log kanalları dosyası kaydedilirken bir hata oluştu:', error);
  }
};

const logChannels = loadLogChannels();

client.on('messageDelete', async (message) => {
  if (message.partial) return;
  const guildId = message.guild?.id;
  if (!guildId || !logChannels[guildId]) return;

  const logChannelId = logChannels[guildId];
  const logChannel = message.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;

  logChannel.send(`📋 Bir mesaj silindi:\n\`\`\`\n${message.content || 'Mesaj bulunamadı.'}\n\`\`\`\nGönderen: ${message.author.tag}`);
});

// Oda silme sistemi
client.on('voiceStateUpdate', async (oldState, newState) => {
  const userId = oldState.member.id;
  const roomId = activeVoiceRooms.get(userId);
  if (!roomId) return;

  // Kullanıcı odaya yeni girdiyse, işlem yapma
  if (!oldState.channelId && newState.channelId === roomId) return;

  // Kullanıcı odadan çıkıyorsa ve içeride kimse kalmadıysa odayı sil
  if (oldState.channelId === roomId && newState.channelId !== roomId) {
    const channel = oldState.guild.channels.cache.get(roomId);
    if (!channel) return;

    if (channel.members.size === 0) {
      await channel.delete().catch(console.error);
      activeVoiceRooms.delete(userId);
    }
  }
});


// Web sunucusu
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Sunucu ${port} numaralı bağlantı noktasında yürütülüyor.`);
});

// Giriş
client.login(process.env.token);
