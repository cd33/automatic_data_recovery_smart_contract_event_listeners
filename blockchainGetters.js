require('dotenv').config()
const { ethers } = require('ethers')
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA)
const address721 = 'XXX'
const Contract721 = require('./Bibs721.json')
const contract721 = new ethers.Contract(address721, Contract721.abi, provider)

module.exports = {
  getFrontData: async function getFrontData() {
    const notPaused721 = await contract721.notPaused()
    const salePrice = await contract721.salePrice()
    const nextNFT = await contract721.nextNFT()
    const limitNFT = await contract721.limitNFT()

    return {
      notPaused721,
      salePrice,
      nextNFT,
      limitNFT,
    }
  },

  // **************************** LISTENERS ****************************
  eventInitializedMintFront: async function eventInitializedMintFront() {
    const salePrice = await contract721.salePrice()
    const nextNFT = await contract721.nextNFT()
    const limitNFT = await contract721.limitNFT()
    return { salePrice, nextNFT, limitNFT }
  },

  eventPriceUpdatedFront: async function eventPriceUpdatedFront() {
    const salePrice = await contract721.salePrice()
    return { salePrice }
  },

  eventPauseUpdatedNFTFront: async function eventPauseUpdatedNFT() {
    const notPaused = await contract721.notPaused()
    return { notPaused }
  },

  eventTransferMintFront: async function eventTransferMintFront() {
    const nextNFT = await contract721.nextNFT()
    return { nextNFT }
  },

  backUpBalanceSingle: async function backUpBalanceSingle(address) {
    let tempArray = []
    const nextNFT = await contract721.nextNFT()

    console.log('Récupération des NFTs en cours...')
    for (let i = 1; i <= nextNFT; i++) {
      console.log('i', i)
      const ownerNFT = await contract721.ownerOf(i)
      if (address === ownerNFT) {
        tempArray.push(i)
      }
    }
    return { address, tempArray }
  },

  backUpBalance: async function backUpBalance() {
    let results = []
    const nextNFT = await contract721.nextNFT()
    const addresses = []

    console.log('Récupération des NFTs en cours...')
    for (let i = 1; i <= nextNFT; i++) {
      console.log('i', i)
      const ownerNFT = await contract721.ownerOf(i)

      if (addresses.includes(ownerNFT)) {
        const tempArray = results.filter(e => e.address === ownerNFT)
        tempArray[0].ownedTokens.push(i)
        results.map(e => e.address === ownerNFT ? {...e, tempArray} : e);
      } else {
        addresses.push(ownerNFT)
        results.push({address: ownerNFT, ownedTokens: [i]})
      }
    }
    return { results }
  },
}
