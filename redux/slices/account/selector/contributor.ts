import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { ExecutionType, IContributor } from "types/dashboard/contributors";

export const SelectContributors = createDraftSafeSelector(
    (state: RootState) => state.remoxData.contributors,
    (contributors) => contributors
);

export const SelectContributorMembers = createDraftSafeSelector(
    (state: RootState) => state.remoxData.contributors,
    (contributors) => {
        if (contributors && contributors.length > 0) {
            return [
                ...contributors.reduce<IContributor["members"]>(
                    (a, c) => [...a, ...c.members.map((s) => ({ ...s, parent: c }))],
                    []
                ),
            ];
        }
        return [];
    }
);

export const SelectContributorsAutoPayment = createDraftSafeSelector(
    (state: RootState) => state.remoxData.contributors,
    (contributors) =>
        contributors.filter((s) => ({
            ...s,
            members: s.members.filter((m) => m.execution === ExecutionType.auto),
        }))
);
