import { EntityScope, EntityTableColumnProperties, SequelizeBaseEntity } from "@/entity/types";
import { FindOptions, Transaction } from "sequelize";

export type EntityResolution<TEntity extends SequelizeBaseEntity<TEntity>> = TEntity | string | number;

export interface Transactional {
	transaction: Transaction;
}

export interface Scoped {
	scopes: EntityScope;
}

export interface ScopedFindOptions<TEntity extends SequelizeBaseEntity<TEntity>> extends Partial<Scoped> {
	findOptions: FindOptions<TEntity>;
}

export interface EntityResolverOptions<TEntity extends SequelizeBaseEntity<TEntity>> {
	entity: EntityResolution<TEntity>;
}

export interface EntityFinderOptions<TEntity extends SequelizeBaseEntity<TEntity>> {
	findOptions: FindOptions<TEntity>;
}

export type EntityFinderOrResolverOption<TEntity extends SequelizeBaseEntity<TEntity>> = EntityResolverOptions<TEntity> | EntityFinderOptions<TEntity>;

export interface EntityCreateOptions<TEntity extends SequelizeBaseEntity<TEntity>> extends Transactional {
	valuesToCreate: Partial<EntityTableColumnProperties<TEntity>>;
}

export interface EntityUpdateBaseOptions<TEntity extends SequelizeBaseEntity<TEntity>> extends Transactional, Partial<Scoped> {
	valuesToUpdate: Partial<EntityTableColumnProperties<TEntity>>;
}

export type EntityFindOrCreateOptions<TEntity extends SequelizeBaseEntity<TEntity>> = Partial<EntityFinderOrResolverOption<TEntity>> & Partial<Scoped> & EntityCreateOptions<TEntity>;

export type EntityUpdateOptions<TEntity extends SequelizeBaseEntity<TEntity>> = EntityFinderOrResolverOption<TEntity> & EntityUpdateBaseOptions<TEntity>;

export type EntityCreateOrUpdateOptions<TEntity extends SequelizeBaseEntity<TEntity>> = EntityCreateOptions<TEntity> & Partial<EntityFinderOrResolverOption<TEntity>> & EntityUpdateBaseOptions<TEntity>;

export interface EntityDeleteBaseOptions extends Transactional, Partial<Scoped> {
	force?: boolean;
}

export type EntityDeleteOptions<TEntity extends SequelizeBaseEntity<TEntity>> = EntityFinderOrResolverOption<TEntity> & EntityDeleteBaseOptions;
