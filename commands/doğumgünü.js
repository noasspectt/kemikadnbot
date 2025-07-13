// doğumgünü.js
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'doğumgünü',
  description: 'Doğum gününü kaydeder.',
  execute(message, args) {
    const tarih = args[0]; // 8.10.2002 gibi
    if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(tarih)) {
      return message.reply('Lütfen tarihi bu formatta gir: `8.10.2002`');
    }

    const birthdaysPath = path.join(__dirname, '../birthdays.json');
    let birthdays = {};

    try {
      birthdays = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));
    } catch (e) {}

    birthdays[message.author.id] = tarih;

    fs.writeFileSync(birthdaysPath, JSON.stringify(birthdays, null, 2));
    message.channel.send(`✅ ${message.author}, doğum günün başarıyla kaydedildi!`);
  },
};