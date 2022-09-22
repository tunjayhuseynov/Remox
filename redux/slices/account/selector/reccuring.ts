import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { ERC20MethodIds, IAutomationCancel, IAutomationTransfer } from "hooks/useTransactionProcess";
import { RootState } from "redux/store";

// Reccuring Tasks
export const SelectRecurringTasks = createDraftSafeSelector(
    (state: RootState) => state.remoxData.recurringTasks,
    (recurringTasks) => recurringTasks
);

export const SelectNonCanceledRecurringTasks = createDraftSafeSelector(
    (state: RootState) => state.remoxData.recurringTasks,
    (recurringTasks) => {
        const nonCanceledRecurringTasks = recurringTasks.filter(s => 'tx' in s ? s.tx.method !== ERC20MethodIds.automatedCanceled : s.method !== ERC20MethodIds.automatedCanceled);
        const canceledReccuringTasks = recurringTasks.filter(s => 'tx' in s ? s.tx.method === ERC20MethodIds.automatedCanceled : s.method === ERC20MethodIds.automatedCanceled).map(s => (s as IAutomationCancel).streamId);

        return nonCanceledRecurringTasks.filter(s => !canceledReccuringTasks.includes((s as IAutomationTransfer).streamId));
    }
);
