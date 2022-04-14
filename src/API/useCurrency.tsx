import { useWalletKit } from "hooks";
import { useFirestoreReadMultiple } from "./useFirebase";

export interface IuseCurrency {
    name: string;
    percent_24: number;
    price: number;
}

export default function useCurrency() {
    const { Collection } = useWalletKit()
    const { data } = useFirestoreReadMultiple<IuseCurrency>(Collection, [{ condition: ">", firstQuery: "price", secondQuery: 0 }])

    return data;
}
