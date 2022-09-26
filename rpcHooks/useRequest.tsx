import { CoinsName } from "types";
import { useFirestoreRead } from "./useFirebase";
import { useSelector } from "react-redux";
import useNextSelector from "hooks/useNextSelector";
import { useAppSelector } from "redux/hooks";
import { FiatMoneyList } from 'firebaseConfig';
import { SelectProviderAddress } from "redux/slices/account/remoxData";

export interface IRequest {
    id: string;
    fullname: string;
    address: string;
    amount: string;
    currency: string;
    fiat: FiatMoneyList | null;
    secondAmount: string | null;
    secondCurrency: string | null;
    fiatSecond: FiatMoneyList | null;
    requestType: string;
    nameOfService: string;
    serviceDate: number;
    attachLink: string | null;
    uploadedLink: string | null;
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
