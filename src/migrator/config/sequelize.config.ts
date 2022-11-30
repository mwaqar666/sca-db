import { DB_DATABASE, DB_DIALECT, DB_HOST, DB_PASSWORD, DB_PORT, DB_SCHEMA, DB_USERNAME, EnvExtractorHelper } from "sca-config";
import { Options } from "sequelize";

export const SequelizeConfig: Options = {
	dialect: EnvExtractorHelper.env(DB_DIALECT),
	username: EnvExtractorHelper.env(DB_USERNAME),
	password: EnvExtractorHelper.env(DB_PASSWORD),
	host: EnvExtractorHelper.env(DB_HOST),
	port: parseInt(EnvExtractorHelper.env(DB_PORT), 10),
	database: EnvExtractorHelper.env(DB_DATABASE),
	schema: EnvExtractorHelper.env(DB_SCHEMA),
};
