import { SequelizeQueryInterface } from "@/migrator/types";
import { DateHelpers } from "sca-core";
import { DataTypes, Sequelize } from "sequelize";
import { InputMigrations, RunnableMigration, SequelizeStorage, Umzug, UmzugOptions } from "umzug";

export const SequelizeStorageFactory = (sequelize: Sequelize): SequelizeStorage => {
	return new SequelizeStorage({
		sequelize,
		schema: process.env.DB_SCHEMA,
		tableName: "migrations",
		columnName: "migrationName",
		columnType: DataTypes.STRING(100),
	});
};

export const UmzugConfigFactory = (sequelize: Sequelize, migrations: InputMigrations<SequelizeQueryInterface>): UmzugOptions<SequelizeQueryInterface> => {
	return {
		migrations,
		context: sequelize.getQueryInterface() as unknown as SequelizeQueryInterface,
		storage: SequelizeStorageFactory(sequelize),
		logger: console,
	};
};

export const SortedUmzugConfigFactoryTest = (umzug: Umzug<SequelizeQueryInterface>): UmzugOptions<SequelizeQueryInterface> => {
	return {
		...umzug.options,
		migrations: async (context: SequelizeQueryInterface) => {
			const migrations = (await umzug.migrations(context)).concat();

			return migrations.sort((a: RunnableMigration<SequelizeQueryInterface>, b: RunnableMigration<SequelizeQueryInterface>) => {
				const [timeStampSegmentA, timeStampSegmentB] = [a.name.slice(0, 23), b.name.slice(0, 23)];

				const [dateA, dateB] = [DateHelpers.parseTimeStamp(timeStampSegmentA), DateHelpers.parseTimeStamp(timeStampSegmentB)];

				return dateA.getTime() > dateB.getTime() ? 1 : -1;
			});
		},
	};
};
