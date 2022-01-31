import { useContractKit } from '@celo-tools/use-contractkit';
import { StableToken } from '@celo/contractkit';
import { useEffect, useState } from 'react';

export const tokenAdresses = [
    {
        "tokenName": "UBE",
        "address": "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC"
    },
    {
        "tokenName": "MOO",
        "address": "0x17700282592D6917F6A73D0bF8AcCf4D578c131e"
    },
    {
        "tokenName": "MOBI",
        "address": "0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B"
    },
    {
        "tokenName": "POOF",
        "address": "0x00400FcbF0816bebB94654259de7273f4A05c762"
    },
]

export default function useBalance(address: string) {
    const { kit } = useContractKit()
    const [fetchedBalance, setFetchedBalance] = useState<{ [name: string]: string }>()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        fetchBalance()
    },[])

    const fetchBalance = async () => {
        if (!kit.defaultAccount) return null;
        try {
            let balances: { [name: string]: string } = {};
            setLoading(true)
            for (const item of tokenAdresses) {

                const ethers = await kit.contracts.getErc20(item.address);
                let balance = await ethers.balanceOf(address);
                let bnBalance = kit.web3.utils.toBN(balance.toString());
                let altcoinBalance = kit.web3.utils.fromWei(bnBalance.toString(), 'ether');

                balances = Object.assign(balances, { [item.tokenName]: altcoinBalance });
            }

            let stabletokenEUR = await kit.contracts.getStableToken(StableToken.cEUR);
            let balanceEUR = await stabletokenEUR.balanceOf(address);
            let bnEUR = kit.web3.utils.toBN(balanceEUR.toString());
            let cEUR = kit.web3.utils.fromWei(bnEUR.toString(), 'ether');


            let stabletokenREAL = await kit.contracts.getStableToken(StableToken.cREAL);
            let balanceREAL = await stabletokenREAL.balanceOf(address);
            let bnREAL = kit.web3.utils.toBN(balanceREAL.toString());
            let cREAL = kit.web3.utils.fromWei(bnREAL.toString(), 'ether');

            let goldtoken = await kit.contracts.getGoldToken();
            let balanceGoldtoken = await goldtoken.balanceOf(address);
            let bnGold = kit.web3.utils.toBN(balanceGoldtoken.toString());
            let CELO = kit.web3.utils.fromWei(bnGold.toString(), 'ether');

            let stabletokenUSD = await kit.contracts.getStableToken();
            let balanceUSD = await stabletokenUSD.balanceOf(address);
            let bnUSD = kit.web3.utils.toBN(balanceUSD.toString());
            let cUSD = kit.web3.utils.fromWei(bnUSD.toString(), 'ether');

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
