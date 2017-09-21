const config = require('./config.json')
if(!config) {
    console.error("Config file not found (config.json).")
    process.exit(1)
}

const TeleBot = require('telebot')
const bot = new TeleBot(config.telegram_token)


const defineMessageHandlers = require('./app/handlers')

defineMessageHandlers(bot)

bot.start()