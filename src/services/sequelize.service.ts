import { RunningTransaction, TransactionalOperation, TransactionStore } from "@/types";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AppDefaultException, AppExceptionDto } from "sca-core";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";
import { HttpException } from "@nestjs/common/exceptions/http.exception";

@Injectable()
export class SequelizeService {
	public constructor(protected readonly sequelizeInstance: Sequelize) {}

	public async executeTransactionalOperation<T, R = void>(transactionalOperation: TransactionalOperation<T, R>): Promise<T | R> {
		const preparedTransaction = await this.prepareTransaction(transactionalOperation.withTransaction);

		try {
			const transactionResult = await transactionalOperation.transactionCallback(preparedTransaction);

			await this.wrapUpTransaction(preparedTransaction);

			return transactionResult;
		} catch (error) {
			await preparedTransaction.currentTransaction.transaction.rollback();

			if (error && transactionalOperation.failureCallback) return await transactionalOperation.failureCallback(error);

			const exception: AppExceptionDto = error instanceof HttpException ? (error.getResponse() as AppExceptionDto) : AppDefaultException;

			throw new InternalServerErrorException(exception);
		}
	}

	private async prepareTransaction(preparedTransaction?: RunningTransaction): Promise<RunningTransaction> {
		if (preparedTransaction) return { currentTransaction: preparedTransaction.currentTransaction, createdOnThisLevel: false };

		return { currentTransaction: await this.createNewTransaction(), createdOnThisLevel: true };
	}

	private async wrapUpTransaction(preparedTransaction: RunningTransaction): Promise<void> {
		if (!preparedTransaction.createdOnThisLevel) return;

		await preparedTransaction.currentTransaction.transaction.commit();
	}

	private async createNewTransaction(): Promise<TransactionStore> {
		return { transaction: await this.createTransaction() };
	}

	private async createTransaction(): Promise<Transaction> {
		return await this.sequelizeInstance.transaction();
	}
}
