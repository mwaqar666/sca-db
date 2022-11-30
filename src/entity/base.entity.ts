import { EntityScope } from "@/entity/types";
import { Key } from "sca-core";
import { ModelStatic } from "sequelize";
import { Model } from "sequelize-typescript";

export abstract class BaseEntity<TEntity extends BaseEntity<TEntity>> extends Model<TEntity> {
	// Table & Column Name Information
	public static entityTableName: string;
	public static entitySchemaName: string;
	public static uuidColumnName: string;
	public static isActiveColumnName: string;

	// Column Exposure Information
	public static exposePrimaryKey = false;
	public static exposeForeignKeys: Array<Key<any>> = [];

	// Timestamps Information
	public static createdAtColumnName: string;
	public static updatedAtColumnName: string;
	public static deletedAtColumnName: string;

	public static applyScopes<TEntityStatic extends BaseEntity<TEntityStatic>>(this: ModelStatic<TEntityStatic>, providedScopes?: EntityScope): ModelStatic<TEntityStatic> {
		let scopesToApply: EntityScope = ["defaultScope"];

		if (providedScopes) scopesToApply = scopesToApply.concat(providedScopes);

		return this.scope(scopesToApply);
	}

	public removeDataValue(this: TEntity, key: keyof TEntity) {
		this.changed(key, true);

		delete this.dataValues[key];
	}
}
