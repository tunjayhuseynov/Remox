import { useContractKit } from '@celo-tools/use-contractkit'
import { AltCoins } from 'types'
import { useState } from 'react'
import BigNumber from 'bignumber.js'

export default function useAllowance() {
    const { kit, address } = useContractKit()
    const [loading, setLoading] = useState(false)

    const allow = async (contract: string, spender: string, etherAmount: string) => {
        setLoading(true)
        try {
            const tokenContract = await kit.contracts.getErc20(contract)

            const amount = new BigNumber(kit.web3.utils.toWei(etherAmount, 'ether'))

            const allowance = await tokenContract.allowance(address!, spender)


            const approve = tokenContract.approve(spender, (amount.plus(allowance)).toString())

            await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const disallow = async (contract: string, spender: string, etherAmount: string) => {
        setLoading(true)
        try {
            const tokenContract = await kit.contracts.getErc20(contract)

            const amount = new BigNumber(kit.web3.utils.toWei(etherAmount, 'ether'))

            const allowance = await tokenContract.allowance(address!, spender)

            const sum = amount.minus(allowance)

            const approve = tokenContract.approve(spender, sum.toString())
            await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    return { allow, disallow, loading }
}
