import { CoinsName } from "types";
import { useFirestoreRead } from "./useFirebase";
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount";
import useNextSelector from "hooks/useNextSelector";
import { useAppSelector } from "redux/hooks";
import { SelectProviderAddress } from "redux/slices/account/remoxData";

export interface IRequest {
    id: string;
    name: string;
    surname: string;
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

    usdBase: boolean;
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

    const selectedAddress = useAppSelector(SelectProviderAddress)

    let { data } = useFirestoreRead<{ requests: IRequest[] }>('requests', selectedAddress?.toLowerCase() ?? "0x");

    return { data };
}
