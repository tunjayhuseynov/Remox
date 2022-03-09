import { useContractKit } from '@celo-tools/use-contractkit'
import { AltCoins } from 'types'
import { useState } from 'react'

export default function useAllowance() {
    const { kit, address } = useContractKit()
    const [loading, setLoading] = useState(false)

    const allow = async (token: AltCoins, spender: string, etherAmount: string) => {
        setLoading(true)
        try {
            const tokenContract = await kit.contracts.getErc20(token.contractAddress)

            const amount = kit.web3.utils.toBN(kit.web3.utils.toWei(etherAmount, 'ether'))
            
            const allowance = await tokenContract.allowance(address!, spender)
             
            const sum = amount.add(kit.web3.utils.toBN(kit.web3.utils.toWei(allowance.shiftedBy(-18).toNumber().toString(), 'ether')))

            const approve = tokenContract.approve(spender, sum.toString())

            await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const disallow = async (token: AltCoins, spender: string, etherAmount: string) => {
        setLoading(true)
        try {
            const tokenContract = await kit.contracts.getErc20(token.contractAddress)

            const amount = kit.web3.utils.toBN(kit.web3.utils.toWei(etherAmount, 'ether'))

            const allowance = await tokenContract.allowance(address!, spender)

            const sum = amount.sub(kit.web3.utils.toBN(allowance.toString()))

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
