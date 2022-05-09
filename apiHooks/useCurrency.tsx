import { useWalletKit } from "hooks";
import { Coins } from "types";
import { useFirestoreReadMultiple } from "./useFirebase";

export interface IuseCurrency {
    name: string;
    percent_24: number;
    price: number;
}

export default function useCurrency() {
    const { Collection, GetCoins } = useWalletKit()
    const { data } = useFirestoreReadMultiple<IuseCurrency>(Collection, [{ condition: ">", firstQuery: "price", secondQuery: 0 }])

    if (data) {
        return data.filter(s => GetCoins[s.name as unknown as keyof Coins])
    }
    return data;
}
