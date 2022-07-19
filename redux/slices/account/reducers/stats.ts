import { ISpendingResponse } from "pages/api/calculation/_spendingType";
import { IAccountStats } from "../accountstats";
import { IRemoxData } from "../remoxData";

export default {
    setAccountStats: (state: IRemoxData, action: { payload: ISpendingResponse }) => {
        state.stats = action.payload;
    },
}