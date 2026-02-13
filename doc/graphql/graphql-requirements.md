Here’s the updated, concise requirements list:
- Use Effect-TS as the core async, error, and environment layer. [effect](https://effect.website)
- Use effect-atom as the single source of truth for client state, with selected atoms persisted via Effect-friendly storage when needed (e.g., auth, settings). [skills](https://skills.sh/makisuo/skills/effect-best-practices)
- Use TanStack Router for routing and as a **coordinator** that triggers Effects/atoms, not as a second state system. [tanstack](https://tanstack.com/router/v1/docs/framework/react/guide/data-loading)
- Fetch GraphQL data at the page/route level through a single Effect-based GraphQL service (wrapper around fetch or a minimal client), never via ad-hoc fetch calls. [dev](https://dev.to/martinpersson/building-a-robust-backend-with-effect-graphql-and-drizzle-k4j)
- Use GraphQL fragments to compose queries and keep them DRY.  
- Use GraphQL → TypeScript code generation as the single source of truth for domain and operation types (no hand-written duplicates). [apollographql](https://www.apollographql.com/tutorials/lift-off-part1/09-codegen)
- Keep UI components purely presentational: they receive already-typed data from atoms/route loaders and never perform their own data fetching. [tanstack](https://tanstack.com/router/v1/docs/framework/react/guide/data-loading)
- Model page data with a consistent union state (e.g., idle/loading/success/error) for loading and error handling across all routes. [skills](https://skills.sh/makisuo/skills/effect-best-practices)
