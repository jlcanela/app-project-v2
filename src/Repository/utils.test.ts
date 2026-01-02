import { describe, it, expect, vi } from 'vitest';
import { AggregateRoot, AllRows } from "./Common.js";
import {
    projectRepositoryConfig,
    ProjectId as ProjectIdSchema,
    DeliverableId as DeliverableIdSchema
} from "./Project.js";
import { splitDocuments, mergeDocuments, filterAggregates } from "./utils.js";
import { Schema } from 'effect';

type ProjectId = Schema.Schema.Type<typeof ProjectIdSchema>;
type DeliverableId = Schema.Schema.Type<typeof DeliverableIdSchema>;

type ProjectAggregateRoot = AggregateRoot<typeof projectRepositoryConfig>;

describe('Aggregate utils tests', () => {

    const newProject: ProjectAggregateRoot = {
        id: "proj-1" as ProjectId,
        name: "New Project",
        budget: {
            amount: 100000
        },
        deliverables: [
            { id: "deliv-1-1" as DeliverableId, name: "Deliverable 1-1" },
            { id: "deliv-1-2" as DeliverableId, name: "Deliverable 1-2" }
        ]
    };

    const newProject2: ProjectAggregateRoot = {
        id: "proj-2" as ProjectId,
        name: "New Project",
        budget: {
            amount: 100000
        },
        deliverables: [
            { id: "deliv-2-1" as DeliverableId, name: "Deliverable 2-1" },
            { id: "deliv-2-2" as DeliverableId, name: "Deliverable 2-2" }
        ]
    };

    const allProjectData: AllRows<typeof projectRepositoryConfig>[] = [
        { id: 'proj-1', ProjectId: 'proj-1', type: 'project', properties: { name: 'New Project' } },
        { id: 'budget', ProjectId: 'proj-1', type: 'budget', properties: { amount: 100000 } },
        { id: 'deliv-1-1', ProjectId: 'proj-1', type: 'deliverable', properties: { name: 'Deliverable 1-1' } },
        { id: 'deliv-1-2', ProjectId: 'proj-1', type: 'deliverable', properties: { name: 'Deliverable 1-2' } }
    ];

    it('should merge documents into an aggregate', () => {
        const loadedProject = mergeDocuments(allProjectData, {
            config: projectRepositoryConfig,
            items: ['budget', 'deliverables']
        });

        expect(loadedProject).toEqual([{ ProjectId: "proj-1", ...newProject }]);
    });

    it('should flatten the aggregate into documents', () => {
        const upsertedData = splitDocuments(newProject, {
            config: projectRepositoryConfig,
        });

        expect(upsertedData).toHaveLength(allProjectData.length);
        expect(upsertedData).toEqual(expect.arrayContaining(allProjectData));

    });

    it('should filter documents', () => {
        const aggregates = [newProject, newProject2]

        const query = JSON.stringify({
            "budget.amount": { $gte: 50000 },
            deliverables: {
              $elemMatch: { name: "Deliverable 1-1" }
            }
        })

        const filtered = filterAggregates<ProjectAggregateRoot>(query, aggregates)
        expect(filtered).toEqual([newProject]);
    });
});
