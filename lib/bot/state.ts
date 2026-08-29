export type ExpenseState = {
    step: "amount" | "transactionId" | "description" | "confirm" |"settleAmount" | "settleConfirm";
    amount?: number;
    transactionId?: string;
    description?: string;

    toUserId?:string;
    settleAmount?:number;
}

export const expenseStates = new Map<number,ExpenseState>();