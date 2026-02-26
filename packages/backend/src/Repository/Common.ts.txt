import { Data, Schema } from "effect"

export const AggregateId = Schema.String.pipe(Schema.brand("AggregateId"))
export type AggregateId = typeof AggregateId.Type

export class AggregateConfig<
    Name extends string,
    PartitionKey extends string
> extends Data.TaggedClass("AggregateConfig")<{
    readonly name: Name
    readonly partitionKey: PartitionKey
}> { }

type EntityKind = "root" | "single" | "collection"

export class EntityConfig<
    Name extends string,
    Id extends Schema.Schema<any, any, any>,
    S extends Schema.Struct<any>,
    Kind extends EntityKind = EntityKind
> extends Data.TaggedClass("EntityConfig")<{
    readonly name: Name
    readonly kind: Kind
    readonly type: string
    readonly idSchema: Id
    readonly domainSchema: S
    // readonly persistenceSchema?: Schema.Schema<unknown>
    // readonly constraints?: ReadonlyArray<unknown>
}> {
    entitySchema() {
        return Schema.Struct({
            id: this.idSchema,
            type: Schema.Literal(this.name),
            ...this.domainSchema.fields
        })
    }
}

export class RepositoryConfig<
    AggregateName extends string,
    AggregateKey extends string,
    RootName extends string,
    EntityName extends string,
    RootConfig extends EntityConfig<RootName, any, Schema.Struct<any>, "root">,
    EntitiesConfig extends Record<
        EntityName,
        EntityConfig<EntityName, any, Schema.Struct<any>, "single" | "collection">
    >,
> extends Data.TaggedClass("RepositoryConfig")<{
    readonly aggregate: AggregateConfig<AggregateName, AggregateKey>
    readonly root: RootConfig
    readonly entities: EntitiesConfig
    // selections: SelectionConfig[]
    // updates: UpdateConfig[]
}> {
    rootSchema() {
        return Schema.Struct({
            id: Schema.String,
            [this.aggregate.partitionKey]: Schema.String,
            ...this.root.domainSchema.fields
        })
    }
    allSearchEntities() {
        const schemas: Array<EntityConfig<any, any, Schema.Struct<any>, any>> = Object.values(this.entities)
        const domainSchemas: ReadonlyArray<Schema.Schema.All> = schemas.map(s => Schema.partial(s.domainSchema))
        return Schema.Union(...domainSchemas)
    }
    aggregateSchema() {
        return Schema.Struct({
            ...this.rootSchema().fields,
            ...Object.fromEntries(
                (Object.entries(this.entities) as Array<[string, EntityConfig<any, any, Schema.Struct<any>, any>]>).map(([key, entityConfig]) => {
                    const domainSchema = entityConfig.domainSchema
                    return [key, entityConfig.kind === "collection"
                        ? Schema.Array(domainSchema)
                        : domainSchema
                    ]
                }))
        })
    }
    partialAggregateSchema() {
        return Schema.partial(Schema.Struct({
            ...this.rootSchema().fields,
            ...Object.fromEntries(
                (Object.entries(this.entities) as Array<[string, EntityConfig<any, any, Schema.Struct<any>, any>]>).map(([key, entityConfig]) => {
                    const domainSchema = Schema.partial(entityConfig.domainSchema)
                    return [key, entityConfig.kind === "collection"
                        ? Schema.Array(domainSchema)
                        : domainSchema
                    ]
                }))
        }))
    }

}

type RepositoryConfigInput<
  AggregateName extends string,
  AggregateKey extends string,
  RootName extends string,
  EntityName extends string,
  RootConfig extends EntityConfig<RootName, any, Schema.Struct<any>, "root">,
  EntitiesConfig extends Record<
    EntityName,
    EntityConfig<EntityName, any, Schema.Struct<any>, "single" | "collection">
  >,
> = {
  aggregate: AggregateConfig<AggregateName, AggregateKey>
  root: RootConfig
  entities: EntitiesConfig
}

