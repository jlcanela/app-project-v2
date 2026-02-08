import { ZenEngine } from '@gorules/zen-engine';
import fs from 'fs/promises';

type Event = {
  type: "PROJECT_CREATED";
  project: unknown;
}

const main = async () => {
  const content = await fs.readFile('./doc/business-rules/graph9.json');
  const engine = new ZenEngine();

  const project = { name: "a project", budget: 1000, cost: 1299 }
  const event1 = { type: 'PROJECT_CREATED', project } as Event;

  const decision = engine.createDecision(content);
  const result = await decision.evaluate({ project: { name: "a project", budget: 1000, cost: 1299 }});
  console.log(result);


  const event2 = { type: 'PROJECT_CREATED', project: { projectId: '123', name: 'New Project' } } as Event;

  const result2 = await decision.evaluate({ project: { name: "another project", budget: 1000, cost: 100 }});
  console.log(result2);
};

main().catch((err) => {
  console.error('Error executing business rules engine:', err);
});

