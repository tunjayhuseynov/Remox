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

            for (const i of Object.values(Coins)) {
                const item = i as AltCoins
                const ethers = await kit.contracts.getErc20(item.contractAddress);
                let balance = await ethers.balanceOf(address);
                let bnBalance = kit.web3.utils.toBN(balance.toString());
                let altcoinBalance = kit.web3.utils.fromWei(bnBalance.toString(), 'ether');
                balances = Object.assign(balances, { [item.name]: altcoinBalance });
            }

            let cEUR, cREAL, CELO, cUSD;
            // if (walletType !== "PrivateKey") {

                let stabletokenEUR = await kit.contracts.getStableToken(StableToken.cEUR);
                let balanceEUR = await stabletokenEUR.balanceOf(address);
                let bnEUR = kit.web3.utils.toBN(balanceEUR.toString());
                cEUR = kit.web3.utils.fromWei(bnEUR.toString(), 'ether');



                let stabletokenREAL = await kit.contracts.getStableToken(StableToken.cREAL);
                let balanceREAL = await stabletokenREAL.balanceOf(address);
                let bnREAL = kit.web3.utils.toBN(balanceREAL.toString());
                cREAL = kit.web3.utils.fromWei(bnREAL.toString(), 'ether');

                let goldtoken = await kit.contracts.getGoldToken();
                let balanceGoldtoken = await goldtoken.balanceOf(address);
                let bnGold = kit.web3.utils.toBN(balanceGoldtoken.toString());
                CELO = kit.web3.utils.fromWei(bnGold.toString(), 'ether');

                let stabletokenUSD = await kit.contracts.getStableToken();
                let balanceUSD = await stabletokenUSD.balanceOf(address);
                let bnUSD = kit.web3.utils.toBN(balanceUSD.toString());
                cUSD = kit.web3.utils.fromWei(bnUSD.toString(), 'ether');

            // } else {
            //     await pastEvents("cUSD_v2")
            //     CELO = await balance("CELO_v2")
            //     cEUR = await balance("cEUR_v2")
            //     cUSD = await balance("cUSD_v2")
            //     cREAL = await balance("cREAL_v2")
            // }
            setFetchedBalance({ CELO, cREAL, cUSD, cEUR, ...balances })
            setLoading(false)
            return { CELO, cREAL, cUSD, cEUR, ...balances };
        } catch (e) {
            console.error(e)
            setLoading(false)
            throw new Error("Error fetching balance");
        }
    }

    return { fetchBalance, fetchedBalance, isLoading };
}
