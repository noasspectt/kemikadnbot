// index.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const {
  Client,
  Collection,
  GatewayIntentBits
} = require('discord.js');
const { prefix } = require('./config.json');
const afk = require('./commands/afk.js'); 
const snipes = new Map();

// AYARLARI OKUMA/YAZMA HELPERS
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

// BOT INTENTLERİNE GuildVoiceStates EKLENDİ
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,  // ← Buraya eklendi
  ],
});

client.commands = new Collection();

// KOMUTLARI YÜKLE
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

// “odaoluştur” komutundan export edileni import et
const { activeVoiceRooms } = require('./commands/odaoluştur');

// SNIPES
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

// DOĞUM GÜNÜ KONTROLÜ
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
      const kanal = client.channels.cache.get('1042439195450429452');
      if (kanal) kanal.send(`🎉 Bugün <@${userId}> doğmuş! İyi ki doğdun! 🥳`);
    }
  }
};

// READY
client.once('ready', () => {
  console.log(`${client.user.tag} başarıyla giriş yaptı!`);
  checkBirthdays();
  client.user.setPresence({
    activities: [{ name: `kemikadn`, type: 3 }],
    status: 'online',
  });
});

// MESSAGE CREATE
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const settings = loadSettings();

  // --- Reklam, capslock, küfür engelleri (seninkiyle birebir) ---
  if (settings.reklamEngel && /(http|www\.)/.test(message.content)) {
    await message.delete().catch(() => {});
    return message.channel.send(`${message.author}, reklam yapmak yasaktır!`).catch(console.error);
  }
  if (
    settings.capslockEngel &&
    message.content.length > 5 &&
    message.content === message.content.toUpperCase() &&
    /[A-Z]/.test(message.content)
  ) {
    await message.delete().catch(() => {});
    return message.channel.send(`${message.author}, lütfen tamamen büyük harf kullanmayınız!`).catch(console.error);
  }
  if (settings.kufurEngel) {
    const kufurKelime = [/* ... senin liste ... */];
    if (kufurKelime.some((k) => message.content.toLowerCase().includes(k))) {
      await message.delete().catch(() => {});
      return message.channel.send(`${message.author}, küfür yasaktır!`).catch(console.error);
    }
  }

  // KOMUTLAR
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // özel log-channel komutu
  if (commandName === 'log-channel') {
    const cmd = client.commands.get('log-channel');
    if (!cmd) return message.reply('Log-channel komutu bulunamadı!');
    return cmd.execute(message, args);
  }

  // AFK kontrolü (eğer afk.js içinde varsa)
  afk.checkAFKStatus(client);

  // normal komut yürütme
  const command = client.commands.get(commandName);
  if (!command) return;
  try {
    await command.execute(message, args, settings, saveSettings);
  } catch (err) {
    console.error(`Komut çalıştırılırken hata: ${commandName}`, err);
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

// EXPRESS SUNUCU (uptime için)
const app = express();
const port = 3000;
app.get('/', (_req, res) => res.sendStatus(200));
app.listen(port, () => console.log(`Sunucu ${port} portunda çalışıyor.`));

// BOTU BAŞLAT
client.login(process.env.token);  // ← kendi token'ını buraya koymayı unutma!