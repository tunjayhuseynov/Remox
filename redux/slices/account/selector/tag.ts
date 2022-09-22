import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

export const SelectTags = createDraftSafeSelector(
    (state: RootState) => state.remoxData.tags,
    (tags) => tags
);
