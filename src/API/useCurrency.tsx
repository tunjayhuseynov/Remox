import { useFirestoreReadMultiple } from "./useFirebase";

export interface IuseCurrency {
    name: string;
    percent_24: number;
    price: number;
}

export default function useCurrency() {
    const { data } = useFirestoreReadMultiple<IuseCurrency>("currencies", "price", ">", 0)

    return data;
}
