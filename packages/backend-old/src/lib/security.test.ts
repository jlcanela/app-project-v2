



import { describe, it, expect, vi } from 'vitest';

describe('Security tests', () => {

    const query = {
        "field": "projects.name",
        "operator": "eq",
        "type": "field",
        "value": "the-project"
    }

    // const newProject: ProjectAggregateRoot = {
    //     id: "proj-1" as ProjectId,
    //     name: "New Project",
    //     budget: {
    //         amount: 100000
    //     },
    //     deliverables: [
    //         { id: "deliv-1-1" as DeliverableId, name: "Deliverable 1-1" },
    //         { id: "deliv-1-2" as DeliverableId, name: "Deliverable 1-2" }
    //     ]
    // };

    // const newProject2: ProjectAggregateRoot = {
    //     id: "proj-2" as ProjectId,
    //     name: "New Project",
    //     budget: {
    //         amount: 100000
    //     },
    //     deliverables: [
    //         { id: "deliv-2-1" as DeliverableId, name: "Deliverable 2-1" },
    //         { id: "deliv-2-2" as DeliverableId, name: "Deliverable 2-2" }
    //     ]
    // };


    it('should return the right query', () => {
        // const loadedProject = mergeDocuments(allProjectData, {
        //     config: projectRepositoryConfig,
        //     items: ['budget', 'deliverables']
        // });

        // expect(loadedProject).toEqual([{ ProjectId: "proj-1", ...newProject }]);
    });

});
