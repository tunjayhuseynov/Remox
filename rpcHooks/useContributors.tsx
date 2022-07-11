import { useFirestoreReadMultiple } from "rpcHooks/useFirebase";
import { CoinsName } from "types";
import { selectStorage } from "redux/slices/account/storage";
import { useSelector } from "react-redux";
import { FieldValue } from "firebase/firestore";
import useNextSelector from "hooks/useNextSelector";
import { Image } from "firebaseConfig";

export enum DateInterval {
  daily = "daily",
  weekly = "weekly",
  monthly = "monthly",
}

export interface IuseContributor {
  id: string;
  userId: string;
  name: string;
  timestamp: number;
  members: IMember[]
}

export enum ExecutionType {
  auto = "auto",
  manual = "manual",
}

export interface IMember {
  id: string;
  name: string,
  first: string,
  last: string,
  image: Image | null,
  address: string,
  compensation: string,
  currency: CoinsName,
  amount: string,
  teamId: string,
  execution: ExecutionType,
  paymantDate: string,
  paymantEndDate: string,
  interval: DateInterval,
  usdBase: boolean,
  secondaryCurrency: CoinsName | null,
  secondaryAmount: string | null,
  secondaryUsdBase: boolean | null,
  taskId: string | null,
}

export default function useContributors() {
  const storage = useNextSelector(selectStorage)
  const { data } = useFirestoreReadMultiple<IuseContributor>("contributors", [
    {
      firstQuery: "userId",
      condition: "==",
      secondQuery: storage?.uid ?? "0"
    }
  ]);


  return data;
}
