import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

export const SelectHistoricalPrices = createDraftSafeSelector(
    (state: RootState) => state.remoxData.historyPriceList,
    (hp) => hp
)