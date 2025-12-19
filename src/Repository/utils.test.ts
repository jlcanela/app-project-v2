import { describe, it, expect, vi } from 'vitest';
import { AggregateRoot, AllRows } from "./Common.js";
import { 
    projectRepositoryConfig, 
    ProjectId as ProjectIdSchema, 
    DeliverableId as DeliverableIdSchema 
} from "./Project.js";
import { splitDocuments, mergeDocuments } from "./utils.js";
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
          { id: "deliv-1" as DeliverableId, name: "Deliverable 1" },
          { id: "deliv-2" as DeliverableId, name: "Deliverable 2" }
        ]
    };

    const allProjectData: AllRows<typeof projectRepositoryConfig>[] =  [
      { id: 'proj-1', type: 'project', properties: {name: 'New Project'} },
      { id: 'budget', type: 'budget', properties: { amount: 100000 } },
      { id: 'deliv-1', type: 'deliverable', properties: { name: 'Deliverable 1' } },
      { id: 'deliv-2', type: 'deliverable', properties: { name: 'Deliverable 2' } }
    ];

    it('should merge documents into an aggregate', () => {
        const loadedProject = mergeDocuments(allProjectData, { 
            config: projectRepositoryConfig, 
            items: ['budget', 'deliverables'] 
        });

        expect(loadedProject).toEqual(newProject);
    });

    it('should flatten the aggregate into documents', () => {      
        const upsertedData = splitDocuments(newProject, { 
            config: projectRepositoryConfig, 
        });
        
        expect(upsertedData).toHaveLength(allProjectData.length);
        expect(upsertedData).toEqual(expect.arrayContaining(allProjectData));

    });
});
