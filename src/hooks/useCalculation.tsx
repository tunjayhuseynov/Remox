import { IuseCurrency } from "API/useCurrency";
import { useMemo } from "react";
import { AltCoins, Coins, TokenType } from "types";

interface Balance {
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

export default function useCalculation(balance?: Balance, fetchedCurrencies?: IuseCurrency[]) {

    const total = useMemo(() => {
        if (!fetchedCurrencies) return 0;
        return fetchedCurrencies.reduce((a, c) => a + (c.price * parseFloat((balance?.[c.name]) ?? "0")), 0)
    }, [balance, fetchedCurrencies]);

    const AllPrices = () => {
        if (!balance || !fetchedCurrencies) return {};
        return fetchedCurrencies.sort((a, b) => {
            const aa = Coins[a.name as unknown as keyof Coins]
            const bb = Coins[b.name as unknown as keyof Coins]
            if (aa.type !== bb.type && aa.type === TokenType.GoldToken) return -1
            if (aa.type !== bb.type && aa.type === TokenType.StableToken && bb.type === TokenType.Altcoin) return -1
            if (aa.type !== bb.type && aa.type === TokenType.Altcoin) return 1
            return 0
        }).reduce<{ [name: string]: { coins: AltCoins, per_24: number, price: number, amount: number, percent: number, tokenPrice: number } }>((a: any, c) => {
            const amount = parseFloat((balance?.[c.name]) ?? "0");
            const price = c.price * amount;
            a[c.name] = {
                coins: Coins[c.name as unknown as keyof Coins],
                per_24: c?.percent_24,
                price,
                amount,
                percent: (price * 100) / total,
                tokenPrice: c.price
            }
            return a;
        }, {})
    }

    const TotalBalance = () => {
        if (!balance || !fetchedCurrencies) return 0;
        const total = fetchedCurrencies.reduce((a, c) => a + (c.price * parseFloat((balance?.[c.name]) ?? "0")), 0);

        const arrPrices = fetchedCurrencies.map(c => {
            const amount = parseFloat((balance?.[c.name]) ?? "0");
            const price = c.price * amount;
            return {
                coins: Coins[c.name as unknown as keyof Coins],
                per_24: c?.percent_24,
                price,
                amount,
                percent: (price * 100) / total,
                tokenPrice: c.price
            }
        })

        return arrPrices.reduce((acc, curr) => acc + (curr.amount * curr.tokenPrice), 0)
    }


    return { TotalBalance, AllPrices }
}
