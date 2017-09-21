const Web3 = require('web3')
const apiCalls = require('./calls')

module.exports = (ethNode) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(ethNode))
    return apiCalls(web3)
}