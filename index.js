const Discord = require('discord.js');
const weather = require('weather-js');
const { MessageEmbed } = require('discord.js');
const lineReply = require('discord-reply');
const jsoning = require('jsoning');
const database = new jsoning('bank.json');
require('dotenv/config');
const botgpt = require('./chatbot.js');

const { channelId } = require('./config.json');
const { createPool } = require('mysql2/promise');
require('dotenv').config();

const deletedMessages = {};

const connection = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
});

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

  if (message.content === "p") {
    message.channel.send("ppoong");
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
        if (!city) return message.channel.send("Please insert the city name.");
        if (err || result === undefined || result.length === 0)
          return message.channel.send(
            "Unknown city. Perhaps a typo or maybe not a city?"
          );

        let current = result[0].current;
        let location = result[0].location;

        const embed = new Discord.MessageEmbed()
          .setAuthor(current.observationpoint)
          .setDescription(`${current.skytext}`)
          .setThumbnail(current.imageUrl)
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
      const [rows] = await connection.query('SELECT last_daily FROM tb_user_data WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      return message.lineReply("You are not registered. `Type *register` to register.");
    }

    const cooldownTime = 24 * 60 * 60 * 1000; 
    const lastDaily = new Date(rows[0].last_daily).getTime();
    const currentTime = new Date().getTime();

    if (currentTime - lastDaily < cooldownTime) {
      const remainingTime = cooldownTime - (currentTime - lastDaily);

      function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        return `\`${hours} hours\``;
    }

    message.lineReply(`You can claim your daily reward again in ${formatTime(remainingTime / 1000)}`);

    } else {

      const minReward = 500;
      const maxReward = 1000;
      const dailyReward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
      await connection.query('UPDATE tb_user_data SET balance = balance + ?, last_daily = CURRENT_TIMESTAMP WHERE user_id = ?', [dailyReward, userId]);
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
    const result = isWin ? 'Win' : 'Lose';
    const outcome = isWin ? betAmount : -betAmount;

    await connection.query('UPDATE tb_user_data SET balance = balance + ?, ' +
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
      console.error(receiverError);
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
  
      const { username, balance } = userData[0];
      const request = message.author.tag;
      const avatarURL = targetUser.displayAvatarURL({ format: "png", dynamic: true });
      const embed = new Discord.MessageEmbed()
       .setColor('#0099ff')
       .setAuthor(`${username}'s Profile`, avatarURL)
       .addField('Username', username)
       .addField('Balance', `${balance} coins`)
       .addField('Win', `${userData[0].win_count}`)
       .addField('Lose', `${userData[0].lose_count}`)
       .setFooter(`Requested by ${request}`)
       .setTimestamp();

      if (embed.fields.length > 0) {
        message.lineReply(embed);
      } else {
        console.error('Error: Empty embed detected');
        message.lineReply('An error occurred while fetching your profile.');
       }
    };
    


    /*-----------------------------------------other commands----------------------------------------------------*/

  if (command === "help") {
    let user = message.mentions.users.first();
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(
        ` **__My current commands__**
My prefix is ( * ) `
      )
      .addField(
        "🕹️ **__Fun__**",
        `***ship <user>\n*ppsize\n*rps\n*fasttype / fast**`
      )
      .addField(
        "🛠️ **__ Utility__**",
        `***test\n*avatar <userID>\n*dm <user ID> <text>\n*weather\n*snipe**`
      )
      .addField(
        "🎰 **__Gambling__**",
        `***register <username>\n*bet <amount>\n*send <@user> <amount>\n*daily\n*profile**`
      )
      .setFooter(`Made by notququ`)
      .setTimestamp();

    return message.lineReply(embed);
  }

})

client.login(process.env.TOKEN);


