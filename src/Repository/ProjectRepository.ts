
import { AggregateRoot, splitAggregateRoot } from "./Common.js"
import { projectRepositoryConfig } from "./Project.js"

type ProjectAggregateRoot = AggregateRoot<typeof projectRepositoryConfig>

export function upsert(item: ProjectAggregateRoot) {
  const { id, root, entities } = splitAggregateRoot(projectRepositoryConfig, item)

  const partitionKey = projectRepositoryConfig.aggregate.idSchema
  console.log("partitionKey", partitionKey)

  const toUpsert: unknown[] = []

  // root gets its id
  toUpsert.push({ id, [partitionKey]: id,  ...root })

  // entities: add id to "single", keep "collection" as is
  for (const key in projectRepositoryConfig.entities) {
    //const cfg = repositoryConfig.entities[key]
    const value = (entities as any)[key]

    // "collection" or others: keep each element as is
    if (Array.isArray(value)) {
    toUpsert.push(...(value.map(v => ({ ...v, [partitionKey]: id }))))
    } else if (value != null) {
    toUpsert.push({id, [partitionKey]: id, value})
    }
  }

  console.log("upserting", toUpsert)
}
