import { Transaction } from "sequelize";

export interface TransactionStore {
	transaction: Transaction;
}

export interface RunningTransaction {
	currentTransaction: TransactionStore;
	createdOnThisLevel: boolean;
}

export type TransactionCallback<T> = (runningTransaction: RunningTransaction) => Promise<T>;

export type TransactionError<T> = (error: any) => Promise<T>;

export interface TransactionalOperation<TransactionReturn, FailureReturn> {
	withTransaction?: RunningTransaction;
	transactionCallback: TransactionCallback<TransactionReturn>;
	failureCallback?: TransactionError<FailureReturn>;
}
