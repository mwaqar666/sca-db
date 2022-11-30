import { MigrationCommandProvider } from "@/migrator/command-provider";
import { SequelizeConfig, SortedUmzugConfigFactoryTest, UmzugConfigFactory } from "@/migrator/config";
import { BaseMigration } from "@/migrator/migration/base.migration";
import { SequelizeQueryInterface } from "@/migrator/types";
import { Constructable, FileHelpers } from "sca-core";
import { Sequelize } from "sequelize";
import { InputMigrations, MigrationParams, Umzug } from "umzug";

export class MigrationManager {
	private _umzug: Umzug<SequelizeQueryInterface>;
	private _sequelize: Sequelize;
	private _migrations: InputMigrations<SequelizeQueryInterface>;

	public constructor() {
		this.instantiateSequelize();

		this.createMigrationFilesResolver();

		this.instantiateUmzug();

		this.loadMigrationCommandProvider();
	}

	private _migrationCommandProvider: MigrationCommandProvider;

	public get migrationCommandProvider(): MigrationCommandProvider {
		return this._migrationCommandProvider;
	}

	private instantiateSequelize(): void {
		this._sequelize = new Sequelize(SequelizeConfig);
	}

	private createMigrationFilesResolver(): void {
		this._migrations = {
			glob: ["dist/modules/**/*.migration.js", { cwd: process.cwd() }],
			resolve: ({ name, path, context }: MigrationParams<SequelizeQueryInterface>) => {
				const migrationImport: Promise<{ default: Constructable<BaseMigration> }> = import(path as string);
				const [fileName] = FileHelpers.extension(name);

				return {
					name: fileName,
					up: async () => {
						const concreteMigration = await migrationImport;
						await new concreteMigration.default().up(context);
					},
					down: async () => {
						const concreteMigration = await migrationImport;
						await new concreteMigration.default().down(context);
					},
				};
			},
		};
	}

	private instantiateUmzug(): void {
		const partialUmzugConfig = new Umzug<SequelizeQueryInterface>(UmzugConfigFactory(this._sequelize, this._migrations));

		this._umzug = new Umzug<SequelizeQueryInterface>(SortedUmzugConfigFactoryTest(partialUmzugConfig));
	}

	private loadMigrationCommandProvider() {
		this._migrationCommandProvider = new MigrationCommandProvider(this._umzug);
	}
}

const migrationManager = new MigrationManager();

export const MigrationManagerCommandProvider = migrationManager.migrationCommandProvider;
