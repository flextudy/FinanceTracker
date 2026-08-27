export type ExpenseState = {
    step: "amount" | "transactionId" | "description" | "confirm";
    amount?: number;
    transactionId?: string;
    description?: string;
}

export const expenseStates = new Map<number,ExpenseState>();