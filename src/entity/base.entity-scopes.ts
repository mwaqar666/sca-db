import { SequelizeScopeConst } from "@/const";
import { AvailableScopes, EntityType, SequelizeBaseEntity } from "@/entity/types";

export class BaseEntityScopes<TEntity extends SequelizeBaseEntity<TEntity>> {
	private constructor(private entity: EntityType<TEntity>, private scopes: AvailableScopes = {}) {}

	public static commonScopes<TEntityStatic extends SequelizeBaseEntity<TEntityStatic>>(entityCallback: () => typeof SequelizeBaseEntity<TEntityStatic>): AvailableScopes {
		const entityGetterCallback = entityCallback as () => EntityType<TEntityStatic>;
		const scopesInstance = new BaseEntityScopes(entityGetterCallback());

		scopesInstance
			// Handle scope logic according to their business in separate methods
			.preparePrimaryKeyScopes()
			.prepareUuidKeyScopes()
			.prepareCustomColumnParticipationScopes()
			.prepareTimestampsScopes()
			.prepareActiveColumnScopes();

		return scopesInstance.scopes;
	}

	private preparePrimaryKeyScopes(): BaseEntityScopes<TEntity> {
		this.scopes[SequelizeScopeConst.primaryKeyOnly] = { attributes: [this.entity.primaryKeyAttribute] };

		const entity = this.entity;

		this.scopes[SequelizeScopeConst.includingPrimaryKey] = function (...columns: string[]) {
			return { attributes: [entity.primaryKeyAttribute, ...columns] };
		};

		return this;
	}

	private prepareUuidKeyScopes(): BaseEntityScopes<TEntity> {
		if (!this.entity.uuidColumnName) return this;

		const entity = this.entity;

		this.scopes[SequelizeScopeConst.primaryKeyAndUuidOnly] = { attributes: [this.entity.primaryKeyAttribute, this.entity.uuidColumnName] };

		this.scopes[SequelizeScopeConst.includingPrimaryKeyAndUuid] = function (...columns: string[]) {
			return { attributes: [entity.primaryKeyAttribute, entity.uuidColumnName, ...columns] };
		};

		return this;
	}

	private prepareCustomColumnParticipationScopes(): BaseEntityScopes<TEntity> {
		this.scopes[SequelizeScopeConst.withColumns] = function (...columns: string[]) {
			return { attributes: columns };
		};

		this.scopes[SequelizeScopeConst.withoutColumns] = function (...columns: string[]) {
			return { attributes: { exclude: columns } };
		};

		this.scopes[SequelizeScopeConst.withoutSelectingColumns] = { attributes: [] };

		return this;
	}

	private prepareTimestampsScopes(): BaseEntityScopes<TEntity> {
		const availableTimestamps: string[] = [];

		if (this.entity.createdAtColumnName) availableTimestamps.push(this.entity.createdAtColumnName);
		if (this.entity.updatedAtColumnName) availableTimestamps.push(this.entity.updatedAtColumnName);
		if (this.entity.deletedAtColumnName) availableTimestamps.push(this.entity.deletedAtColumnName);

		if (availableTimestamps.length) this.scopes[SequelizeScopeConst.withoutTimestamps] = { attributes: { exclude: availableTimestamps } };

		return this;
	}

	private prepareActiveColumnScopes(): BaseEntityScopes<TEntity> {
		if (this.entity.isActiveColumnName) this.scopes[SequelizeScopeConst.isActive] = { where: { [this.entity.isActiveColumnName]: true } };

		return this;
	}
}
