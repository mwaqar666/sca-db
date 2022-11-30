import { MigrationCommandProviderData } from "@/migrator/types";
import { BaseCommand } from "sca-command";

export class DownCommand extends BaseCommand<MigrationCommandProviderData> {
	public override commandHelp(): string {
		return `
			Rolls back one migration
			
			Syntax:
			=======
			down
		`;
	}

	public override commandName(): string {
		return "down";
	}

	public override async commandAction(): Promise<void> {
		await this.data.umzug.down();
	}
}
