import { useWalletKit } from "hooks";
import { AltCoins, Coins } from "types";
import { useFirestoreReadMultiple } from "./useFirebase";


export default function useCurrency(collection: string | null) {
    const { Collection, GetCoins } = useWalletKit()
    const { data } = useFirestoreReadMultiple<AltCoins>(collection ?? Collection, [{ condition: ">", firstQuery: "price", secondQuery: 0 }])

    // if (data) {
    //     return data.filter(s => GetCoins[s.name as unknown as keyof Coins])
    // }
    return data;
}
