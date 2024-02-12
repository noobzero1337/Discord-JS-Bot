const Discord = require('discord.js');
const weather = require('weather-js');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const lineReply = require('discord-reply');
const jsoning = require('jsoning');
const database = new jsoning('bank.json');
require('dotenv/config');
const botgpt = require('./chatbot.js');
const fs = require('fs');

const { channelId } = require('./config.json');
const { createPool } = require('mysql2/promise');
require('dotenv').config();

const deletedMessages = {};
const clownReactions = {};
const editedMessages = new Map();
const databaseFile = 'punishment.json';

const board = Array(9).fill(':white_large_square:');

let currentPlayer = 'X';

const connection = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
});

function printBoard() {
  let boardString = '';
  for (let i = 0; i < 9; i += 3) {
      boardString += board.slice(i, i + 3).join('') + '\n';
  }
  return boardString;
}

function checkWinner() {
  const winningPositions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6] // Diagonal
  ];

  for (let i = 0; i < winningPositions.length; i++) {
      const [a, b, c] = winningPositions[i];
      if (board[a] === board[b] && board[b] === board[c] && board[a] !== ':white_large_square:') {
          return board[a];
      }
  }

  if (!board.includes(':white_large_square:')) return 'tie';
  return null;
}


const prefix = '*';


const client = new Discord.Client({
  allowedMentions: {
    parse: [`users`, `roles`],
    repliedUser: true,

  },
  intens: [
    "IntentsBitField.GUILDS",
    "IntentsBitFIeld.GUILDS_MESSAGES",
    "IntentsBitField.MESSAGE_CONTENT",
    "GUILDS_PRESENCES",
    "GUILD_MEMBERS",
    "GUILD_MESSAGE_REACTIONS",  
  ],
});


client.on("ready", () => {
  console.log(`${client.user.tag} already online!`)
    
  const status = [
    //`SiLver#7420`,
    `( *help )`,
    // `${client.users.cache.size} Users`, //this for count user
    //`${client.guilds.cache.size} Guilds` //gunanya untuk count server yang dimasuki oleh bot
  ];
  setInterval(async () => {
    client.user.setActivity(status[Math.floor(Math.random() * status.length)], {
      type: "PLAYING",
    }); //you can change watching becomes playing and else
  }, 5000);
});

client.on('messageDelete', deletedMsg => {
 
  deletedMessages[deletedMsg.channel.id] = {
      content: deletedMsg.content,
      author: deletedMsg.author.tag,
      timestamp: deletedMsg.createdTimestamp
  };
});

