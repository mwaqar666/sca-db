import { DefaultScopedFindOptions } from "@/const";
import { EntityKeyValues, EntityScope, EntityType, SequelizeBaseEntity } from "@/entity/types";
import { EntityCreateOptions, EntityCreateOrUpdateOptions, EntityDeleteOptions, EntityFindOrCreateOptions, EntityResolution, EntityUpdateOptions, ScopedFindOptions } from "@/repository/types";
import { NotFoundException } from "@nestjs/common";
import { Nullable } from "sca-core";
import { CreationAttributes, WhereOptions } from "sequelize";

export abstract class BaseRepository<TEntity extends SequelizeBaseEntity<TEntity>> {
	protected constructor(protected entity: EntityType<TEntity>) {}

	public async findEntity(scopedFindOptions: ScopedFindOptions<TEntity>): Promise<Nullable<TEntity>> {
		scopedFindOptions = this.providedOrDefaultScopedFindOptions(scopedFindOptions);

		return await this.entity.applyScopes<TEntity>(scopedFindOptions.scopes).findOne<TEntity>(scopedFindOptions.findOptions);
	}

	public async findEntities(scopedFindOptions?: Partial<ScopedFindOptions<TEntity>>): Promise<Array<TEntity>> {
		scopedFindOptions = this.providedOrDefaultScopedFindOptions(scopedFindOptions);

		return await this.entity.applyScopes<TEntity>(scopedFindOptions.scopes).findAll<TEntity>(scopedFindOptions.findOptions);
	}

	public async findOrFailEntity(scopedFindOptions: ScopedFindOptions<TEntity>): Promise<TEntity> {
		scopedFindOptions = this.providedOrDefaultScopedFindOptions(scopedFindOptions);

		const foundEntity = await this.findEntity(scopedFindOptions);

		if (foundEntity) return foundEntity;

		throw new NotFoundException(`${this.entity.name} with key value pairs ${JSON.stringify(scopedFindOptions.findOptions)} not found!`);
	}

	public async resolveEntity(entity: EntityResolution<TEntity>, scopes?: EntityScope): Promise<Nullable<TEntity>> {
		if (typeof entity !== "string" && typeof entity !== "number") return Promise.resolve(entity);

		const scopedFindOptions = this.providedOrDefaultScopedFindOptions({ scopes });

		if (typeof entity === "string") {
			if (!this.entity.uuidColumnName) throw new Error(`Uuid column name not defined on ${this.entity.name}`);

			scopedFindOptions.findOptions = { where: { [this.entity.uuidColumnName]: entity } as WhereOptions<TEntity> };
			return await this.findEntity(scopedFindOptions);
		}

		scopedFindOptions.findOptions = { where: { [this.entity.primaryKeyAttribute]: entity } as WhereOptions<TEntity> };
		return await this.findEntity(scopedFindOptions);
	}

	public async resolveOrFailEntity(entity: EntityResolution<TEntity>, scopes?: EntityScope): Promise<TEntity> {
		const foundEntity = await this.resolveEntity(entity, scopes);

		if (foundEntity) return foundEntity;

		throw new NotFoundException(`${this.entity.name} not resolved with identifier ${entity}`);
	}

	public async findOrCreateEntity(entityFindOrCreateOptions: EntityFindOrCreateOptions<TEntity>): Promise<TEntity> {
		if ("entity" in entityFindOrCreateOptions && entityFindOrCreateOptions.entity) {
			const foundEntity = await this.resolveEntity(entityFindOrCreateOptions.entity, entityFindOrCreateOptions.scopes);

			if (foundEntity) return foundEntity;
		}

		if ("findOptions" in entityFindOrCreateOptions && entityFindOrCreateOptions.findOptions) {
			const foundEntity = await this.findEntity({ findOptions: entityFindOrCreateOptions.findOptions, scopes: entityFindOrCreateOptions.scopes });

			if (foundEntity) return foundEntity;
		}

		return await this.createEntity({ transaction: entityFindOrCreateOptions.transaction, valuesToCreate: entityFindOrCreateOptions.valuesToCreate });
	}

