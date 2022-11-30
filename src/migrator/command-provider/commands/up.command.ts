import { MigrationCommandProviderData } from "@/migrator/types";
import { BaseCommand } from "sca-command";

export class UpCommand extends BaseCommand<MigrationCommandProviderData> {
	public override commandHelp(): string {
		return `
			Runs all migrations
			
			Syntax:
			=======
			up
		`;
	}

	public override commandName(): string {
		return "up";
	}

	public override async commandAction(): Promise<void> {
		await this.data.umzug.up();
	}
}
