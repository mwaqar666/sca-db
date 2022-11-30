import { EntityType, SequelizeBaseEntity } from "@/entity";
import { DB_SCHEMA, EnvExtractorHelper } from "sca-config";
import { TableName } from "sequelize";

export class TableHelpers {
	/**
	 * Creates the `TableName` for the given table name in the provided schema
	 * @param entity Table name to assign
	 */
	public static createTableName(entity: string): TableName;
	/**
	 * Creates the `TableName` for the given table name in the provided schema
	 * @param entity Table name to assign
	 * @param schema Schema in which to create table
	 */
	public static createTableName(entity: string, schema: string): TableName;
	/**
	 * Creates the `TableName` for the given table name in the provided schema
	 * @param entity Entity model for the table
	 * @return TableName A TableName object with table information
	 */
	public static createTableName<TEntity extends SequelizeBaseEntity<TEntity>>(entity: EntityType<TEntity>): TableName;
	public static createTableName<TEntity extends SequelizeBaseEntity<TEntity>>(entity: string | EntityType<TEntity>, schema?: string): TableName {
		const [tableName, schemaName] = typeof entity !== "string" ? [entity.entityTableName, TableHelpers.schemaNameOrDefault(entity.entitySchemaName)] : [entity, TableHelpers.schemaNameOrDefault(schema)];

		return { tableName, schema: schemaName };
	}

	/**
	 * Creates the name to use on the foreign key constraint
	 * @param targetTable Table name to which foreign key is applied
	 * @param sourceTable Table name to which foreign key is referenced
	 * @param targetTableColumnName Name of target table foreign key column name
	 * @param sourceTableColumnName Name of source table foreign reference column name
	 * @returns Unique foreign key constraint name
	 */
	public static createForeignConstraintName(targetTable: string, sourceTable: string, targetTableColumnName: string, sourceTableColumnName: string): string;
	/**
	 * Creates the name to use on the foreign key constraint
	 * @param targetTable Table name to which foreign key is applied
	 * @param sourceTable Entity to which foreign key is referenced
	 * @param targetTableColumnName Name of target table foreign key column name
	 * @param sourceTableColumnName Name of source table foreign reference column name
	 * @returns Unique foreign key constraint name
	 */
	public static createForeignConstraintName<TSource extends SequelizeBaseEntity<TSource>>(targetTable: string, sourceTable: EntityType<TSource>, targetTableColumnName: string, sourceTableColumnName: keyof TSource): string;
	/**
	 * Creates the name to use on the foreign key constraint
	 * @param targetTable Entity on which foreign key is applied
	 * @param sourceTable Table name to which foreign key is referenced
	 * @param targetTableColumnName Name of target table foreign key column name
	 * @param sourceTableColumnName Name of source table foreign reference column name
	 * @returns Unique foreign key constraint name
	 */
	public static createForeignConstraintName<TTarget extends SequelizeBaseEntity<TTarget>>(targetTable: EntityType<TTarget>, sourceTable: string, targetTableColumnName: keyof TTarget, sourceTableColumnName: string): string;
	/**
	 * Creates the name to use on the foreign key constraint
	 * @param targetTable Entity on which foreign key is applied
	 * @param sourceTable Entity to which foreign key is referenced
	 * @param targetTableColumnName Name of target table foreign key column name
	 * @param sourceTableColumnName Name of source table foreign reference column name
	 * @return Unique foreign key constraint name
	 */
	public static createForeignConstraintName<TTarget extends SequelizeBaseEntity<TTarget>, TSource extends SequelizeBaseEntity<TSource>>(targetTable: EntityType<TTarget>, sourceTable: EntityType<TSource>, targetTableColumnName: keyof TTarget, sourceTableColumnName: keyof TSource): string;
	public static createForeignConstraintName<TTarget extends SequelizeBaseEntity<TTarget>, TSource extends SequelizeBaseEntity<TSource>>(targetTable: EntityType<TTarget> | string, sourceTable: EntityType<TSource> | string, targetTableColumnName: keyof TTarget | string, sourceTableColumnName: keyof TSource | string): string {
		const targetTableName = typeof targetTable === "string" ? targetTable : targetTable.entityTableName;
		const sourceTableName = typeof sourceTable === "string" ? sourceTable : sourceTable.entityTableName;

		return `${targetTableName}_${targetTableColumnName as string}_${sourceTableName}_${sourceTableColumnName as string}_fkey`;
	}

	/**
	 * Creates the name for unique key constraint on multiple columns
	 * @param targetTable Entity on which unique key is applied
	 * @param columnNames Name of target table unique key column names
	 */
	public static createUniqueKeyConstraintName<TTarget extends SequelizeBaseEntity<TTarget>>(targetTable: EntityType<TTarget>, ...columnNames: Array<keyof TTarget>): string {
		return `${targetTable.entityTableName}_${columnNames.join("_")}_ukey`;
	}

	private static schemaNameOrDefault(schema?: string): string {
		return schema ?? EnvExtractorHelper.env(DB_SCHEMA);
	}
}
