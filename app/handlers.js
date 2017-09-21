const fromWei = n => n/1000000000000000000
const moment = require('moment')

module.exports = (bot, api = {}) => {
    bot.on("/help", async msg => {
        msg.reply.text(
            `Available commands:\n` +
            `/balance <address> - Displays the account balance for the address\n` +
            `/tickets <address> - Displays lottery tickets for the address\n` +
            `/lotteries - Shows available lottery information\n` +
            `/buy <privatekey> <numbers> - Buy a ticket for the current lottery Example: /buy 0xPr1V4t3K3y 1,2,3,4`
        )
    })

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

    bot.on(/^\/buy (.+)$/, async (msg, props) => {
        let inputs = props.match[1].split(' ')
        let privateKey = inputs[0]
        let numbers = inputs[1].split(',')

        let result = ''
        msg.reply.text("Thank you for your purchase! Your ticket is being processed ...")
        try {
            result = await api.buyTicket({ numbers, privateKey, ticektPrice: "10000000000000000", contractAddress: "0x7b501bbd3b3e5d8cae9a56fe5459e16e9dadb439"})
        } catch(e) {
            result = e.message
        }
        console.log('buy', result)
        msg.reply.text(result)
    })
}