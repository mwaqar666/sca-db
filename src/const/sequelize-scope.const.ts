export const SequelizeScopeConst = {
	// Without any columns (mostly for applying filter on relationship
	// table without selecting anything from it)
	withoutSelectingColumns: "withoutSelectingColumns",

	// Regarding PK
	primaryKeyOnly: "primaryKeyOnly",
	includingPrimaryKey: "includingPrimaryKey",

	// Regarding UUID
	primaryKeyAndUuidOnly: "primaryKeyAndUuidOnly",
	includingPrimaryKeyAndUuid: "includingPrimaryKeyAndUuid",

	// Regarding Other Columns
	withColumns: "withColumns",
	withoutColumns: "withoutColumns",

	// Miscellaneous
	isActive: "isActive",
	withoutTimestamps: "withoutTimestamps",
};
