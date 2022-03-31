import { useContractKit } from '@celo-tools/use-contractkit';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteBalance } from 'redux/reducers/currencies';
import { AltCoins, Coins } from 'types';
import usePoof from 'hooks/usePoof'
import { fromWei } from 'utils/ray';

export default function useBalance(address: string | string[]) {
    const { kit, walletType } = useContractKit()
    const { balance, pastEvents } = usePoof(1, walletType === "PrivateKey")
    const [fetchedBalance, setFetchedBalance] = useState<{ [name: string]: string }>()
    const [isLoading, setLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        fetchBalance()
    }, [address])

    useEffect(() => {
        dispatch(deleteBalance)
    }, [address])

    const fetchBalance = async () => {
        if (!kit.defaultAccount) return null;

        try {
            setLoading(true)
            let balances: { [name: string]: string } = {};

            if (typeof address !== "string") {

                for (const addressItem of address) {
                    for (const i of Object.values(Coins)) {
                        const item = i as AltCoins
                        const ethers = await kit.contracts.getErc20(item.contractAddress);
                        let balance = await ethers.balanceOf(addressItem);
                        let altcoinBalance = fromWei(balance)

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
                    let altcoinBalance = fromWei(balance)

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
