import pkg from 'web3-utils'
import InputDataDecoder from 'ethereum-input-data-decoder'
import ERC20 from '../../rpcHooks/ABI/js/ERC20.js'
import Ubeswap from '../../rpcHooks/ABI/js/Ubeswap.js'
import Moola from '../../rpcHooks/ABI/js/Moola.js'
import MoolaAirdrop from '../../rpcHooks/ABI/js/MoolaAirdrop.js'
import BatchRequest from '../../rpcHooks/ABI/js/BatchRequest.js'
import Sablier from '../../rpcHooks/ABI/js/Sablier.js' // Also Xeggo
import CeloTerminal from '../../rpcHooks/ABI/js/CeloTerminal.js'
import GnosisSafe from '../../rpcHooks/ABI/js/Gnosis.js'
import Web3 from 'web3'
import CyberBoxABI from '../../rpcHooks/ABI/js/CyberBox.js'

const { hexToNumberString } = pkg

const ERC20MethodIds = {
  transferFrom: 'transferFrom',
  transfer: 'transfer',
  transferWithComment: 'transferWithComment',
  approve: 'approve',
  batchRequest: 'batchRequest',
  swap: 'swap',

  automatedTransfer: 'automatedTransfer',
  automatedCanceled: 'automatedCanceled',
  automatedBatchRequest: 'automatedBatchRequest',

  nftTokenERC721: 'nftTokenERC721',

  reward: 'reward',
  borrow: 'borrow',
  deposit: 'deposit',
  withdraw: 'withdraw',
  repay: 'repay',

  rejection: '0x1',

  addOwner: 'addOwner',
  removeOwner: 'removeOwner',
  changeThreshold: 'changeThreshold',
  changeInternalThreshold: 'changeInternalThreshold',

  noInput: '0x',
}

