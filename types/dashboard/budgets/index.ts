export interface IBudgetExerciseInterface {
    id: string;
    budgets: IBudgetItem[],
    name: string,
    totalAmount: number,
    totalUsed: number,
    totalPending: number,
    totalAvailable: number,
}

export interface IBudgetItem {
    id: number;
    name: string;
    percent: string;
    coinUrl: string;
    value: string;
    impacted: string;
    token: {
        coin: string;
        coinUrl: string;
        value: string;
        second: {
            secondCoin: string | null,
            secondTotalAmount: number | null,
            secondTotalUsed: number | null,
        } | null
    };
    subBudgets: {
        id: number;
        name: string;
        coinUrl: string;
        used: string;
        pending: string;
        available: string;
        progressbar: number;
    }[];
    labels?: {
        id: number;
        color: string;
        name: string;
        coinUrl: string;
        used: string;
        pending: string;
        progressbar: number;
    }[];
}
