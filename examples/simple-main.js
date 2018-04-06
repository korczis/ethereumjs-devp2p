const chalk = require('chalk')
const devp2p = require('../lib')
const { DPT } = require('../lib')
const Buffer = require('safe-buffer').Buffer
const crypto = require('crypto')

const PRIVATE_KEY = crypto.randomBytes(32)

const dpt = new DPT(Buffer.from(PRIVATE_KEY, 'hex'), {
  endpoint: {
    address: '0.0.0.0',
    udpPort: null,
    tcpPort: null
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
rlpx.listen(30303, '0.0.0.0')
dpt.bind(30303, '0.0.0.0')
