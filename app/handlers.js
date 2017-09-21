module.exports = (bot, api = {}) => {
    bot.on('/hi', msg => msg.reply.text("hello world"))
}