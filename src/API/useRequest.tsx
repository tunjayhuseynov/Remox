import { CoinsName } from "types";
import { useFirestoreRead } from "./useFirebase";
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";

export interface IRequest {
    id: string;
    usdBase: boolean;
    name: string;
    address: string;
    amount: string;
    currency: CoinsName;
    secondaryAmount?: string;
    secondaryCurrency?: CoinsName;

    requestType: string;
    nameOfService: string;
    serviceDate: number;
    attachLink?: string;
    uploadedLink?: string;

    timestamp: number;
    status: RequestStatus;
}

export enum RequestStatus {
    pending = "Pending",
    approved = "Approved",
    rejected = "Rejected",
    finished = "Finished"
}

export default function useRequest() {

    const selectedAddress = useSelector(SelectSelectedAccount)

    let { data } = useFirestoreRead<{ requests: IRequest[] }>('requests', selectedAddress!.toLowerCase());

    return { data };
}