export default async ({
  input,
  transaction,
  tags,
  Coins,
  blockchain,
  address,
  provider,
}) => {
  try {
    const theTags = tags.filter((s) =>
      s.transactions.find(
        (t) =>
          t.hash?.toLowerCase() === transaction.hash?.toLowerCase() &&
          t.address?.toLowerCase() === address?.toLowerCase(),
      ),
    )

    if (transaction.tokenID) {
      let decoder = new InputDataDecoder(CyberBoxABI)
      let res = decoder.decodeData(input)

      return {
        // rawData: transaction,
        rawData: {
          ...transaction,
          value: +hexToNumberString(res.inputs[2]) / 10 ** 18,
        },
        method: ERC20MethodIds.nftTokenERC721,
        hash: transaction.hash,
        id: ERC20MethodIds.nftTokenERC721,
        tags: theTags,
      }
    }

    let decoder = new InputDataDecoder(ERC20)
    let result = decoder.decodeData(input)
    if (!result.method) {
      decoder = new InputDataDecoder(Ubeswap.output.abi)
      result = decoder.decodeData(input)
      if (!result.method) {
        decoder = new InputDataDecoder(Moola.abi)
        result = decoder.decodeData(input)
        if (!result.method) {
          decoder = new InputDataDecoder(BatchRequest.abi)
          result = decoder.decodeData(input)
          if (!result.method) {
            decoder = new InputDataDecoder(Sablier.abi)
            result = decoder.decodeData(input)
            if (!result.method) {
              decoder = new InputDataDecoder(MoolaAirdrop)
              result = decoder.decodeData(input)
              if (!result.method && provider === 'Celo Terminal') {
                decoder = new InputDataDecoder(CeloTerminal.abi)
                result = decoder.decodeData(input)
              } else if (!result.method && provider === 'GnosisSafe') {
                decoder = new InputDataDecoder(GnosisSafe)
                result = decoder.decodeData(input)
              }
            }
          }
        }
      }
    }

    const coin = Object.values(Coins).find(
      (s) =>
        s.address?.toLowerCase() === transaction?.to?.toLowerCase() ||
        s.address?.toLowerCase() ===
          transaction?.contractAddress?.toLowerCase(),
    )

    if (!result.method) {
      if (!coin) return { method: null }
      return {
        method: ERC20MethodIds.noInput,
        id: ERC20MethodIds.noInput,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.value.toString(),
        coin: coin,
        tags: theTags,
      }
    } else if (result.method === ERC20MethodIds.transferFrom) {
      if (!coin) return { method: null }
      return {
        method: ERC20MethodIds.transferFrom,
        id: ERC20MethodIds.transferFrom,
        coin: coin,
        from: result.inputs[0],
        to: result.inputs[1],
        amount: result.inputs[2].toString(),
        tags: theTags,
      }
    } else if (result.method === ERC20MethodIds.transfer) {
      if (!coin) return { method: null }
      return {
        method: ERC20MethodIds.transfer,
        id: ERC20MethodIds.transfer,
        coin: coin,
        to: '0x' + result.inputs[0],
        amount: result.inputs[1].toString(),
        tags: theTags,
      }
    } else if (
      (result.method === 'changeInternalRequirement' ||
        result.method === 'changeRequirement') &&
      provider === 'Celo Terminal'
    ) {
      // Celo Terminal
      return {
        method:
          result.method === 'changeInternalRequirement'
            ? ERC20MethodIds.changeInternalThreshold
            : ERC20MethodIds.changeThreshold,
        id:
          result.method === 'changeInternalRequirement'
            ? ERC20MethodIds.changeInternalThreshold
            : ERC20MethodIds.changeThreshold,
        amount: result.inputs[0].toString(),
        tags: theTags,
      }
    } else if (
      result.method === 'changeThreshold' &&
      provider === 'GnosisSafe'
    ) {
      return {
        method: ERC20MethodIds.changeThreshold,
        id: ERC20MethodIds.changeThreshold,
        amount: result.inputs[0].toString(),
        tags: theTags,
      }
    } else if (
      result.method === 'removeOwner' &&
      provider === 'Celo Terminal'
    ) {
      // Celo Terminal
      return {
        method: ERC20MethodIds.removeOwner,
        id: ERC20MethodIds.removeOwner,
        to: '0x' + result.inputs[0],
        tags: theTags,
      }
    } else if (result.method === 'removeOwner' && provider === 'GnosisSafe') {
      // Gnosis Safe
      return {
        method: ERC20MethodIds.removeOwner,
        id: ERC20MethodIds.removeOwner,
        to: '0x' + result.inputs[1],
        tags: theTags,
      }
    } else if (result.method === 'addOwner' && provider === 'Celo Terminal') {
      // Celo Terminal
      return {
        method: ERC20MethodIds.addOwner,
        id: ERC20MethodIds.addOwner,
        to: '0x' + result.inputs[0],
        tags: theTags,
      }
    } else if (
      result.method === 'addOwnerWithThreshold' &&
      provider === 'GnosisSafe'
    ) {
      // Gnosis Safe
      return {
        method: ERC20MethodIds.addOwner,
        id: ERC20MethodIds.addOwner,
        to: '0x' + result.inputs[0],
        tags: theTags,
      }
    } else if (
      result.method === 'swapExactTokensForTokens' ||
      result.method === 'swapTokensForExactTokens' ||
      result.method === 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
    ) {
      const coins = Object.values(Coins)
      return {
        method: ERC20MethodIds.swap,
        id: ERC20MethodIds.swap,
        amountIn:
          result.method === 'swapExactTokensForTokens' ||
          result.method ===
            'swapExactTokensForTokensSupportingFeeOnTransferTokens'
            ? result.inputs[0].toString()
            : result.inputs[1].toString(),
        amountOutMin:
          result.method === 'swapExactTokensForTokens' ||
          result.method ===
            'swapExactTokensForTokensSupportingFeeOnTransferTokens'
            ? result.inputs[1].toString()
            : result.inputs[0].toString(),
        coinIn: coins.find(
          (s) =>
            s.address?.toLowerCase() ===
            '0x' + result.inputs[2][0]?.toLowerCase(),
        ),
        coinOutMin: coins.find(
          (s) =>
            s.address?.toLowerCase() ===
            '0x' + result.inputs[2][1]?.toLowerCase(),
        ),
        tags: theTags,
      }
    } else if (result.method === 'executeTransactions') {
      const txList = []
      const splitData = result.inputs[2].substring(2).split('23b872dd')
      for (let i = 0; i < result.inputs[0].length; i++) {
        const coin = Object.values(Coins).find(
          (s) =>
            s.address?.toLowerCase() ===
            '0x' + result.inputs[0][i]?.toLowerCase(),
        )

        let decoder = new InputDataDecoder(ERC20)
        let erc = decoder.decodeData(
          splitData.length > 1 ? `0x23b872dd${splitData[i]}` : result.inputs[2],
        )
        if (
          coin &&
          (erc.method === ERC20MethodIds.transferFrom ||
            erc.method === ERC20MethodIds.transfer)
        ) {
          txList.push({
            coin: coin,
            from:
              erc.method === ERC20MethodIds.transferFrom
                ? '0x' + erc.inputs[0]
                : undefined,
            to:
              erc.method === ERC20MethodIds.transferFrom
                ? '0x' + erc.inputs[1]
                : '0x' + erc.inputs[0],
            amount:
              erc.method === ERC20MethodIds.transferFrom
                ? erc.inputs[2].toString()
                : erc.inputs[1].toString(),
          })
        }
      }
      return {
        method: ERC20MethodIds.batchRequest,
        id: ERC20MethodIds.batchRequest,
        payments: txList,
        tags: theTags,
      }
    } else if (result.method === 'cancelStream') {
      const web3 = new Web3(blockchain.rpcUrl)
      const contract = new web3.eth.Contract(
        blockchain.recurringPaymentProtocols[0].abi,
        blockchain.recurringPaymentProtocols[0].contractAddress,
      )
      const details = await contract.methods
        .getStream(
          result.inputs[0].startsWith('0x')
            ? result.inputs[0]
            : '0x' + result.inputs[0],
        )
        .call()
      const coin = Object.values(Coins).find(
        (s) =>
          s.address.toLowerCase() === details['tokenAddress'].toLowerCase(),
      )
      if (!coin) return {}

      const res = {
        coin: coin,
        to: details['recipient'],
        amount: details['deposit'],
        endTime: details['stopTime'],
        startTime: details['startTime'],
        method: ERC20MethodIds.automatedCanceled,
        id: ERC20MethodIds.automatedCanceled,
        streamId: result.inputs[0].startsWith('0x')
          ? result.inputs[0]
          : '0x' + result.inputs[0],
        tags: theTags,
      }
      return res
    } else if (result.method === 'createStream') {
      const web3 = new Web3(blockchain.rpcUrl)
      const topic = (await web3.eth.getTransactionReceipt(transaction.hash))
        ?.logs[1]?.topics[1]
      if (!topic) return {}
      const streamId = hexToNumberString(topic)
      const coin = Object.values(Coins).find(
        (s) =>
          s.address?.toLowerCase() ===
          '0x' + result.inputs[2].toString()?.toLowerCase(),
      )
      if (!coin) return {}
      const res = {
        method: ERC20MethodIds.automatedTransfer,
        id: ERC20MethodIds.automatedTransfer,
        tags: theTags,
        startTime: result.inputs[3].toString(),
        endTime: result.inputs[4].toString(),
        to: '0x' + result.inputs[0].toString(),
        coin: coin,
        amount: result.inputs[1].toString(),
        streamId,
      }
      return res
    } else if (result.method === ERC20MethodIds.borrow) {
      const coins = Object.values(Coins)
      return {
        method: ERC20MethodIds.borrow,
        id: ERC20MethodIds.borrow,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + result.inputs[0]?.toLowerCase(),
        ),
        amount: result.inputs[1].toString(),
        to: result.inputs[0],
        tags: theTags,
      }
    } else if (result.method === ERC20MethodIds.deposit) {
      const coins = Object.values(Coins)
      return {
        method: ERC20MethodIds.deposit,
        id: ERC20MethodIds.deposit,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + result.inputs[0]?.toLowerCase(),
        ),
        amount: result.inputs[1].toString(),
        to: '0x' + result.inputs[0],
        tags: theTags,
      }
    } else if (result.method === ERC20MethodIds.withdraw) {
      const coins = Object.values(Coins)
      return {
        method: ERC20MethodIds.withdraw,
        id: ERC20MethodIds.withdraw,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + result.inputs[0]?.toLowerCase(),
        ),
        amount: result.inputs[1].toString(),
        to: '0x' + result.inputs[0],
        tags: theTags,
      }
    } else if (result.method === ERC20MethodIds.repay) {
      const coins = Object.values(Coins)
      return {
        method: ERC20MethodIds.repay,
        id: ERC20MethodIds.repay,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + result.inputs[0]?.toLowerCase(),
        ),
        amount: result.inputs[1].toString(),
        to: result.inputs[0],
        tags: theTags,
      }
    } else if (result.method === ERC20MethodIds.reward) {
      const coins = Object.values(Coins)
      return {
        method: ERC20MethodIds.reward,
        id: ERC20MethodIds.reward,
        tags: theTags,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() ===
            '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'?.toLowerCase(),
        ),
        amount: result.inputs[2].toString(),
        to: result.inputs[1],
      }
    }
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}
