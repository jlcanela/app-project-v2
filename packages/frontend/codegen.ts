import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/graphql/schema.graphql',          // or 'http://localhost:4000/graphql'
  documents: ['src/graphql/operations/**/*.graphql', 'src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    'src/graphql/': {
      preset: 'client',
        config: {
        documentMode: 'string',
      },
      // plugins: [
      //   'typescript',
      //   'typescript-operations',
      // ],
      // config: {
      //   documentMode: 'string',
      //   documentNodeType: 'TypedDocumentString',
      //   avoidOptionals: true,
      //   maybeValue: 'T | null',
      //   //immutableTypes: true,
      // },
    },
  },
};

export default config;

  /**
   * Ensure the custom document type is declared alongside the generated ops.
   * You can also move this to a separate file if you prefer.
   */
//  config: {
    // If you don’t already define it, you can add this manually in `graphql.gen.ts`:
    // export type TypedDocumentString<TResult, TVariables> = string & {
    //   __apiType?: {
    //     result: TResult;
    //     variables: TVariables;
    //   };
    // };
//  },
