import { Data, Schema } from "effect"

export const AggregateId = Schema.String.pipe(Schema.brand("AggregateId"))
export type AggregateId = typeof AggregateId.Type

export class AggregateConfig<
    Name extends string,
    AggregateKey extends string
> extends Data.TaggedClass("AggregateConfig")<{
    readonly name: Name
    readonly idSchema: AggregateKey
}> { }

type EntityKind = "root" | "single" | "collection"

export class EntityConfig<
    Name extends string,
    Id extends Schema.Schema<any, any, any>,
    S extends Schema.Schema<any, any, any>,
    Kind extends EntityKind = EntityKind
> extends Data.TaggedClass("EntityConfig")<{
    readonly name: Name
    readonly kind: Kind
    readonly path: string
    readonly idSchema: Id
    readonly domainSchema: S
    // readonly persistenceSchema?: Schema.Schema<unknown>
    // readonly constraints?: ReadonlyArray<unknown>
}> { }

export class RepositoryConfig<
    AggregateName extends string,
    AggregateKey extends string,
    RootName extends string,
    EntityName extends string,
    RootConfig extends EntityConfig<RootName, any, any, "root">,
    EntitiesConfig extends Record<EntityName, EntityConfig<EntityName, any, any, "single" | "collection">>,
> extends Data.TaggedClass("RepositoryConfig")<{
    readonly aggregate: AggregateConfig<AggregateName, AggregateKey>
    readonly root: RootConfig
    readonly entities: EntitiesConfig
    // selections: SelectionConfig[]
    // updates: UpdateConfig[]
}> { }

export function makeRepositoryConfig<
    AggregateName extends string,
    AggregateKey extends string,
    RootName extends string,
    EntityName extends string,
    RootConfig extends EntityConfig<RootName, any, any, "root">,
    EntitiesConfig extends Record<EntityName, EntityConfig<EntityName, any, any, "single" | "collection">>,
>(
    config: {
        aggregate: AggregateConfig<AggregateName, AggregateKey>
        root: RootConfig
        entities: EntitiesConfig
    }
): RepositoryConfig<AggregateName, AggregateKey, RootName, EntityName, RootConfig, EntitiesConfig> {
    return new RepositoryConfig(config)
}

export type SchemaType<S extends Schema.Schema<any, any, any>> = Schema.Schema.Type<S>

type EntityShape<
    E extends EntityConfig<any, any, any, EntityKind>
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
    { id: string } & SchemaType<R["root"]["domainSchema"]> & {
        [K in keyof R["entities"]]: EntityShape<R["entities"][K]>
    }

// For a given RepositoryConfig, split a ProjectAggregateRoot into:
// - root object
// - record of entity objects
export function splitAggregateRoot<R extends RepositoryConfig<any, any, any, any, any, any>>(
    config: R,
    aggregate: AggregateRoot<R>
): {
    id: string
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

type PartitionKeyOf<R extends RepositoryConfig<any, any, any, any, any, any>> =
    Schema.Schema.Type<R["aggregate"]["idSchema"]>

type AggregateKeyOf<R extends RepositoryConfig<any, any, any, any, any, any>> = R["aggregate"]["idSchema"]

type RootRow<R extends RepositoryConfig<any, any, any, any, any, any>> =
    { id: string } & 
    { [K in AggregateKeyOf<R> ]: string } & 
    SchemaType<R["root"]["domainSchema"]>

type EntityRow<
    R extends RepositoryConfig<any, any, any, any, any, any>,
    K extends keyof R["entities"]
> =
    R["entities"][K] extends EntityConfig<any, any, infer DomainSchema, infer Kind>
    ? Kind extends "single"
      ? { id: string } & 
        { [K in AggregateKeyOf<R> ]: string } & 
        {   value: SchemaType<DomainSchema> } : Kind extends "collection"
        ? { id: string } &
          { [K in AggregateKeyOf<R> ]: string } & 
          SchemaType<DomainSchema>
        : never
    : never

export type AllRows<R extends RepositoryConfig<any, any, any, any, any, any>> =
    | RootRow<R>
    | {
        [K in keyof R["entities"]]: EntityRow<R, K>
    }[keyof R["entities"]]