	public async createEntity(entityCreationOptions: EntityCreateOptions<TEntity>): Promise<TEntity> {
		return await this.entity.create<TEntity>(entityCreationOptions.valuesToCreate as CreationAttributes<TEntity>, { transaction: entityCreationOptions.transaction });
	}

	public async updateEntity(entityUpdateOptions: EntityUpdateOptions<TEntity>): Promise<TEntity> {
		let foundEntity: TEntity;

		if ("findOptions" in entityUpdateOptions) {
			foundEntity = await this.findOrFailEntity({ findOptions: entityUpdateOptions.findOptions, scopes: entityUpdateOptions.scopes });
		} else {
			foundEntity = await this.resolveOrFailEntity(entityUpdateOptions.entity, entityUpdateOptions.scopes);
		}

		return foundEntity.update(entityUpdateOptions.valuesToUpdate as EntityKeyValues<TEntity>, { transaction: entityUpdateOptions.transaction });
	}

	public async updateOrCreateEntity(entityCreateOrUpdateOptions: EntityCreateOrUpdateOptions<TEntity>): Promise<TEntity> {
		if ("entity" in entityCreateOrUpdateOptions && entityCreateOrUpdateOptions.entity) {
			const foundEntity = await this.resolveEntity(entityCreateOrUpdateOptions.entity, entityCreateOrUpdateOptions.scopes);

			if (foundEntity) return await foundEntity.update(entityCreateOrUpdateOptions.valuesToUpdate as EntityKeyValues<TEntity>, { transaction: entityCreateOrUpdateOptions.transaction });
		}

		if ("findOptions" in entityCreateOrUpdateOptions && entityCreateOrUpdateOptions.findOptions) {
			const foundEntity = await this.findEntity({ findOptions: entityCreateOrUpdateOptions.findOptions, scopes: entityCreateOrUpdateOptions.scopes });

			if (foundEntity) return await foundEntity.update(entityCreateOrUpdateOptions.valuesToUpdate as EntityKeyValues<TEntity>, { transaction: entityCreateOrUpdateOptions.transaction });
		}

		return await this.createEntity({ transaction: entityCreateOrUpdateOptions.transaction, valuesToCreate: { ...entityCreateOrUpdateOptions.valuesToCreate, ...entityCreateOrUpdateOptions.valuesToUpdate } });
	}

	public async deleteEntity(entityDeleteOptions: EntityDeleteOptions<TEntity>): Promise<boolean> {
		if ("findOptions" in entityDeleteOptions) {
			const foundEntity = await this.findEntity({ findOptions: entityDeleteOptions.findOptions, scopes: entityDeleteOptions.scopes });
			if (!foundEntity) return false;

			await foundEntity.destroy({ transaction: entityDeleteOptions.transaction, force: entityDeleteOptions.force ?? false });
			return true;
		}

		const foundEntity = await this.resolveEntity(entityDeleteOptions.entity, entityDeleteOptions.scopes);
		if (!foundEntity) return false;

		await foundEntity.destroy({ transaction: entityDeleteOptions.transaction, force: entityDeleteOptions.force ?? false });
		return true;
	}

	private providedOrDefaultScopedFindOptions(scopedFindOptions?: Partial<ScopedFindOptions<TEntity>>): ScopedFindOptions<TEntity> {
		const scopedEntityFindOptions = scopedFindOptions ?? DefaultScopedFindOptions;

		scopedEntityFindOptions.scopes = scopedEntityFindOptions.scopes ?? DefaultScopedFindOptions.scopes;
		scopedEntityFindOptions.findOptions = scopedEntityFindOptions.findOptions ?? DefaultScopedFindOptions.findOptions;

		return scopedFindOptions as ScopedFindOptions<TEntity>;
	}
}
