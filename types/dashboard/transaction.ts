export enum TransactionType {
    PaySomeone = "Pay Someone",
    MassPayout = "Mass Payout",
    QuickTransfer = "Quick Transfer",
    IncomingPayment = "Incoming Payment",
    MassPayment = "Mass Payment",
    Swap = "Swap",
    AutomationPayout = "Automation Payment",
    AutomationCaceled = "Automation Canceled",
    Borrow = "Borrow",
    Deposit = "Deposit",
    Repay = "Repay",
    Withdraw = "Withdraw",
    Reward = "Reward",
    AddOwner= "Add Owner",
    RemoveOwner= "Remove Owner",
    ChangeRequirement= "Change Requirement",
    changeInternalRequirement= "Change Internal Requirement",
    Unknown = "Unknown"
}

export enum TransactionDirection {
    In,
    Out,
    Swap,
    AutomationIn,
    AutomationOut,
    AutomationCancel,
    Borrow,
    Deposit,
    Withdraw,
    Repay,
    Reward,
    AddOwner,
    RemoveOwner,
    ChangeRequirement,
    changeInternalRequirement,
}

export enum TransactionStatus{
    Completed = "Completed", 
    Pending = "Pending", 
    Rejected = "Rejected",
}