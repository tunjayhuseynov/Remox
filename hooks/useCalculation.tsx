import { useCallback, useMemo } from "react";
import { AltCoins, Coins, TokenType } from "types";
import useWalletKit from "./walletSDK/useWalletKit";

export interface Balance {
    [name: string]: string;
}

export interface Price {
    coins: AltCoins,
    per_24: number,
    price: number,
    amount: number,
    percent: number,
    tokenPrice: number,
}

export default function useCalculation(balance?: Balance, fetchedCurrencies?: AltCoins[]) {
    const { GetCoins } = useWalletKit()

    const total = useMemo(() => {
        if (!fetchedCurrencies) return 0;
        return fetchedCurrencies.reduce((a, c) => a + (c.priceUSD * parseFloat((balance?.[c.name]) ?? "0")), 0)
    }, [balance, fetchedCurrencies]);

    const AllPrices = useMemo(() => {
        if (balance && fetchedCurrencies && GetCoins) {
            return fetchedCurrencies.filter(s => GetCoins[s.name as unknown as keyof Coins]).sort((a, b) => {
                const aa = GetCoins[a.name as unknown as keyof Coins]
                const bb = GetCoins[b.name as unknown as keyof Coins]
                if (aa && bb) {
                    if (aa.type !== bb.type && aa.type === TokenType.GoldToken) return -1
                    if (aa.type !== bb.type && aa.type === TokenType.StableToken && bb.type === TokenType.Altcoin) return -1
                    if (aa.type !== bb.type && aa.type === TokenType.Altcoin) return 1
                }
                return 0
            }).reduce<{ [name: string]: { coins: AltCoins, per_24: number, price: number, amount: number, percent: number, tokenPrice: number } }>((a: any, c) => {
                const amount = parseFloat((balance?.[c.name]) ?? "0");
                const price = c.priceUSD * amount;
                a[c.name] = {
                    coins: GetCoins[c.name as unknown as keyof Coins],
                    price,
                    amount,
                    percent: (price * 100) / total,
                    tokenPrice: c.priceUSD
                }
                return a;
            }, {})
        };

    }, [balance, fetchedCurrencies])

    const TotalBalance = useMemo(() => {
        if (balance && fetchedCurrencies && GetCoins) {
            const total = fetchedCurrencies.filter(s => GetCoins[s.name as unknown as keyof Coins]).reduce((a, c) => a + (c.priceUSD * parseFloat((balance?.[c.name]) ?? "0")), 0);

            const arrPrices = fetchedCurrencies.filter(s => GetCoins[s.name as unknown as keyof Coins]).map(c => {
                const amount = parseFloat((balance?.[c.name]) ?? "0");
                const price = c.priceUSD * amount;
                return {
                    coins: GetCoins[c.name as unknown as keyof Coins],
                    price,
                    amount,
                    percent: (price * 100) / total,
                    tokenPrice: c.priceUSD
                }
            })

            return arrPrices.reduce((acc, curr) => acc + (curr.amount * curr.tokenPrice), 0)
        }
        return 0
    }, [balance, fetchedCurrencies])


    return { TotalBalance, AllPrices }
}
