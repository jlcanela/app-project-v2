import { AggregateRoot, AllRows, RepositoryConfig, splitAggregateRoot } from "./Common.js"
import { Schema } from "effect"
import { makeCosmosTransformer } from "./Repository.js"

export function splitDocuments<R extends RepositoryConfig<any, any, any, any, any, any>>(
    item: AggregateRoot<R>,
    { config }: { config: R }
): unknown[] {
    const { id, root, entities } = splitAggregateRoot(config, item)

    const RootFromCosmos = makeCosmosTransformer(config.root.type, config.rootSchema())
    const newRoot = { id, ...root as object }

    const rootEncoded = Schema.encodeSync(RootFromCosmos)(newRoot)//.pipe(Effect.tapError((e) => Effect.logError(`Encoding error: ${e.message}`)))
    const partitionKey = config.aggregate.idSchema

    const toUpsert: unknown[] = []

    // root gets its id
    toUpsert.push({ id, ...(rootEncoded as object) })

    // entities: add id to "single", keep "collection" as is
    for (const key in config.entities) {
        const value = (entities as any)[key]
        const schema = Schema.Struct({
            id: Schema.String, 
            ...config.entities[key].domainSchema.fields}) 
        const EntityFromCosmos = makeCosmosTransformer(config.entities[key].type, schema)

        // "collection" or others: keep each element as is
        if (Array.isArray(value)) {
            toUpsert.push(...(value.map(v => (Schema.encodeSync(EntityFromCosmos)({ ...v, [partitionKey]: id })))))
        } else if (value != null) {
            toUpsert.push(Schema.encodeSync(EntityFromCosmos)({ id: config.entities[key].name, [partitionKey]: id, ...value }))
        }
    }

    return toUpsert
}

export function mergeDocuments<R extends RepositoryConfig<any, any, any, any, any, any>>(
    documents: AllRows<R>[],
    { config, items }: { config: R, items?: (keyof R['entities'])[] }
): AggregateRoot<R> {
    if (documents.length === 0) {
        throw new Error("Cannot merge from empty rows array.");
    }

    const partitionKey = config.aggregate.idSchema;
    const aggregateId = (documents[0] as any)[partitionKey];

    const candidateRootRow = documents.find(r => r.type === config.root.type);
    if (!candidateRootRow) throw new Error("Root row not found.");

     const { [partitionKey]: _pk, ...encodedRootRow } = candidateRootRow as any;
     const RootFromCosmos = makeCosmosTransformer(config.root.type, config.rootSchema())
     const rootRow = Schema.decodeSync(RootFromCosmos)(encodedRootRow as any);
     

    const result: any = rootRow

    for (const key in config.entities) {
        if (items && !items.includes(key as any)) {
            if (config.entities[key].kind === 'collection') {
                result[key] = [];
            } else {
                result[key] = undefined;
            }
            continue;
        }

        const entityConfig = config.entities[key];
         const EntityFromCosmos = makeCosmosTransformer(config.entities[key].type, config.entities[key].domainSchema)

        if (entityConfig.kind === "single") {
            const row = documents.find(r =>
                r.id ===  config.entities[key].name && 
                r.type === entityConfig.type
            );
            if (row) {
                const { [partitionKey]: _pk, ...data } = row as any;
                const decoded = Schema.decodeSync(EntityFromCosmos)(data as any);
                result[key] = decoded;
            } else {
                result[key] = undefined;
            }
        } else if (entityConfig.kind === "collection") {
            const collectionItems = documents
                .filter(r => {
                    return r.type === entityConfig.type 
                })
                .map(r => {
                    const { [partitionKey]: _pk, ...data } = r as any;
                    const decoded = Schema.decodeSync(EntityFromCosmos)(data as any);
                    
                    return decoded;
                });
            result[key] = collectionItems;
        }
    }

    return result as AggregateRoot<R>;
}
