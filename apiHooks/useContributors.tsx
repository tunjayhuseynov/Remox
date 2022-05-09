import { useFirestoreReadMultiple } from "apiHooks/useFirebase";
import { CoinsName } from "types";
import { selectStorage } from "redux/reducers/storage";
import { useSelector } from "react-redux";
import { FieldValue } from "firebase/firestore";

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
  address: string,
  currency: CoinsName,
  amount: string,
  teamId: string,
  execution: ExecutionType,
  paymantDate: string,
  paymantEndDate: string,
  interval: DateInterval,
  usdBase: boolean,
  secondaryCurrency?: CoinsName,
  secondaryAmount?: string | null,
  secondaryUsdBase?: boolean,
  taskId?: string | null,
}

export default function useContributors() {
  const storage = useSelector(selectStorage)
  const { data } = useFirestoreReadMultiple<IuseContributor>("contributors", [
    {
      firstQuery: "userId",
      condition: "==",
      secondQuery: storage?.uid
    }
  ]);


  return data;
}
