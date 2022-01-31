import { auth } from "firebase";
import { useFirestoreReadMultiple } from "API/useFirebase";
import { CoinsName } from "types";
import { selectStorage } from "redux/reducers/storage";
import { useSelector } from "react-redux";

export enum DateInterval {
  weakly = "weekly",
  monthly = "monthly",
}

export interface IuseContributor {
  id: string;
  userId: string;
  name: string;
  timestamp: number;
  members: IMember[]
}

export interface IMember {
  id: string;
  name: string,
  address: string,
  currency: CoinsName,
  amount: string,
  teamId: string,
  paymantDate: string,
  interval: DateInterval,
  usdBase: boolean,
  secondaryCurrency?: CoinsName,
  secondaryAmount?: string,
  secondaryUsdBase?: boolean,

}

export default function useContributors() {
  const storage = useSelector(selectStorage)
  const { data } = useFirestoreReadMultiple<IuseContributor>("contributors", "userId", "==", storage?.uid);


  return data;
}
