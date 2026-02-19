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
    "\n  fragment AuthorUserItem on UsersSelectItem {\n    id\n    name\n  }\n": typeof types.AuthorUserItemFragmentDoc,
    "\n  fragment PostItem on PostsSelectItem {\n    id\n    content\n    authorId\n    author {\n      name\n    }\n  }\n": typeof types.PostItemFragmentDoc,
    "\n  fragment SelectedUserItem on UsersSelectItem {\n    id\n    name\n  }\n": typeof types.SelectedUserItemFragmentDoc,
    "\n  query GetUsers {\n    users(orderBy: { name: { direction: asc, priority: 1 } }) {\n      id\n      ...UserItem\n      ...SelectedUserItem\n      ...AuthorUserItem\n    }\n  }\n": typeof types.GetUsersDocument,
    "\n  query GetPosts($where: PostsFilters) {\n    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n      id\n      authorId\n      ...PostItem\n    }\n  }\n": typeof types.GetPostsDocument,
    "\n  mutation CreateUser($name: String!) {\n    insertIntoUsersSingle(values: { name: $name }) {\n      id\n      name\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation CreatePost($content: String!, $authorId: Int!) {\n    insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {\n      id\n      content\n      authorId\n    }\n  }\n": typeof types.CreatePostDocument,
    "\n  mutation DeletePost($id: Int!) {\n    deleteFromPosts(where: { id: { eq: $id } }) {\n      id\n      content\n      authorId\n    }\n  }\n": typeof types.DeletePostDocument,
    "\n  fragment UserItem on UsersSelectItem {\n    id\n    name\n  }\n": typeof types.UserItemFragmentDoc,
    "\n  fragment SelectRuleTypeItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n  }\n": typeof types.SelectRuleTypeItemFragmentDoc,
    "\n  fragment RuleDetailItem on RuleInstancesSelectItem {\n    ruleId\n    content\n  }\n": typeof types.RuleDetailItemFragmentDoc,
    "\n  query RuleInstancesItem {\n    ruleInstances(orderBy: { ruleId: { direction: asc, priority: 1 } }) {\n      ruleId\n      name\n      ...RuleDetailItem\n    }\n  }\n": typeof types.RuleInstancesItemDocument,
    "\n  mutation CreateRule($name: String!, $description: String!, $content: String!) {\n    insertIntoRuleInstancesSingle(values: { name: $name, description: $description, content: $content }) {\n      ruleId\n      name\n      description\n      content\n    }\n  }\n": typeof types.CreateRuleDocument,
    "\n  fragment RuleItem on RuleInstancesSelectItem {\n    ruleId\n    name\n    description\n  }\n": typeof types.RuleItemFragmentDoc,
    "\n  fragment RuleTypeGeneralItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n    description\n  }\n": typeof types.RuleTypeGeneralItemFragmentDoc,
    "\n  query RulesType {\n    ruleTypes(orderBy: { ruleTypeId: { direction: asc, priority: 1 } }) {\n      ruleTypeId\n      schemaIn\n      schemaOut\n      ...RuleTypeItem\n      ...RuleTypeGeneralItem\n      #...UserItem\n      #...SelectedUserItem\n      #...AuthorUserItem\n    }\n  }\n": typeof types.RulesTypeDocument,
    "\n  fragment RuleTypeItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n    schemaIn\n    schemaOut\n  }\n": typeof types.RuleTypeItemFragmentDoc,
};
const documents: Documents = {
    "\n  fragment AuthorUserItem on UsersSelectItem {\n    id\n    name\n  }\n": types.AuthorUserItemFragmentDoc,
    "\n  fragment PostItem on PostsSelectItem {\n    id\n    content\n    authorId\n    author {\n      name\n    }\n  }\n": types.PostItemFragmentDoc,
    "\n  fragment SelectedUserItem on UsersSelectItem {\n    id\n    name\n  }\n": types.SelectedUserItemFragmentDoc,
    "\n  query GetUsers {\n    users(orderBy: { name: { direction: asc, priority: 1 } }) {\n      id\n      ...UserItem\n      ...SelectedUserItem\n      ...AuthorUserItem\n    }\n  }\n": types.GetUsersDocument,
    "\n  query GetPosts($where: PostsFilters) {\n    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n      id\n      authorId\n      ...PostItem\n    }\n  }\n": types.GetPostsDocument,
    "\n  mutation CreateUser($name: String!) {\n    insertIntoUsersSingle(values: { name: $name }) {\n      id\n      name\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation CreatePost($content: String!, $authorId: Int!) {\n    insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {\n      id\n      content\n      authorId\n    }\n  }\n": types.CreatePostDocument,
    "\n  mutation DeletePost($id: Int!) {\n    deleteFromPosts(where: { id: { eq: $id } }) {\n      id\n      content\n      authorId\n    }\n  }\n": types.DeletePostDocument,
    "\n  fragment UserItem on UsersSelectItem {\n    id\n    name\n  }\n": types.UserItemFragmentDoc,
    "\n  fragment SelectRuleTypeItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n  }\n": types.SelectRuleTypeItemFragmentDoc,
    "\n  fragment RuleDetailItem on RuleInstancesSelectItem {\n    ruleId\n    content\n  }\n": types.RuleDetailItemFragmentDoc,
    "\n  query RuleInstancesItem {\n    ruleInstances(orderBy: { ruleId: { direction: asc, priority: 1 } }) {\n      ruleId\n      name\n      ...RuleDetailItem\n    }\n  }\n": types.RuleInstancesItemDocument,
    "\n  mutation CreateRule($name: String!, $description: String!, $content: String!) {\n    insertIntoRuleInstancesSingle(values: { name: $name, description: $description, content: $content }) {\n      ruleId\n      name\n      description\n      content\n    }\n  }\n": types.CreateRuleDocument,
    "\n  fragment RuleItem on RuleInstancesSelectItem {\n    ruleId\n    name\n    description\n  }\n": types.RuleItemFragmentDoc,
    "\n  fragment RuleTypeGeneralItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n    description\n  }\n": types.RuleTypeGeneralItemFragmentDoc,
    "\n  query RulesType {\n    ruleTypes(orderBy: { ruleTypeId: { direction: asc, priority: 1 } }) {\n      ruleTypeId\n      schemaIn\n      schemaOut\n      ...RuleTypeItem\n      ...RuleTypeGeneralItem\n      #...UserItem\n      #...SelectedUserItem\n      #...AuthorUserItem\n    }\n  }\n": types.RulesTypeDocument,
    "\n  fragment RuleTypeItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n    schemaIn\n    schemaOut\n  }\n": types.RuleTypeItemFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AuthorUserItem on UsersSelectItem {\n    id\n    name\n  }\n"): typeof import('./graphql').AuthorUserItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PostItem on PostsSelectItem {\n    id\n    content\n    authorId\n    author {\n      name\n    }\n  }\n"): typeof import('./graphql').PostItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SelectedUserItem on UsersSelectItem {\n    id\n    name\n  }\n"): typeof import('./graphql').SelectedUserItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsers {\n    users(orderBy: { name: { direction: asc, priority: 1 } }) {\n      id\n      ...UserItem\n      ...SelectedUserItem\n      ...AuthorUserItem\n    }\n  }\n"): typeof import('./graphql').GetUsersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPosts($where: PostsFilters) {\n    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {\n      id\n      authorId\n      ...PostItem\n    }\n  }\n"): typeof import('./graphql').GetPostsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser($name: String!) {\n    insertIntoUsersSingle(values: { name: $name }) {\n      id\n      name\n    }\n  }\n"): typeof import('./graphql').CreateUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePost($content: String!, $authorId: Int!) {\n    insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {\n      id\n      content\n      authorId\n    }\n  }\n"): typeof import('./graphql').CreatePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeletePost($id: Int!) {\n    deleteFromPosts(where: { id: { eq: $id } }) {\n      id\n      content\n      authorId\n    }\n  }\n"): typeof import('./graphql').DeletePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserItem on UsersSelectItem {\n    id\n    name\n  }\n"): typeof import('./graphql').UserItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SelectRuleTypeItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n  }\n"): typeof import('./graphql').SelectRuleTypeItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RuleDetailItem on RuleInstancesSelectItem {\n    ruleId\n    content\n  }\n"): typeof import('./graphql').RuleDetailItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RuleInstancesItem {\n    ruleInstances(orderBy: { ruleId: { direction: asc, priority: 1 } }) {\n      ruleId\n      name\n      ...RuleDetailItem\n    }\n  }\n"): typeof import('./graphql').RuleInstancesItemDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateRule($name: String!, $description: String!, $content: String!) {\n    insertIntoRuleInstancesSingle(values: { name: $name, description: $description, content: $content }) {\n      ruleId\n      name\n      description\n      content\n    }\n  }\n"): typeof import('./graphql').CreateRuleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RuleItem on RuleInstancesSelectItem {\n    ruleId\n    name\n    description\n  }\n"): typeof import('./graphql').RuleItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RuleTypeGeneralItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n    description\n  }\n"): typeof import('./graphql').RuleTypeGeneralItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RulesType {\n    ruleTypes(orderBy: { ruleTypeId: { direction: asc, priority: 1 } }) {\n      ruleTypeId\n      schemaIn\n      schemaOut\n      ...RuleTypeItem\n      ...RuleTypeGeneralItem\n      #...UserItem\n      #...SelectedUserItem\n      #...AuthorUserItem\n    }\n  }\n"): typeof import('./graphql').RulesTypeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RuleTypeItem on RuleTypesSelectItem {\n    ruleTypeId\n    name\n    schemaIn\n    schemaOut\n  }\n"): typeof import('./graphql').RuleTypeItemFragmentDoc;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