export function makeRepositoryConfig<
  AggregateName extends string,
  AggregateKey extends string,
  RootName extends string,
  EntityName extends string,
  RootConfig extends EntityConfig<RootName, any, Schema.Struct<any>, "root">,
  EntitiesConfig extends Record<
    EntityName,
    EntityConfig<EntityName, any, Schema.Struct<any>, "single" | "collection">
  >,
>(
  config: RepositoryConfigInput<
    AggregateName,
    AggregateKey,
    RootName,
    EntityName,
    RootConfig,
    EntitiesConfig
  >
): RepositoryConfig<AggregateName, AggregateKey, RootName, EntityName, RootConfig, EntitiesConfig> {
  return new RepositoryConfig(config)
}

export type SchemaType<S extends Schema.Schema<any, any, any>> = Schema.Schema.Type<S>

type EntityShape<
    E extends EntityConfig<any, any, Schema.Struct<any>, EntityKind>
> = E["kind"] extends "collection"
    ? SchemaType<E["domainSchema"]>[]
    : SchemaType<E["domainSchema"]>

// Given a RepositoryConfig, build the aggregate root type:
// - start from the root entity's domain schema Type
// - add one property per entity with the corresponding domain schema Type
export type AggregateRoot<
    R extends RepositoryConfig<any, any, any, any, any, any>
> =
    // root is always a single object
    { id: SchemaType<R["root"]["idSchema"]> } & SchemaType<R["root"]["domainSchema"]> & {
        [K in keyof R["entities"]]: EntityShape<R["entities"][K]>
    }

// For a given RepositoryConfig, split a ProjectAggregateRoot into:
// - root object
// - record of entity objects
export function splitAggregateRoot<R extends RepositoryConfig<any, any, any, any, any, any>>(
    config: R,
    aggregate: AggregateRoot<R>
): {
    id: SchemaType<R["root"]["idSchema"]>
    root: SchemaType<R["root"]["domainSchema"]>
    entities: {
        [K in keyof R["entities"]]:
        R["entities"][K] extends EntityConfig<any, any, infer DomainSchema, any>
        ? SchemaType<DomainSchema>
        : never
    }
} {
    const { id, ...rest } = aggregate as any

    const root = { ...rest } as any
    const entities: any = {}

    for (const key in config.entities) {
        entities[key] = (rest as any)[key]
        delete (root as any)[key]
    }
    return { id, root, entities }
}

export type PartitionKeyOf<R extends RepositoryConfig<any, any, any, any, any, any>> =
    Schema.Schema.Type<R["aggregate"]["partitionKey"]>

export type AggregateKeyOf<R extends RepositoryConfig<any, any, any, any, any, any>> = R["aggregate"]["partitionKey"]

type RootRow<R extends RepositoryConfig<any, any, any, any, any, any>> =
    { id: string } &
    { [K in AggregateKeyOf<R>]: string } &
    SchemaType<R["root"]["domainSchema"]>

type EntityRow<
    R extends RepositoryConfig<any, any, any, any, any, any>,
    K extends keyof R["entities"]
> =
    R["entities"][K] extends EntityConfig<any, any, infer DomainSchema, infer Kind>
    ? Kind extends "single"
    ? { id: string } &
    { [K in AggregateKeyOf<R>]: string } &
    { value: SchemaType<DomainSchema> } : Kind extends "collection"
    ? { id: string } &
    { [K in AggregateKeyOf<R>]: string } &
    SchemaType<DomainSchema>
    : never
    : never

export type AllRows<R extends RepositoryConfig<any, any, any, any, any, any>> =
    | RootRow<R>
    | {
        [K in keyof R["entities"]]: EntityRow<R, K>
    }[keyof R["entities"]]

// Utility types to discriminate between single-item and collection fields
export type SingleItemKey<T> = {
    [K in keyof T]: T[K] extends ReadonlyArray<any> ? never : K;
}[keyof T];

export type CollectionKey<T> = {
    [K in keyof T]: T[K] extends ReadonlyArray<any> ? K : never;
}[keyof T];

export type SingleItemPayload<T, K extends SingleItemKey<T>> = T[K];

export type CollectionItemPayload<T, K extends CollectionKey<T>> = T[K] extends ReadonlyArray<infer U> ? U : never;

