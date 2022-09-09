import { ITag, ITxTag } from "pages/api/tags/index.api";
import { IRemoxData } from "../remoxData";

export default {
    setTags: (state: IRemoxData, action: { payload: ITag[] }) => {
        state.tags = action.payload;
    },
    addTag: (state: IRemoxData, action: { payload: ITag }) => {
        state.tags = [...state.tags, action.payload];
    },
    removeTag: (state: IRemoxData, action: { payload: string }) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    updateTag: (state: IRemoxData, action: { payload: ITag }) => {
        state.tags = state.tags.map(tag => {
            if (tag.id === action.payload.id) {
                return action.payload;
            }
            return tag;
        });
    },
    addTransactionHashToTag: (state: IRemoxData, action: { payload: { tagId: string; txIndex?: number, transactionTag: ITxTag } }) => {
        const tagIndex = state.tags.findIndex(tag => tag.id === action.payload.tagId);
        if (tagIndex !== -1) {
            state.tags[tagIndex].transactions = [...state.tags[tagIndex].transactions, action.payload.transactionTag];
            if (action.payload.txIndex) {
                state.cumulativeTransactions[action.payload.txIndex].tags = [...state.cumulativeTransactions[action.payload.txIndex].tags, state.tags[tagIndex]];
            }
        }
    },
    removeTransactionHashFromTag: (state: IRemoxData, action: { payload: { tagId: string; txIndex?: number, transactionId: ITxTag } }) => {
        const tagIndex = state.tags.findIndex(tag => tag.id === action.payload.tagId);
        if (tagIndex !== -1) {
            state.tags[tagIndex].transactions = state.tags[tagIndex].transactions.filter(
                transactionId => transactionId !== action.payload.transactionId
            );
            if (action.payload.txIndex) {
                state.cumulativeTransactions[action.payload.txIndex].tags = state.cumulativeTransactions[action.payload.txIndex].tags.filter(
                    tag => tag.id !== action.payload.tagId
                );
            }
        }
    }
}