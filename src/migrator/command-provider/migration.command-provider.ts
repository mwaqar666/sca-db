import { MigrationCommandProviderData, SequelizeQueryInterface } from "@/migrator/types";
import { BaseCommandProvider, CommandType } from "sca-command";
import { Umzug } from "umzug";

export class MigrationCommandProvider extends BaseCommandProvider<MigrationCommandProviderData> {
	public constructor(public readonly umzug: Umzug<SequelizeQueryInterface>) {
		super({ umzug });
	}

	public override provide(): Array<Promise<CommandType<MigrationCommandProviderData>>> {
		return [
			// Register migrator commands here

			import("@/migrator/command-provider/commands/up.command").then(({ UpCommand }) => UpCommand),
			import("@/migrator/command-provider/commands/down.command").then(({ DownCommand }) => DownCommand),
			import("@/migrator/command-provider/commands/create.command").then(({ CreateCommand }) => CreateCommand),
		];
	}
}
