import { useContractKit } from '@celo-tools/use-contractkit';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteBalance } from 'redux/slices/currencies';
import { AltCoins, Coins } from 'types';
import usePoof from 'hooks/usePoof'
import { useWalletKit } from 'hooks';

export default function useBalance(address: string | string[]) {
    const { GetBalance, Address, GetCoins } = useWalletKit()
    const { walletType } = useContractKit()
    const { balance, pastEvents } = usePoof(1, walletType === "PrivateKey")
    const [fetchedBalance, setFetchedBalance] = useState<{ [name: string]: string }>()
    const [isLoading, setLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(deleteBalance)
        fetchBalance()
    }, [address])

    const fetchBalance = useCallback(async () => {
        const Coins = GetCoins
        if (!Address || !Coins) return null;
        try {
            setLoading(true)
            let balances: { [name: string]: string } = {};
            if (typeof address !== "string") {
                for (const addressItem of address) {
                    for (const i of Object.values(Coins)) {
                        const item = i as AltCoins
                        // const ethers = await kit.contracts.getErc20(item.contractAddress);
                        // let balance = await ethers.balanceOf(addressItem);
                        let altcoinBalance = await GetBalance(item, addressItem)

                        if (!balances[item.name]) {
                            balances = Object.assign(balances, { [item.name]: altcoinBalance })
                        } else {
                            balances[item.name] = `${Number(balances[item.name]) + Number(altcoinBalance)}`
                        }
                    }
                }

                setFetchedBalance({ ...balances })
                setLoading(false)
                return { ...balances };
            }


            if (walletType === "PrivateKey") {
                let cEUR_v2, cREAL_v2, CELO_v2, cUSD_v2, cEUR_v1, CELO_v1, cUSD_v1;
                await Promise.all([pastEvents("CELO_v2"), pastEvents("cUSD_v2"), pastEvents("cEUR_v2"), pastEvents("cREAL_v2"), pastEvents("CELO_v1"), pastEvents("cUSD_v1"), pastEvents("cEUR_v1")])
                const values = await Promise.all([balance("CELO_v2"), balance("cUSD_v2"), balance("cEUR_v2"), balance("cREAL_v2"), balance("CELO_v1"), balance("cUSD_v1"), balance("cEUR_v1")])
                CELO_v2 = values[0]
                cUSD_v2 = values[1]
                cEUR_v2 = values[2]
                cREAL_v2 = values[3]
                CELO_v1 = values[4]
                cUSD_v1 = values[5]
                cEUR_v1 = values[6]

                balances = { CELO_v2, cEUR_v2, cUSD_v2, cREAL_v2, cEUR_v1, cUSD_v1, CELO_v1 }
            } else {
                for (const i of Object.values(Coins)) {
                    const item = i as AltCoins
                    // const ethers = await kit.contracts.getErc20(item.contractAddress);
                    // let balance = await ethers.balanceOf(address);
                    let altcoinBalance = await GetBalance(item)

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
    }, [address])

    return { fetchBalance, fetchedBalance, isLoading };
}
