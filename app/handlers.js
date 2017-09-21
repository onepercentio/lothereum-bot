const fromWei = n => n/1000000000000000000
const moment = require('moment')

module.exports = (bot, api = {}) => {
    bot.on(/^\/balance (.+)$/, async (msg, props) => {
        const address = props.match[1];
        if(address.length !== 42) return msg.reply.text("Invalid address.")

        let balance = await api.getBalance({ address })
        msg.reply.text(`Balance for ${address} is ${fromWei(balance)} ether.`)
    })

    bot.on(/^\/tickets (.+)$/, async (msg, props) => {
        const address = props.match[1];
        if(address.length !== 42) return msg.reply.text("Invalid address.")

        let tickets = await api.getTickets({ address, contractAddress: "0x7b501bbd3b3e5d8cae9a56fe5459e16e9dadb439" })
        let ticketsString = tickets.reduce((lottos, ticket) => {
            let lotto = lottos.find(lotto => lotto.id === ticket.lotteryId)
            let ticketInfo = {
                id: ticket.id,
                numbers: ticket.numbers
            }
            lotto ? lotto.tickets.push(ticketInfo) : lottos.push({ id: ticket.lotteryId, tickets: [ticketInfo]})
            return lottos
        }, []).map( lotto => `Lottery #${lotto.id}:\n${
            lotto.tickets.map(ticket => `   Ticket #${ticket.id}  ${ticket.numbers.join(" ")}`).join("\n")
        }`).join("\n")
        bot.sendMessage(msg.from.id, `Tickets for ${address}\n${ticketsString}`, { parse_mode: "markdown" })
    })

    bot.on("/lotteries", async msg => {
        let lotteries = await api.getLotteries()
        let reply = `Lotteries:\n`
        reply += lotteries.map(lotto => {
            return `  ${lotto.name}\n` +
            `  Ticket price: ${fromWei(lotto.ticketPrice)} ether\n`+
            `  Next drawing: ${moment.unix(lotto.nextDrawingDate).format('lll')}`
        }).join("\n")
        msg.reply.text(reply)
    })
}