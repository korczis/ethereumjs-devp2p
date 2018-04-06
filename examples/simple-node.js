const chalk = require('chalk')
const devp2p = require('../lib')
const { DPT } = require('../lib')
const Buffer = require('safe-buffer').Buffer
const crypto = require('crypto')

const PRIVATE_KEY = crypto.randomBytes(32)
const BOOTNODES = [
  {
    address: '127.0.0.1',
    udpPort: 30303,
    tcpPort: 30303
  }
]

const port = Math.floor(Math.random() * 65535)
const dpt = new DPT(Buffer.from(PRIVATE_KEY, 'hex'), {
  endpoint: {
    address: '0.0.0.0',
    udpPort: port,
    tcpPort: port
  }
})

dpt.on('error', (err) => console.error(chalk.red(err.stack || err)))

const rlpx = new devp2p.RLPx(PRIVATE_KEY, {
  dpt: dpt,
  maxPeers: 25,
  capabilities: [
    devp2p.ETH.eth63,
    devp2p.ETH.eth62
  ],
  remoteClientIdFilter: null,
  listenPort: null
})

const getPeerAddr = (peer) => `${peer._socket.remoteAddress}:${peer._socket.remotePort}`

rlpx.on('peer:added', (peer) => {
  console.log(chalk.green(`New peer: ${getPeerAddr(peer)} (total: ${rlpx.getPeers().length})`))
})

rlpx.on('peer:removed', (peer) => {
  console.log(chalk.yellow(`Remove peer: ${getPeerAddr(peer)} (total: ${rlpx.getPeers().length})`))
})

// for accept incoming connections uncomment next line
rlpx.listen(port, '0.0.0.0')
dpt.bind(port, '0.0.0.0')

for (let bootnode of BOOTNODES) {
  dpt.bootstrap(bootnode).catch((err) => console.error(chalk.bold.red(err.stack || err)))
}
