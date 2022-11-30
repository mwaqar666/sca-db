import { SequelizeQueryInterface } from "@/migrator/types";

export abstract class BaseMigration {
	public abstract up(queryInterface: SequelizeQueryInterface): Promise<void>;

	public abstract down(queryInterface: SequelizeQueryInterface): Promise<void>;
}
