import { AggregateRoot, AllRows, RepositoryConfig, splitAggregateRoot } from "./Common.js"
import { Schema } from "effect"
import { makeCosmosTransformer } from "./Repository.js"

export function splitDocuments<R extends RepositoryConfig<any, any, any, any, any, any>>(
    item: AggregateRoot<R>,
    { config }: { config: R }
): unknown[] {
    const { id, root, entities } = splitAggregateRoot(config, item)
    const partitionKey = config.aggregate.partitionKey

    const RootFromCosmos = makeCosmosTransformer(config.root.type, config.aggregate.partitionKey, config.rootSchema())
    const newRoot = { id, [partitionKey]: id, ...root as object }
    const rootEncoded = Schema.encodeSync(RootFromCosmos)(newRoot)//.pipe(Effect.tapError((e) => Effect.logError(`Encoding error: ${e.message}`)))

    const toUpsert: unknown[] = []

    // root gets its id
    toUpsert.push({ id, [partitionKey]: id, ...(rootEncoded as object) })

    // entities: add id to "single", keep "collection" as is
    for (const key in config.entities) {
        const value = (entities as any)[key]
        const schema = Schema.Struct({
            id: Schema.String,
            [partitionKey]: Schema.String,
            ...config.entities[key].domainSchema.fields
        })
        const EntityFromCosmos = makeCosmosTransformer(config.entities[key].type, config.aggregate.partitionKey, schema)

        // "collection" or others: keep each element as is
        if (Array.isArray(value)) {
            toUpsert.push(...(value.map(v => (Schema.encodeSync(EntityFromCosmos)({ ...v, [partitionKey]: id })))))
        } else if (value != null) {
            toUpsert.push(Schema.encodeSync(EntityFromCosmos)({ id: config.entities[key].name, [partitionKey]: id, ...value }))
        }
    }

    return toUpsert
}

export function mergeDocumentsById<R extends RepositoryConfig<any, any, any, any, any, any>>(
    documents: AllRows<R>[],
    aggregateId: string,
    { config, items }: { config: R, items?: (keyof R['entities'])[] }
): AggregateRoot<R> | undefined {
    if (documents.length === 0) {
        console.error("No documents to merge for aggregateId:", aggregateId);
        return undefined;
    }

    const aggregatedDocuments = documents.filter(d => (d as any)[config.aggregate.partitionKey] === aggregateId);
    const candidateRootRow = aggregatedDocuments.find(r => r.type === config.root.type);
    if (!candidateRootRow) throw new Error("Root row not found.");

    const RootFromCosmos = makeCosmosTransformer(config.root.type, config.aggregate.partitionKey, config.rootSchema())
    const rootRow = Schema.decodeSync(RootFromCosmos)(candidateRootRow as any);


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
        const EntityFromCosmos = makeCosmosTransformer(config.entities[key].type, config.aggregate.partitionKey, config.entities[key].domainSchema)

        if (entityConfig.kind === "single") {
            const row = aggregatedDocuments.find(r =>
                r.id === config.entities[key].name &&
                r.type === entityConfig.type
            );
            if (row) {
                const decoded = Schema.decodeSync(EntityFromCosmos)(row as any);
                //const decoded = Schema.decodeSync(EntityFromCosmos)(data as any);
                result[key] = decoded;
            } else {
                result[key] = undefined;
            }
        } else if (entityConfig.kind === "collection") {
            const collectionItems = aggregatedDocuments
                .filter(r => {
                    return r.type === entityConfig.type
                })
                .map(r => {
                    const decoded = Schema.decodeSync(EntityFromCosmos)(r as any);
                    //const decoded = Schema.decodeSync(EntityFromCosmos)(data as any);

                    return decoded;
                });
            result[key] = collectionItems;
        }
    }

    return result as AggregateRoot<R>;
}

export function mergeDocuments<R extends RepositoryConfig<any, any, any, any, any, any>>(
    documents: AllRows<R>[],
    { config, items }: { config: R, items?: (keyof R['entities'])[] }
): AggregateRoot<R>[] {
    if (documents.length === 0) {
        return []
    }

    return documents
        .filter(d => d.type === config.root.type).map(d => (d as any).id)
        .map(id => mergeDocumentsById(documents, id, { config, items }));
}
