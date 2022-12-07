// CONFIGURATION
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// Firebase
const admin = require('firebase-admin')
const credentials = require('./key.json')
admin.initializeApp({
  credential: admin.credential.cert(credentials),
})
const db = admin.firestore()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

// CORS Permissions, https://stackoverflow.com/questions/39988356/fetching-post-data-from-api-node-js-react
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

require('dotenv').config()
const { ethers } = require('ethers')
const blockchain = require('./blockchainGetters')
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA)
const address721 = 'XXX'
const Contract721 = require('./Bibs721.json')
const contract721 = new ethers.Contract(address721, Contract721.abi, provider)

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// FONCTIONS RECUPERATION BLOCKCHAIN ET ECRITURE BDD
async function getFrontDataFromETH() {
  const data = await blockchain.getFrontData()
  await db
    .collection('Front')
    .doc('NFT')
    .set({
      notPaused: data.notPaused721,
      salePrice: parseInt(data.salePrice),
      nextNFT: parseInt(data.nextNFT),
      limitNFT: parseInt(data.limitNFT),
    })
    .then(() => {
      console.log('getFrontData, Success: Data writed in db')
    })
    .catch((err) => console.log('getFrontData, ', err))
}

// ******************************** LISTENERS ********************************
async function eventsListeners() {
  console.log('Listeners activés')
  contract721.on('InitializedMint', (tokenId) => {
    console.log(
      'Event InitializedMint, mint initialized with NFT',
      parseInt(tokenId),
    )
    eventInitializedMint()
  })

  contract721.on('PriceUpdated', (salePrice) => {
    console.log('Event PriceUpdated, updated price', parseInt(salePrice))
    eventPriceUpdated()
  })

  contract721.on('PauseUpdated', (notPaused) => {
    console.log('Event PauseUpdated NFT, updated pause', notPaused)
    eventPauseUpdatedNFT()
  })

  contract721.on('Transfer', (from, to, id) => {
    if (from === '0x0000000000000000000000000000000000000000') {
      console.log('Event Transfer, minted NFT', parseInt(id), 'to', to)
      eventTransferMint(to, id)
    }
  })

  contract721.on('Transfer', (from, to, id) => {
    if (from !== '0x0000000000000000000000000000000000000000') {
      console.log(
        'Event Transfer, transfered NFT',
        parseInt(id),
        'from',
        from,
        'to',
        to,
      )
      eventTransferBalance(from, to, id)
    }
  })
}

async function eventInitializedMint() {
  const dataFront = await blockchain.eventInitializedMintFront()
  await db
    .collection('Front')
    .doc('NFT')
    .update({
      salePrice: parseInt(dataFront.salePrice),
      nextNFT: parseInt(dataFront.nextNFT),
      limitNFT: parseInt(dataFront.limitNFT),
    })
    .then(() => {
      console.log('eventInitializedMintFront, Success: Data writed in db')
    })
    .catch((err) => console.log('eventInitializedMintFront, ', err))
}

async function eventPriceUpdated() {
  const dataFront = await blockchain.eventPriceUpdatedFront()
  await db
    .collection('Front')
    .doc('NFT')
    .update({ salePrice: parseInt(dataFront.salePrice) })
    .then(() => {
      console.log('eventPriceUpdatedFront, Success: Data writed in db')
    })
    .catch((err) => console.log('eventPriceUpdatedFront, ', err))
}

async function eventPauseUpdatedNFT() {
  const dataFront = await blockchain.eventPauseUpdatedNFTFront()
  await db
    .collection('Front')
    .doc('NFT')
    .update({ notPaused: dataFront.notPaused })
    .then(() => {
      console.log('eventPauseUpdatedNFTFront, Success: Data writed in db')
    })
    .catch((err) => console.log('eventPauseUpdatedNFTFront, ', err))
}

async function eventTransferMint(to, id) {
  const dataBalance = await db.collection('Balance').doc(to).get()
  if (!dataBalance.data() || !dataBalance.data().ownedTokens) {
    const ownedTokens = []
    await db
      .collection('Balance')
      .doc(to)
      .set({ ownedTokens })
      .then(() => {
        console.log('ownedTokens ' + to + ' created')
      })
      .catch((err) => console.log('eventTransferBalance ' + to + ', ' + err))
    await sleep(2000) // Pour laisser le temps à firestore d'initier l'array
  }

  const dataFront = await blockchain.eventTransferMintFront()
  await db
    .collection('Front')
    .doc('NFT')
    .update({ nextNFT: parseInt(dataFront.nextNFT) })
    .then(() => {
      console.log('eventTransferMintFront, Success: Data writed in db')
    })
    .catch((err) => console.log('eventTransferMintFront, ', err))

  await db
    .collection('Balance')
    .doc(to)
    .update({
      ownedTokens: admin.firestore.FieldValue.arrayUnion(parseInt(id)),
    })
    .then(() => {
      console.log('eventTransferBalance ' + to + ', Success: Data writed in db')
    })
    .catch((err) => console.log('eventTransferBalance, ', err))
}

async function eventTransferBalance(from, to, id) {
  const dataBalanceTo = await db.collection('Balance').doc(to).get()
  if (!dataBalanceTo.data() || !dataBalanceTo.data().ownedTokens) {
    const ownedTokens = []
    await db
      .collection('Balance')
      .doc(to)
      .set({ ownedTokens })
      .then(() => {
        console.log('ownedTokens ' + to + ' created')
      })
      .catch((err) => console.log('eventTransferBalance ' + to + ', ' + err))
    await sleep(2000) // Pour laisser le temps à firestore d'initier l'array
  }

  const dataBalanceFrom = await db.collection('Balance').doc(from).get()
  if (dataBalanceFrom.data() && dataBalanceFrom.data().ownedTokens) {
    await db
      .collection('Balance')
      .doc(from)
      .update({
        ownedTokens: admin.firestore.FieldValue.arrayRemove(parseInt(id)),
      })
      .then(() => {
        console.log(
          'eventTransferBalance ' + from + ', Success: Data writed in db',
        )
      })
      .catch((err) => console.log('eventTransferBalance, ', err))
  }

  await db
    .collection('Balance')
    .doc(to)
    .update({
      ownedTokens: admin.firestore.FieldValue.arrayUnion(parseInt(id)),
    })
    .then(() => {
      console.log('eventTransferBalance ' + to + ', Success: Data writed in db')
    })
    .catch((err) => console.log('eventTransferBalance ' + to + ', ' + err))
}

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

eventsListeners()
// getFrontDataFromETH()

// // TESTS LISTENERS
// eventInitializedMint()
// eventPriceUpdated()
// eventPauseUpdatedNFT()
// eventTransferMint("0xdB4D6160532835f8Be98f3682eD165D5Ce02ECf9", 2)
// eventTransferBalance(
//   '0xdB4D6160532835f8Be98f3682eD165D5Ce02ECf9',
//   '0xD9453F5E2696604703076835496F81c3753C3Bb3',
//   2,
// )