client.on('message', async message => {


  let user = message.mentions.users.first();

  if (user === client.user) {
    message.lineReply(botgpt);
  }

  if (message.content === "pajrin" || message.content === "ququ") {
    message.channel.send("ganteng");
  }
  if (message.content === "halo") {
    message.channel.send("apa cuk");
  }
  if (message.content === "kenapa") {
    message.channel.send("gpp");
  }
  if (message.content === "apa") {
    message.channel.send("kamu nanya");
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "test") {
      return message.lineReply(`Your current Ping is \`${client.ws.ping}ms!\``);

  }

  if (command === "weather") {
    let degreetype = "C";
    let city = args.join(" ");

    await weather.find(
      { search: city, degreeType: degreetype },
      function (err, result) {
        if (!city) return message.lineReply("Please insert the city name.");
        if (err || result === undefined || result.length === 0)
          return message.lineReply(
            "Unknown city. Perhaps got typo or maybe not a city?"
          );

        const request = message.author.tag;
        let current = result[0].current;
        let location = result[0].location;

        const embed = new Discord.MessageEmbed()
          .setAuthor(current.observationpoint)
          .setDescription(`${current.skytext}`)
          .setThumbnail(current.imageUrl)
          .setFooter(`Requested by ${request}`)
          .setTimestamp()
          .setColor(0x7289da);

        embed
          .addField("Latitude", location.lat, true)
          .addField("Longitude", location.long, true)
          .addField("Feels Like", `${current.feelslike}° Degrees`, true)
          .addField("Degree Type", location.degreetype, true)
          .addField("Humidity", `${current.humidity}%`, true)
          .addField("Temperature", `${current.temperature}° Degrees`, true)
          .addField("Observation Time", current.observationtime, true)
          .addField("Winds", current.winddisplay, true)
          .addField("Timezone", `GMT ${location.timezone}`, true);

        return message.channel.send(embed);
      }
    );
  }

  if (command === "ship") {
    let user = message.mentions.users.first();
    let RN = Math.floor(Math.random() * 100) + 1;

    if (!user) return message.channel.send(`Please mention a user to ship!`);

    const UnloveEmbed = new Discord.MessageEmbed()
      .setTitle(`This isn't match for you, don't give up!`)
      .setThumbnail(
        `https://cdn.discordapp.com/attachments/885717268837842975/887624927816081458/unknown.png`
      )
      .setColor("RED")
      .setDescription(
        `${message.author} shipped with ${user} and the score is ${RN}%`
      );

    const loveEmbed = new Discord.MessageEmbed()
      .setTitle(`This a great couple for you, keep it up!`)
      .setThumbnail(
        `https://cdn.discordapp.com/attachments/885717268837842975/887626575951056916/Love-Struck-Heart-Logo-Designs.png`
      )
      .setColor("GREEN")
      .setDescription(
        `${message.author} shipped with ${user} and the score is ${RN}%`
      );

    if (RN > 50) {
      message.channel.send(loveEmbed);
    } else {
      message.channel.send(UnloveEmbed);
    }
  }
  
  if (command === "snipe") {
    const channelId = message.channel.id;
        const deletedMsg = deletedMessages[channelId];
        if (deletedMsg) {
            const { content, author, timestamp } = deletedMsg;
            const snipeEmbed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Sniped Message')
                .addField('Content', content)
                .addField('Author', author)
                .addField('Timestamp', new Date(timestamp).toLocaleString());
            message.channel.send(snipeEmbed);
        } else {
            message.channel.send('No recently deleted messages to snipe.');
        }
  }

  if (command === "fasttype" || command === "fast") {
    const AREA = [1, 2];
    const fastwords = [
      "I will go to bathroom at morning",
      "I'm gonna drove my car tomorrow",
      "I would buying new shoes when new year is coming",
      "I want go to America, but I don't have enough money",
      "Wow that so cool",
      "Your face like a tomato tbh",
      "I might playing discord everyday",
      "Playing fortnite 24/7",
      "Trypophobia sucks",
      "Psychopath are really scary",
      "I might run tomorrow morning",
      "There are so many tasks today",
    ];

      await message.channel.send(`**In 5 seconds your sentence will appear!
      Write and follow the sentences below!**`);
      await delay(5000);
      let timevar = 20000;
      let randomword = fastwords[Math.floor(Math.random() * fastwords.length)];

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(randomword)
        .setFooter(`Requested by ${message.author.tag}`);

      const b = await message.channel.send(embed);
      let i = 0;
      var date = new Date();
      await b.channel
        .awaitMessages((m) => m.author.id == message.author.id, {
          max: 1,
          time: timevar,
          errors: ["time"],
        })
        .then(async (collected) => {
          timevar = collected.first().content;
        })
        .catch(() => {
          return i++;
        });
      if (i === 1) return message.lineReply("Your time ran is out, damnn....");
      var date2 = new Date();
      if (timevar === randomword)
        return message.lineReply(
          `**Wow, you are fast! and right! :white_check_mark:**\n\nYou needed \`${
            (date2 - date) / 1000
          } seconds\``
        );
      else
        return message.lineReply(
          `**Beep, Boop, your wrong input the word lol or might've typo**`
        );
  

    function delay(delayInms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(2);
        }, delayInms);
      });
    }
  }

  if (command === "ppsize") {
    let user = message.mentions.users.first() || message.author;
    let random = Math.floor(Math.random() * 10) + 1;
    let size = "";

    for (let i = 0; i < random; i++) {
      size += "=";
    }

    let pp = "8" + size + "D";
    let description = user.tag + "ppsize: " + pp;

    const embed = new Discord.MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setColor("RANDOM")
      .setDescription(description)
      .setTimestamp();
    return message.channel.send(embed);
  }

  if (command === "hack") {
    let user = message.mentions.users.first();
    if (!user) {
      return message.lineReply("Please mention user will you hack!");
    }

    let text = [
      `Getting ${user.tag} information`,
      `Getting ${user.tag} discord token`,
      `Sending virus into the user`,
      `Getting all ${user.tag} information`,
    ];

    let current = 0;
    let count = text.length;
    let editTime = 2000;

    message.channel.send(`Checking ${user.tag} account`).then((msg) => {
      let interval = setInterval(() => {
        if (current === count) {
          msg.edit(`Successfully hack ${user.tag} account`);
          clearInterval(interval);
          return;
        }

        let hackMsg = text[current];
        msg.edit(hackMsg);
        current++;

      }, editTime);
    });
  }

  if (command === "avatar") {
    const input = args.join(" ");
    const user =
      client.users.cache.get(input) ||
      client.users.cache.find((x) => x.username == input) ||
      msg.mentions.users.first() ||
      msg.author;
    const embed = new MessageEmbed()
      .setTitle(`${user.tag} Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setColor("RANDOM");
    return message.channel.send(embed);
  }

  if (command === "rps") {
      let embed = new Discord.MessageEmbed()
        .setTitle("RPS")
        .setDescription("React to play this game")
        .setTimestamp();
      let msg = await message.channel.send(embed);
      await msg.react("🏔");
      await msg.react("✂️");
      await msg.react("📰");

      const filter = (reaction, user) => {
        return (
          [`🏔`, `✂️`, `📰`].includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };

      const choices = [`🏔`, `✂️`, `📰`];
      const me = choices[Math.floor(Math.random() * choices.length)];
      msg
        .awaitReactions(filter, { max: 1, time: 20000, error: ["time"] })
        .then(async (collected) => {
          const reaction = collected.first();
          let result = new Discord.MessageEmbed()
            .setTitle("Result")
            .addField("Your choice", `${reaction.emoji.name}`)
            .addField("Bot choice", `${me}`);
          await msg.edit(result);

          if (
            (me === "🏔" && reaction.emoji.name === "✂️") ||
            (me === "✂️" && reaction.emoji.name === "📰") ||
            (me === "📰" && reaction.emoji.name === "🏔")
          ) {
            message.reply("You Lose!");
          } else if (me === reaction.emoji.name) {
            return message.lineReply("Tie!");
          } else {
            return message.lineReply("You Won!");
          }
        })
        .catch((collected) => {
          message.reply(
            `process has been canceled, you've already make the game and didn't react the first!`
          );
        });

    }
    
    if (command === "ttt") {
      const row = parseInt(args[0]) - 1;
      const col = parseInt(args[1]) - 1;

      // Validasi apakah input adalah angka yang valid
      if (isNaN(row) || isNaN(col) || row < 0 || row >= 3 || col < 0 || col >= 3) {
          return message.reply('Input baris dan kolom harus berupa angka antara 1 dan 3!');
      }

      if (board[row][col] !== ':') {
          return message.reply('Posisi tersebut sudah diambil!');
      }

      board[row][col] = symbols[0];

      displayBoard(message);

      const winner = checkWinner();
      if (winner) {
          return message.channel.send(`Pemenangnya adalah: ${winner}!`);
      }

      if (isBoardFull()) {
          return message.channel.send('Permainan seri!');
      }

      symbols.reverse();
      
    }
  
    if (command === "echo") {
      const echoText = args.join(' ');
      const channel = await client.channels.fetch(channelId);

      if (channel) {
        for (let i = 0; i < 1; i++) {
          channel.send(`${echoText}`);
        }
      } else {
        console.error('Channel not found!');
      }

    }

  if (command === "msgedit") {
    const serverId = '1061469032408158218'; // ebol
    const channelId = '1101568951848271973'; // ngomong-anjing
    const messageId = args[0]; 
    const newContent = args.slice(1).join(' '); 

    try {
        // Periksa apakah ID server sudah ada di dalam Map
        if (!editedMessages.has(serverId)) {
            editedMessages.set(serverId, new Map());
        }

        // Dapatkan Map untuk ID server tersebut
        const serverMap = editedMessages.get(serverId);

        const channel = client.channels.cache.get(channelId);
        if (!channel || channel.type !== 'text') {
            return message.lineReply('Invalid channel or channel type.');
        }

        // Dapatkan pesan yang ingin diubah berdasarkan ID pesan
        const targetMessage = await channel.messages.fetch(messageId)
            .catch(() => null); // Tambahkan catch untuk menangani jika pesan tidak ditemukan

        // Periksa apakah pesan ditemukan dan apakah pengguna memiliki izin untuk mengedit pesan
        if (!targetMessage || targetMessage.author.id !== client.user.id) {
            return message.lineReply('Message with the given ID was not found or is not eligible for editing.');
        }

        // Edit pesan dengan konten baru
        await targetMessage.edit(newContent);
        message.lineReply(`Message with ID ${messageId} has been edited.`);

        // Simpan pesan yang diedit ke dalam Map
        serverMap.set(messageId, targetMessage);
    } catch (error) {
        console.error('Error:', error);
        message.lineReply('An error occurred while editing the message.');
    }
    }
  
  if (command === "clown") {
    const userId = args[0]; // User ID
    const targetServerId = '1061469032408158218'; // ebol
    const targetChannelId = '1101568951848271973'; // ngomong-anjing

    try {
        // Cari server tempat pengguna berada
        const targetGuild = await client.guilds.fetch(targetServerId);

        // Cari member berdasarkan ID di server target
        const member = await targetGuild.members.fetch(userId);

        // Kirim pesan respons dengan tag pengguna yang dituju tanpa mention
        message.channel.send(`Clowned **${member.user.tag}** in <#${targetChannelId}>`);

        // Tambahkan pengguna ke daftar reaksi clown untuk server target
        if (!clownReactions[targetServerId]) {
            clownReactions[targetServerId] = {};
        }

        clownReactions[targetServerId][userId] = {
            channelId: targetChannelId,
            shouldReact: true
        };

        // Tunggu pesan selanjutnya dari pengguna target di saluran yang ditentukan
        const targetChannel = targetGuild.channels.cache.get(targetChannelId);
        const filter = (msg) => msg.author.id === userId;
        const collector = targetChannel.createMessageCollector(filter);

        let reactionCount = 0;

        collector.on('collect', async (msg) => {
            // Tambahkan pengujian untuk menonaktifkan reaksi berdasarkan kondisi tertentu
            if (reactionCount < 100 && clownReactions[targetServerId][userId].shouldReact) {
                // Tambahkan reaksi clown pada pesan yang dikirim oleh pengguna target
                await msg.react('🤡');
                reactionCount++;
            } else {
                // Hentikan kolektor jika telah memberi reaksi pada 100 pesan atau kondisi tidak memenuhi
                collector.stop();
            }
        });
    } catch (error) {
        console.error('Error:', error);
        message.reply('An error occurred while using command.');
    }
  }

  if (command === "unclown") {
    const userId = args[0]; // User ID
    const targetServerId = '1061469032408158218'; // ebol

    // Verifikasi apakah pengguna ada dalam daftar reaksi clown untuk server target
    if (clownReactions[targetServerId] && clownReactions[targetServerId][userId]) {
        // Hapus pengguna dari daftar reaksi clown untuk server target
        delete clownReactions[targetServerId][userId];
        const user = client.users.cache.get(userId);
        message.channel.send(`Unclowned **${user.tag}**`);
    } else {
        // Tampilkan pesan kesalahan jika pengguna tidak ditemukan dalam daftar reaksi clown
        message.lineReply(`Can't find the user in react clown list.`);
    }
  }

  if (command === "msgclown") {
    const messageId = args[0]; // Message ID
    const targetServerId = '1061469032408158218'; // ebol
    const targetChannelId = '1101568951848271973'; // ngomong-anjing

    try {
        // Dapatkan server tempat pesan berada
        const targetGuild = await client.guilds.fetch(targetServerId);

        // Dapatkan pesan berdasarkan ID pesan
        const targetChannel = await targetGuild.channels.cache.get(targetChannelId);
        const targetMessage = await targetChannel.messages.fetch(messageId);

        // Kirim pesan respons
        message.channel.send(`Clowned message ${messageId} in <#${targetChannelId}>`);

        // Tambahkan reaksi clown pada pesan yang sesuai
        await targetMessage.react('🤡');

        // Tambahkan pesan ke daftar reaksi clown untuk server target
        if (!clownReactions[targetServerId]) {
            clownReactions[targetServerId] = {};
        }

        clownReactions[targetServerId][messageId] = {
            channelId: targetChannelId,
            shouldReact: true
        };
    } catch (error) {
        console.error('Error:', error);
        message.reply('An error occurred while using command.');
    }
  }

  if (command === "clownlist") {
    const targetServerId = '1061469032408158218'; // ebol

    // Verifikasi apakah ada daftar reaksi clown untuk server target
    if (clownReactions[targetServerId]) {
        // Dapatkan array pengguna dari daftar reaksi clown
        const clownedUsers = Object.keys(clownReactions[targetServerId]);
        
        // Jika ada pengguna dalam daftar, kirim daftar pengguna ke saluran
        if (clownedUsers.length > 0) {
            const userList = clownedUsers.map(userId => {
                const user = client.users.cache.get(userId);
                return user ? user.tag : userId; // Gunakan tag pengguna jika tersedia, jika tidak gunakan ID pengguna
            });
            message.channel.send(`Pengguna dalam daftar reaksi clown: \n${userList.join('\n')}`);
        } else {
            message.channel.send('Tidak ada pengguna dalam daftar reaksi clown.');
        }
    } else {
        message.channel.send('Tidak ada daftar reaksi clown untuk server ini.');
    }
  }

  if (command === "nuke") {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      return message.lineReply("Sorry, you don't have permission to use this command.");
  }

  let pos = message.channel.position;

  message.channel.clone().then((c) => {
      message.channel.delete()
          .then(() => {
              c.setPosition(pos);
              c.send("This channel has been nuked!\nhttps://imgur.com/LIyGeCR");
          })
          .catch((error) => {
              console.error(error);
              message.lineReply("Failed to nuke the channel.");
          });
  }).catch((error) => {
      console.error(error);
      message.lineReply("Failed to clone the channel.");
  });
  }

  if (command === "dm") {
    const userId = args[0];

    if (!userId || !/^\d+$/.test(userId)) {
      return message.channel.send("User ID is not found or You didn't prove a User ID?");
    }

    const user = await client.users.fetch(userId).catch(error => {
      console.error(`Error fetching user: ${error.message}`);
      return null;
    });

    args.shift(); 

    const dmContent = args.join(' ');

    if (!dmContent) {
      return message.channel.send("I can't DM an empty message.");
    }

    try {
      await user.send(dmContent);
      message.channel.send(`Successfully DM'd ${user.tag}!`);
    } catch (error) {
      console.error(`Error sending DM: ${error.message}`);
      return message.channel.send(`Failed send DM to ${user.tag}.`);
    }
  }
    

    /*----------------------------------------gamble commands---------------------------------------------------*/

    if (command === "register") {
      const userId = message.author.id;
      const username = message.content.split(' ')[1];

    if (!username) {
      return message.lineReply('Please provide a username to register.');
    }

    try {

      const [existingUsers] = await connection.query('SELECT * FROM tb_user_data WHERE user_id = ?', [userId]);
      if (existingUsers.length > 0) {
        return message.lineReply('You are already registered.');
      }


      await connection.query('INSERT INTO tb_user_data (user_id, username) VALUES (?, ?)', [userId, username]);
      message.lineReply('Registration successful!');
    } catch (error) {
      console.error(error);
      message.lineReply('An error occurred during registration.');
    }
  };

    if(command === "daily") {
      const userId = message.author.id;
      const [rows] = await connection.query('SELECT last_daily, daily_count FROM tb_user_data WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      return message.lineReply("You are not registered. `Type *register` to register.");
    }

    const cooldownTime = 24 * 60 * 60 * 1000; 
    const lastDaily = new Date(rows[0].last_daily).getTime();
    const currentTime = new Date().getTime();
    const timeSinceLastDaily = currentTime - lastDaily;

    if (timeSinceLastDaily < cooldownTime) {
      const remainingTime = cooldownTime - timeSinceLastDaily;
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

   return message.lineReply(`You can claim your daily reward again in \`${hours} hours, ${minutes} minutes\``);

    } else {

      const minReward = 500;
      const maxReward = 1000;
      const dailyReward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
      const newDailyCount = rows[0].daily_count + 1;

      await Promise.all([
        connection.query('UPDATE tb_user_data SET balance = balance + ?, last_daily = CURRENT_TIMESTAMP, daily_count = ? WHERE user_id = ?', [dailyReward, newDailyCount, userId])
      ]);

      message.lineReply(`You've claimed your daily reward and received ${dailyReward} coins!`);

    }

  };

  if (command === "bet") {
    const userId = message.author.id;
    const [userData] = await connection.query('SELECT * FROM tb_user_data WHERE user_id = ?', [userId]);

    if (userData.length === 0) {
      return message.lineReply("You are not registered. Type `*register <username>` to register.");
    }

    const { username, balance } = userData[0];
    const betAmount = parseInt(args[0], 10);

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.lineReply('Invalid bet amount. Please provide a positive number.');
    }

    if (betAmount > balance) {
      return message.lineReply('Insufficient balance for this bet.');
    }

    const isWin = Math.random() < 0.5;
    const result = isWin ? 'Won' : 'Lost';
    const outcome = isWin ? betAmount : -betAmount;

    await connection.query('UPDATE tb_user_data SET balance = balance + ?, ' +
    'total_gamble = total_gamble + 1, ' +
    (isWin ? 'win_count = win_count + 1' : 'lose_count = lose_count + 1') +
    ' WHERE user_id = ?', [outcome, userId]);

    const embedColor = isWin ? '#00ff00' : '#ff0000';
    const request = message.author.tag;
    const embed = new Discord.MessageEmbed()
      .setColor(embedColor)
      .setTitle(`${username}'s ${result} The Gambling`)
      .addField('Bet Amount', `${betAmount} coins`)
      .addField('Outcome', `${outcome > 0 ? `+${outcome}` : outcome} coins`)
      .addField('New Balance', `${balance + outcome} coins`)
      .setFooter(`Requested by ${request}`)
      .setTimestamp();

      if (embed.fields.length > 0) {
        message.lineReply(embed);
      } else {
        console.error('Error: Empty embed detected');
        message.lineReply('An error occurred while processing the gamble command.');
      }
    };

  if (command === "send") {
  const senderId = message.author.id;
  const receiverUser = message.mentions.users.first();
  const amount = parseInt(args[1], 10);

  // Validate input
  if (!receiverUser || !amount) {
    return message.lineReply("Invalid command usage. Please use: `*send <@user> <amount>` to send coins");
  }

  if (isNaN(amount) || amount <= 0) {
    return message.lineReply('Invalid amount. Please provide a positive number.');
  }


  // Check if sender and receiver are the same
  if (senderId === receiverUser.id) {
    return message.lineReply("You can't send coins to yourself.");

  } try {

    const [senderData] = await connection.query('SELECT balance FROM tb_user_data WHERE user_id = ?', [senderId]);

    if (senderData.length === 0) {
      return message.lineReply("You are not registered. Type `*register <username>` to register");
    }

    const senderBalance = senderData[0].balance;

    if (amount > senderBalance) {
      return message.lineReply("Insufficient balance to send this amount of coins.");
    }

    await connection.query('UPDATE tb_user_data SET balance = balance - ? WHERE user_id = ?', [amount, senderId]);

    try {
      const [receiverData] = await connection.query('SELECT balance FROM tb_user_data WHERE user_id = ?', [receiverUser.id]);

      if (receiverData.length === 0) {
        return message.lineReply("Receiver is not registered.");
      }

      await connection.query('UPDATE tb_user_data SET balance = balance + ? WHERE user_id = ?', [amount, receiverUser.id]);

      message.lineReply(`Successfully sent ${amount} coins to ${receiverUser.tag}`);
    } catch (receiveError) {
      console.error(receiveError);
      return message.lineReply("An error occurred while processing the receiver's balance.");
    }

  } catch (senderError) {
    console.error(senderError);
    return message.lineReply("An error occurred while processing the sender's balance.");
  }
  };

  if (command === "profile") {
      let targetUser = message.mentions.users.first() || message.author;
      const [userData] = await connection.query('SELECT * FROM tb_user_data WHERE user_id = ?', [targetUser.id]);
  
      if (userData.length === 0) {
        return message.lineReply(`${targetUser.tag} are not registered.`);
      }
  
      const { username, balance, total_gamble, daily_count } = userData[0];
      const request = message.author.tag;
      const avatarURL = targetUser.displayAvatarURL({ format: "png", dynamic: true });
      const embed = new Discord.MessageEmbed()
       .setColor('#0099ff')
       .setAuthor(`${username}'s Profile`, avatarURL)
       .addField('Username', username)
       .addField('Balance', `${balance} coins`)
       .addField('Total Bets', `${total_gamble}`)
       .addField('Win', `${userData[0].win_count}`)
       .addField('Lose', `${userData[0].lose_count}`)
       .addField('Daily Count', `${daily_count}`)
       .setFooter(`Requested by ${request}`)
       .setTimestamp();

      if (embed.fields.length > 0) {
        message.lineReply(embed);
      } else {
        console.error('Error: Empty embed detected');
        message.lineReply('An error occurred while fetching your profile.');
       }
    };
   
     /*-----------------------------------------punishment commands----------------------------------------------------*/

  if (command === "warn") {
      if (!message.member.permissions.has('KICK_MEMBERS')) {
        return message.lineReply(`You don't have enough permission to use this command.`);
    }

    const targetId = args[0];
        let targetUser;

        // Periksa apakah targetId adalah userID atau nickname
        if (targetId) {
            // Cek apakah targetId adalah userID
            let isValidUserId = true;
            let isValidUser = await client.users.fetch(targetId).catch(() => isValidUserId = false);
            if (!isValidUserId) {
                // Jika bukan userID, coba mencari dengan nickname di server
                const targetMember = message.guild.members.cache.find(member => member.nickname === targetId);
                if (targetMember) {
                    targetUser = targetMember.user;
                } else {
                    return message.lineReply('Invalid UserID or Nickname.');
                }
            } else {
                targetUser = isValidUser;
            }
        } else {
            return message.lineReply('Please provide UserID or Nickname you want to warn.');
        }

    let database = readDatabase();

    if (!database.warnings[targetUser.id]) {
        database.warnings[targetUser.id] = 0;
    }

    database.warnings[targetUser.id]++;

    writeDatabase(database);

    const reason = args.slice(targetId ? 1 : 0).join(' ') || 'No Reason';

    targetUser.send(`You have been warned in **${message.guild.name}** for: ${reason}. Total warnings: ${database.warnings[targetUser.id]}`)
        .then(() => {
            message.channel.send(`Successfully warned ${targetUser.tag} for: ${reason}. Total warnings: ${database.warnings[targetUser.id]}`);
        })
        .catch(error => {
            console.error(`Failed to warn ${targetUser.tag}:`, error);
            message.channel.send(`Failed to warn ${targetUser.tag}.`);
        });
     }
  
  if (command === "kick") {
    if (!message.member.hasPermission('KICK_MEMBERS')) {
      return message.lineReply(
        "You don't have enough permission to use this command."
      );
    }

    let user;
    let target = args[0];
    if (!target) {
      return message.lineReply("Please provide UserID or Nickname you want to kick.");
  } else {
      
      if (target.match(/^\d+$/)) {
          user = await client.users.fetch(target).catch(() => null);
      } else {
          
          user = message.guild.members.cache.find(member => member.nickname === target);
      }
  }

    if (!user) {
        return message.lineReply("Invalid UserID or Nickname.");
    }

    if (user.id === message.author.id) {
      return message.lineReply("You can't kick yourself");
    } else if (user.id === message.guild.ownerId) {
      return message.lineReply("You can't kick owner of the server");
    } else if (user.id === client.user.id) {
      return message.lineReply("You can't kick me :clown:");
    }

    let reason = args.slice(1).join(" ") || "No Reason";
    let member = message.guild.members.cache.get(user.id);

    member
    .kick({ reason: reason })
    .then(() => {
        
        message.channel.send(
            `Successfully kicked ${user.tag}, for: ${reason}, userID: ${user.id}`
        );
        
        user.send(`You have been kicked from **${message.guild.name}** for: ${reason}`)
            .catch(console.error); 
    })
    .catch(() => {
        return message.lineReply(
            "I don't have enough permission to kick this user."
        );
    });
  }

  if (command === "ban") {
    if (!message.member.hasPermission('BAN_MEMBERS')) {
      return message.lineReply(
          "You don't have enough permission to use this command."
      );
  }

  let user;
    let target = args[0];
    if (!target) {
      return message.lineReply("Please provide UserID or Nickname you want to ban.");
  } else {
      
      if (target.match(/^\d+$/)) {
          user = await client.users.fetch(target).catch(() => null);
      } else {
          
          user = message.guild.members.cache.find(member => member.nickname === target);
      }
  }

  if (!user) {
      return message.lineReply("Invalid userID or Nickname.");
  }

  if (user.id === message.author.id) {
      return message.lineReply("You can't ban yourself");
  } else if (user.id === message.guild.ownerId) {
      return message.lineReply("You can't ban owner of the server");
  } else if (user.id === client.user.id) {
      return message.lineReply("You can't ban me :clown:");
  }

  let reason = args.slice(1).join(" ") || "No Reason";
  let member = message.guild.members.cache.get(user.id);

  member
      .ban({ reason: reason })
      .then(() => {
          
          message.channel.send(
              `Successfully banned ${user.tag}, for: ${reason}, userID: ${user.id}`
          );
          
          user.send(`You have been banned from **${message.guild.name}** for: ${reason}`)
              .catch(console.error); 
      })
      .catch(() => {
          return message.lineReply(
              "I don't have enough permission to ban this user."
          );
      });
  }

  if (command === "unban") {
    if (!message.member.hasPermission('BAN_MEMBERS')) {
      return message.lineReply("You don't have enough permission to use this command.");
  }

  const userId = args[0];

  if (!userId) {
      return message.lineReply("Please provide the UserID you want to unban.");
  }

  try {

        const bans = await message.guild.fetchBans();
        const banInfo = bans.get(userId);

    if (!banInfo) {
        return message.lineReply("This user is not banned.");
    }

    await message.guild.members.unban(userId);

    message.lineReply(`Successfully unbanned ${banInfo.user.tag}`);
} catch (error) {

    console.error('Error while unbanning user:', error);
    message.lineReply('An error occurred while unbanning the user. Please try again later.');
}

  }

  if (command === "mute") {
    if (!message.member.hasPermission('MANAGE_ROLES')) {
      return message.lineReply(
          "You don't have enough permission to use this command."
      );
  }

    let user;
    let target = args[0];
    if (!target) {
      return message.lineReply("Please provide UserID or Nickname you want to mute.");
  } else {
      
      if (target.match(/^\d+$/)) {
          user = await client.users.fetch(target).catch(() => null);
      } else {
          
          user = message.guild.members.cache.find(member => member.nickname === target);
      }
  }

  if (!user) {
      return message.lineReply("Invalid UserID or Nickname.");
  }

  if (user.id === message.author.id) {
      return message.lineReply("You can't mute yourself");
  } else if (user.id === message.guild.ownerId) {
      return message.lineReply("You can't mute owner of the server");
  } else if (user.id === client.user.id) {
      return message.lineReply("You can't mute me :clown:");
  }

  let reason = args.slice(1).join(" ") || "No Reason";
  let member = message.guild.members.cache.get(user.id);

  let muteRole = message.guild.roles.cache.find(role => role.name === "Muted");
  if (!muteRole) {
    try {
      
      muteRole = await message.guild.roles.create({
          data: {
              name: "Muted",
              color: "#000000",
              permissions: []
          }
      });
  
      
      await Promise.all(
          message.guild.channels.cache.map(async (channel) => {
              await channel.updateOverwrite(muteRole, {
                  SEND_MESSAGES: false,
                  ADD_REACTIONS: false
              });
          })
      );
  

  } catch (err) {
      
      console.error('Error occurred while creating mute role and updating channel permissions:', err);
      message.channel.send("An error occurred while processing your request. Please try again later.");
  }

  } else {
    if (member.roles.cache.has(muteRole.id)) {
        return message.lineReply("This user has been muted.");
    } else {
        member.roles.add(muteRole).then(() => {
            message.channel.send(
                `Successfully muted ${user.tag}, for: ${reason}, userID: ${user.id}`
            );
            user.send(`You have been muted in **${message.guild.name}** for: ${reason}`).catch(console.error);
        }).catch(() => {
            return message.lineReply(
                "I don't have enough permission to mute this user."
            );
        });
    }
    }

  }

  if (command === "unmute") {
    if (!message.member.hasPermission('MANAGE_ROLES')) {
      return message.lineReply("You don't have enough permission to use this command.");
  }

  const userId = args[0];

  if (!userId) {
      return message.lineReply("Please provide the UserID you want to unmute.");
  }

  const user = message.guild.members.cache.get(userId);

  if (!user) {
      return message.lineReply("User not found. Please provide a valid UserID.");
  }

  const muteRole = message.guild.roles.cache.find(role => role.name === "Muted");

  if (!muteRole) {
      return message.lineReply("Mute role has not been set up yet.");
  }

  if (!user.roles.cache.has(muteRole.id)) {
      return message.lineReply("This user is not muted.");
  }

  try {
      await user.roles.remove(muteRole);
      message.lineReply(`Successfully unmuted user ${user.user.tag}`);
  } catch (error) {
      console.error('Error while unmuting user:', error);
      message.lineReply('An error occurred while unmuting the user. Please try again later.');
  }

  }

    /*-----------------------------------------other commands----------------------------------------------------*/


  if (command === "help") {
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(
        ` **__My current commands__**
 My prefix is ( * ) `
      )
      .addField(
        "🕹️ **__Fun__**",
        `***ship <@user>\n*ppsize\n*rps\n*fasttype / fast\n*hack <@user>**`
      )
      .addField(
        "🛠️ **__ Utility__**",
        `***test\n*nuke (To nuke a channel)\n*avatar <userID>\n*dm <userID> <message>\n*weather\n*snipe**`
      )
      .addField(
        "🎰 **__Gambling__**",
        `***register <username>\n*bet <amount>\n*send <@user> <amount>\n*daily\n*profile**`
      )
      .addField(
        "🚨 **__Moderating__**",
        `***warn <userID / nickname> <reason>\n*kick <userID / nickname> <reason>\n*ban <userID / nickname> <reason>\n*mute <userID / nickname> <reason>\n*unban <userID>\n*unmute <userID>**`
      )
      .setFooter(`Made by notququ`)
      .setTimestamp();

    return message.lineReply(embed);
  }
  
  if (command === "ttt") {
    const msg = await message.channel.send(printBoard());
        for (let i = 1; i <= 9; i++) {
            await msg.react(i.toString() + '\uFE0F\u20E3');
        }
  }
    
});


client.login(process.env.TOKEN);


