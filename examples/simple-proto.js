const EventEmitter = require('events')
const rlp = require('rlp-encoding')
const devp2p = require('../lib')

const MESSAGE_CODES = {
  // eth62
  STATUS: 0x00,
  NEW_BLOCK_HASHES: 0x01,
  TX: 0x02,
  GET_BLOCK_HEADERS: 0x03,
  BLOCK_HEADERS: 0x04,
  GET_BLOCK_BODIES: 0x05,
  BLOCK_BODIES: 0x06,
  NEW_BLOCK: 0x07,

  // eth63
  GET_NODE_DATA: 0x0d,
  NODE_DATA: 0x0e,
  GET_RECEIPTS: 0x0f,
  RECEIPTS: 0x10
}

class BC extends EventEmitter {
  constructor (version, peer, send) {
    super()

    this._version = version
    this._peer = peer
    this._send = send
  }

  _handleMessage (code, data) {
    console.log('_handleMessage', code, data)
  }

  _handleStatus () {
    console.log('_handleStatus')

    this.emit('status', {
      networkId: 1,
      td: devp2p._util.int2buffer(123), // total difficulty in genesis block
      bestHash: Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex'),
      genesisHash: Buffer.from('d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 'hex')
    })
  }

  getVersion () {
    console.log('getVersion')

    return this._version
  }

  _getStatusString (status) {
    console.log('_getStatusString', status)

    return JSON.stringify(status)
  }

  sendStatus (status) {
    console.log('sendStatus', status)

    const payload = [
      // devp2p._util.int2buffer(1), // version
      devp2p._util.int2buffer(1), // networkId
      devp2p._util.int2buffer(123), // td
      'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', // bestHash
      'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3' // genesisHash
    ]

    this._send(MESSAGE_CODES.STATUS, rlp.encode(payload))
    this._handleStatus()
  }

  sendMessage (code, payload) {
    console.log('sendMessage', code, payload)
  }

  getMsgPrefix (msgCode) {
    console.log('getMsgPrefix', msgCode)
  }
}

BC.MESSAGE_CODES = MESSAGE_CODES

module.exports = BC
