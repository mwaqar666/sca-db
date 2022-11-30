import { MigrationCommandProviderData } from "@/migrator/types";
import { BaseCommand, CommandArgumentDetails, CommandArguments, KeyValueArgument } from "sca-command";
import { DateHelpers, FileHelpers, Optional, PathHelpers } from "sca-core";

export class CreateCommand extends BaseCommand<MigrationCommandProviderData> {
	public override commandArguments(): Optional<CommandArguments> {
		const requiredStringAttributes: CommandArgumentDetails = { type: "string", required: true };

		return {
			keyValueArguments: { module: requiredStringAttributes, migration: requiredStringAttributes },
		};
	}

	public override commandHelp(): string {
		return `
			Creates migration
			
			Syntax:
			=======
			create module=[moduleName] migration=[migrationName]
			
			Arguments:
			==========
			module: Specifies the module in which to create the migration
			migration: Specifies the migration file name
		`;
	}

	public override commandName(): string {
		return "create";
	}

	public override async commandAction(commandArguments: KeyValueArgument[]): Promise<void> {
		const moduleArgument = commandArguments.find((argument: KeyValueArgument) => argument.key === "module") as KeyValueArgument;
		const migrationArgument = commandArguments.find((argument: KeyValueArgument) => argument.key === "migration") as KeyValueArgument;

		const timeStamp = DateHelpers.createTimeStamp();
		const migrationFileName = `${timeStamp}_${migrationArgument.value}.migration.ts`;
		const migrationFilePath = PathHelpers.migrationsPath(moduleArgument.value as string, migrationFileName);

		const migrationTemplateFilePath = PathHelpers.packagePath("sca-db", "dist", "migrator", "migration", "migration-template.txt");

		await FileHelpers.copyFile(migrationTemplateFilePath, migrationFilePath);
	}
}
