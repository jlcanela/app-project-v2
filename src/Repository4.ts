import { AggregateRoot, AllRows } from "./Repository/Common.js";
import { DeliverableId, ProjectId, projectRepositoryConfig } from "./Repository/Project.js";
import { upsert } from "./Repository/ProjectRepository.js";

type ProjectAggregateRoot = AggregateRoot<typeof projectRepositoryConfig>


const newProject: ProjectAggregateRoot = {
    id: ProjectId.make("proj-1"),
    name: "New Project",
    budget: {
        amount: 100000
    },
    deliverables: [ 
      { id: DeliverableId.make("deliv-1"), name: "Deliverable 1" },
      { id: DeliverableId.make("deliv-2"), name: "Deliverable 2" }
    ]
}

upsert(newProject);

type ProjectAllRows = AllRows<typeof projectRepositoryConfig>

const allProjectData: ProjectAllRows[] =  [
  { id: 'proj-1', ProjectId: 'proj-1', name: 'New Project' },
  { id: 'proj-1', ProjectId: 'proj-1', value: { amount: 100000 } },
  { id: 'deliv-1', name: 'Deliverable 1', ProjectId: 'proj-1' },
  { id: 'deliv-2', name: 'Deliverable 2', ProjectId: 'proj-1' }
]

// todo implement mergeAll(allProjectData) to reconstruct newProject object