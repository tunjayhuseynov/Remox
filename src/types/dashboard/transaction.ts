export enum TransactionType {
    PaySomeone = "Pay Someone",
    MassPayout = "Mass Payout",
    QuickTransfer = "Quick Transfer",
    IncomingPayment = "Incoming Payment",
    MassPayment = "Mass Payment",
    Swap = "Swap",
    AutomationPayout = "Automation Payment",
    Borrow = "Borrow",
    Deposit = "Deposit",
    Repay = "Repay",
    Withdraw = "Withdraw",
    Unknown = "Unknown"
}

export enum TransactionDirection {
    In,
    Out,
    Swap,
    AutomationIn,
    AutomationOut,
    Borrow,
    Deposit,
    Withdraw,
    Repay
}

export enum TransactionStatus{
    Completed = "Completed", 
    Pending = "Pending", 
    Rejected = "Rejected",
}