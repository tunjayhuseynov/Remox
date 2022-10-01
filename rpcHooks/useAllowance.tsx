import { useState } from 'react'
import BigNumber from 'bignumber.js'
import { toWei } from 'utils/ray'
import Web3 from 'web3'
import ERC20 from 'rpcHooks/ABI/ERC.json'
import { AbiItem } from './ABI/AbiItem'
import { AltCoins } from 'types'

export default function useAllowance() {
    // const { kit, address } = useContractKit()
    const [loading, setLoading] = useState(false)

    const allow = async (address: string, coin: AltCoins, spender: string, etherAmount: string, payer: string) => {
        setLoading(true)
        try {

            const web3 = new Web3((window as any).celo)

            const contract = new web3.eth.Contract(ERC20 as AbiItem[], coin.address)
            const allowance = await contract.methods.allowance(address, spender).call()
            const amount = new BigNumber(etherAmount).multipliedBy(new BigNumber(10).pow(coin.decimals))
            const approve = await contract.methods.approve(spender, amount.plus(allowance).toString()).send({ from: payer, gas: 300000, gasPrice: "500000000" })
            // const tokenContract = await kit.contracts.getErc20(contractAddress)


            // const allowance = await tokenContract.allowance(address!, spender)


            // const approve = tokenContract.approve(spender, (amount.plus(allowance)).toString())

            // await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const disallow = async (address: string, contractAddress: string, spender: string, etherAmount: string) => {
        setLoading(true)
        try {
            const web3 = new Web3((window as any).celo)

            const contract = new web3.eth.Contract(ERC20 as AbiItem[], contractAddress)
            const allowance = await contract.methods.allowance(address, spender).call()
            const amount = new BigNumber(toWei(etherAmount))
            const sum = amount.minus(allowance)
            const approve = await contract.methods.approve(spender, sum.toString()).send({ from: address, gas: 300000, gasPrice: "500000000" })

            // const tokenContract = await kit.contracts.getErc20(contract)

            // const amount = new BigNumber(toWei(etherAmount))

            // const allowance = await tokenContract.allowance(address!, spender)

            // const sum = amount.minus(allowance)

            // const approve = tokenContract.approve(spender, sum.toString())
            // await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    return { allow, disallow, loading }
}
