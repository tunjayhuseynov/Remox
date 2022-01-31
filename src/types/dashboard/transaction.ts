export enum TransactionType {
    PaySomeone = "Pay Someone",
    MassPayout = "Mass Payout",
    QuickTransfer = "Quick Transfer",
    IncomingPayment = "Incoming Payment",
    MassPayment = "Mass Payment",
    Swap = "Swap"
}

export enum TransactionDirection {
    In,
    Out,
    Swap
}

export enum TransactionStatus{
    Completed = "Completed", 
    Pending = "Pending", 
    Rejected = "Rejected",
}