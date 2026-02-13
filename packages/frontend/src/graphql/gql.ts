/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetPosts($where: PostsFilters) {\n  posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n    id\n    content\n    authorId\n    author {\n      name\n    }\n  }\n}": typeof types.GetPostsDocument,
    "\n  query GetUsers {\n    users(orderBy: { name: { direction: asc, priority: 1 } }) {\n      id\n      name\n    }\n  }\n": typeof types.GetUsersDocument,
    "\n  query GetPosts($where: PostsFilters) {\n    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n      id\n      content\n      authorId\n      author {\n        name\n      }\n    }\n  }": typeof types.GetPostsDocument,
    "\nmutation CreateUser($name: String!) {\n  insertIntoUsersSingle(values: { name: $name }) {\n    id\n    name\n  }\n}\n": typeof types.CreateUserDocument,
    "\nmutation CreatePost($content: String!, $authorId: Int!) {\n  insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {\n    id\n    content\n    authorId\n  }\n}\n": typeof types.CreatePostDocument,
    "\n\nmutation DeletePost($id: Int!) {\n  deleteFromPosts(where: { id: { eq: $id } }) {\n    id\n    content\n    authorId\n  }\n}\n": typeof types.DeletePostDocument,
};
const documents: Documents = {
    "\n  query GetPosts($where: PostsFilters) {\n  posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n    id\n    content\n    authorId\n    author {\n      name\n    }\n  }\n}": types.GetPostsDocument,
    "\n  query GetUsers {\n    users(orderBy: { name: { direction: asc, priority: 1 } }) {\n      id\n      name\n    }\n  }\n": types.GetUsersDocument,
    "\n  query GetPosts($where: PostsFilters) {\n    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n      id\n      content\n      authorId\n      author {\n        name\n      }\n    }\n  }": types.GetPostsDocument,
    "\nmutation CreateUser($name: String!) {\n  insertIntoUsersSingle(values: { name: $name }) {\n    id\n    name\n  }\n}\n": types.CreateUserDocument,
    "\nmutation CreatePost($content: String!, $authorId: Int!) {\n  insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {\n    id\n    content\n    authorId\n  }\n}\n": types.CreatePostDocument,
    "\n\nmutation DeletePost($id: Int!) {\n  deleteFromPosts(where: { id: { eq: $id } }) {\n    id\n    content\n    authorId\n  }\n}\n": types.DeletePostDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPosts($where: PostsFilters) {\n  posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n    id\n    content\n    authorId\n    author {\n      name\n    }\n  }\n}"): typeof import('./graphql').GetPostsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsers {\n    users(orderBy: { name: { direction: asc, priority: 1 } }) {\n      id\n      name\n    }\n  }\n"): typeof import('./graphql').GetUsersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPosts($where: PostsFilters) {\n    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n      id\n      content\n      authorId\n      author {\n        name\n      }\n    }\n  }"): typeof import('./graphql').GetPostsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\nmutation CreateUser($name: String!) {\n  insertIntoUsersSingle(values: { name: $name }) {\n    id\n    name\n  }\n}\n"): typeof import('./graphql').CreateUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\nmutation CreatePost($content: String!, $authorId: Int!) {\n  insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {\n    id\n    content\n    authorId\n  }\n}\n"): typeof import('./graphql').CreatePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\nmutation DeletePost($id: Int!) {\n  deleteFromPosts(where: { id: { eq: $id } }) {\n    id\n    content\n    authorId\n  }\n}\n"): typeof import('./graphql').DeletePostDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
