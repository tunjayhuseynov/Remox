import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { ERCMethodIds, IAutomationCancel, IAutomationTransfer } from "hooks/useTransactionProcess";
import { RootState } from "redux/store";
import { GetTime } from "utils";

// Reccuring Tasks
export const SelectRecurringTasks = createDraftSafeSelector(
    (state: RootState) => state.remoxData.recurringTasks,
    (recurringTasks) => recurringTasks
);

export const SelectNonCanceledRecurringTasks = createDraftSafeSelector(
    (state: RootState) => state.remoxData.recurringTasks,
    (recurringTasks) => {
        const nonCanceledRecurringTasks = recurringTasks.filter(s => 'tx' in s ? s.tx.method !== ERCMethodIds.automatedCanceled : s.method !== ERCMethodIds.automatedCanceled);
        const canceledReccuringTasks = recurringTasks.filter(s => 'tx' in s ? s.tx.method === ERCMethodIds.automatedCanceled : s.method === ERCMethodIds.automatedCanceled)
            .map(s => 'tx' in s ? (s.tx as IAutomationCancel).streamId : (s as IAutomationCancel).streamId);

        return nonCanceledRecurringTasks.filter(s =>
            'tx' in s ? !canceledReccuringTasks.includes((s.tx as IAutomationTransfer).streamId) && (s.tx as IAutomationTransfer).endTime > GetTime() && (s.tx as IAutomationTransfer).streamId !== "0" :
                !canceledReccuringTasks.includes((s as IAutomationTransfer).streamId) && (s as IAutomationTransfer).endTime > GetTime() && (s as IAutomationTransfer).streamId !== "0");
    }
);

export const SelectAlldRecurringTasks = createDraftSafeSelector(
    (state: RootState) => state.remoxData.recurringTasks,
    (recurringTasks) => {
        const nonCanceledRecurringTasks = recurringTasks.filter(s => 'tx' in s ? s.tx.method !== ERCMethodIds.automatedCanceled : s.method !== ERCMethodIds.automatedCanceled);
        const canceledReccuringTasks = recurringTasks.filter(s => 'tx' in s ? s.tx.method === ERCMethodIds.automatedCanceled : s.method === ERCMethodIds.automatedCanceled).map(s => (s as IAutomationCancel).streamId);

        return nonCanceledRecurringTasks.filter(s => !canceledReccuringTasks.includes((s as IAutomationTransfer).streamId));
    }
);
