const chalk = require('chalk')
const devp2p = require('../lib')
const { DPT } = require('../lib')
const Buffer = require('safe-buffer').Buffer
const crypto = require('crypto')
const protocol = require('./simple-proto')

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
    {
      name: 'bc',
      version: 1,
      length: 10,
      constructor: protocol
    }
  ],
  remoteClientIdFilter: null,
  listenPort: null
})

const getPeerAddr = (peer) => `${peer._socket.remoteAddress}:${peer._socket.remotePort}`

rlpx.on('peer:added', (peer) => {
  // const protocols = peer.getProtocols()
  // console.log('protocols', protocols)

  const protocol = peer.getProtocols()[0]
  protocol.sendStatus({
    networkId: 1,
    td: devp2p._util.int2buffer(123), // total difficulty in genesis block
    bestHash: Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex'),
    genesisHash: Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex')
  })

  protocol.once('status', () => {
    console.log('rlpx - status')
  })

  protocol.on('message', async (code, payload) => {
    console.log('rlpx - message', code, payload)
  })

  console.log(chalk.green(`New peer: ${getPeerAddr(peer)} (total: ${rlpx.getPeers().length})`))
})

rlpx.on('peer:removed', (peer) => {
  console.log(chalk.yellow(`Remove peer: ${getPeerAddr(peer)} (total: ${rlpx.getPeers().length})`))
})

// for accept incoming connections uncomment next line
rlpx.listen(30303, '0.0.0.0')
dpt.bind(30303, '0.0.0.0')
