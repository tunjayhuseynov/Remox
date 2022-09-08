import { CoinsName } from "types";
import { useFirestoreRead } from "./useFirebase";
import { useSelector } from "react-redux";
import useNextSelector from "hooks/useNextSelector";
import { useAppSelector } from "redux/hooks";
import { SelectProviderAddress } from "redux/slices/account/remoxData";

export interface IRequest {
    id: string;
    name: string;
    surname: string;
    address: string;
    amount: string;
    image?: string;
    currency: CoinsName;
    secondaryAmount: string | null;
    secondaryCurrency: CoinsName | null;

    requestType: string;
    nameOfService: string;
    serviceDate: number;
    attachLink: string | null;
    uploadedLink: string | null;

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
