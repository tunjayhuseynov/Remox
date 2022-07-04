import { ISpendingResponse } from "pages/api/calculation/spending";
import { IAccountStats } from "../accountstats";
import { IRemoxData } from "../remoxData";

export default {
    setAccountStats: (state: IRemoxData, action: { payload: ISpendingResponse }) => {
        state.stats = action.payload;
    },
}