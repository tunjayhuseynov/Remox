import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

export const SelectIndividualAccounts = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage?.individual.accounts,
    (accounts) => accounts
);

export const SelectSingleAccounts = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => accounts.filter((account) => account.signerType === "single")
);

export const SelectAllOrganizations = createDraftSafeSelector(
    (state: RootState) => state.remoxData.organizations,
    (organizations) => organizations
);

export const SelectAccountType = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accountType,
    (type) => type
);

export const SelectStorage = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage,
    (storage) => storage
);

export const SelectRemoxAccount = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage,
    (storage) => {
        if (storage?.organization) {
            return storage.organization;
        }

        return storage?.individual;
    }
);

export const SelectIndividual = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage?.individual,
    (individual) => individual
);

export const SelectOrganization = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage?.organization,
    (organization) => organization
);
