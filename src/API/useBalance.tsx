import { useContractKit } from '@celo-tools/use-contractkit';
import { StableToken } from '@celo/contractkit';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteBalance } from 'redux/reducers/currencies';
import { AltCoins, Coins } from 'types';
import usePoof from 'hooks/usePoof'

export default function useBalance(address: string) {
    const { kit, walletType } = useContractKit()
    const { balance, pastEvents } = usePoof(1)
    const [fetchedBalance, setFetchedBalance] = useState<{ [name: string]: string }>()
    const [isLoading, setLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        fetchBalance()
    }, [])

    useEffect(() => {
        dispatch(deleteBalance)
    }, [address])

    const fetchBalance = async () => {
        if (!kit.defaultAccount) return null;
        try {
            let balances: { [name: string]: string } = {};
            setLoading(true)

            let cEUR, cREAL, CELO, cUSD;
            if (walletType === "PrivateKey") {
                await Promise.all([pastEvents("CELO_v2"), pastEvents("cUSD_v2"), pastEvents("cEUR_v2"), pastEvents("cREAL_v2")])
                const values = await Promise.all([balance("CELO_v2"), balance("cUSD_v2"), balance("cEUR_v2"), balance("cREAL_v2")])
                CELO = values[0]
                cUSD = values[1]
                cEUR = values[2]
                cREAL = values[3]

                balances = { CELO, cEUR, cUSD, cREAL }
            } else {
                for (const i of Object.values(Coins)) {
                    const item = i as AltCoins
                    const ethers = await kit.contracts.getErc20(item.contractAddress);
                    let balance = await ethers.balanceOf(address);
                    let bnBalance = kit.web3.utils.toBN(balance.toString());
                    let altcoinBalance = kit.web3.utils.fromWei(bnBalance.toString(), 'ether');

                    balances = Object.assign(balances, { [item.name]: altcoinBalance });
                }
            }
            setFetchedBalance({ ...balances })
            setLoading(false)
            return { ...balances };
        } catch (e) {
            console.error(e)
            setLoading(false)
            throw new Error("Error fetching balance");
        }
    }

    return { fetchBalance, fetchedBalance, isLoading };
}
