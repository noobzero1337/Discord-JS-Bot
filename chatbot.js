require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
    allowedMentions: {
      parse: [`users`, `roles`],
      repliedUser: true,
  
    },
    intens: [
      "GUILDS",
      "GUILDS_MESSAGES",
      "GUILDS_PRESENCES",
      "GUILD_MEMBERS",
      "GUILD_MESSAGE_REACTIONS",  
    ],
  });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_SECRET,
})
const openai = new OpenAIApi(configuration);

client.on('MessageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channelID != "885717268837842975") return;
    if (message.content.startWith("*")) return;

    try {
        const result = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `${client.user.username} is a friendly chatbot.
            
            ${client.user.username}: Hello, how can i help you?
            ${message.author.username}: ${message.content}
            ${client.user.username}:
            `,
        });

        message.reply(result.data.choices[0].text)
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
});