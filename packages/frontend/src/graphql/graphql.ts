/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type InnerOrder = {
  direction: OrderDirection;
  /** Priority of current field */
  priority: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteFromPosts: Array<PostsItem>;
  deleteFromRuleInstances: Array<RuleInstancesItem>;
  deleteFromRuleTypes: Array<RuleTypesItem>;
  deleteFromUsers: Array<UsersItem>;
  insertIntoPosts: Array<PostsItem>;
  insertIntoPostsSingle?: Maybe<PostsItem>;
  insertIntoRuleInstances: Array<RuleInstancesItem>;
  insertIntoRuleInstancesSingle?: Maybe<RuleInstancesItem>;
  insertIntoRuleTypes: Array<RuleTypesItem>;
  insertIntoRuleTypesSingle?: Maybe<RuleTypesItem>;
  insertIntoUsers: Array<UsersItem>;
  insertIntoUsersSingle?: Maybe<UsersItem>;
  updatePosts: Array<PostsItem>;
  updateRuleInstances: Array<RuleInstancesItem>;
  updateRuleTypes: Array<RuleTypesItem>;
  updateUsers: Array<UsersItem>;
};


export type MutationDeleteFromPostsArgs = {
  where?: InputMaybe<PostsFilters>;
};


export type MutationDeleteFromRuleInstancesArgs = {
  where?: InputMaybe<RuleInstancesFilters>;
};


export type MutationDeleteFromRuleTypesArgs = {
  where?: InputMaybe<RuleTypesFilters>;
};


export type MutationDeleteFromUsersArgs = {
  where?: InputMaybe<UsersFilters>;
};


export type MutationInsertIntoPostsArgs = {
  values: Array<PostsInsertInput>;
};


export type MutationInsertIntoPostsSingleArgs = {
  values: PostsInsertInput;
};


export type MutationInsertIntoRuleInstancesArgs = {
  values: Array<RuleInstancesInsertInput>;
};


export type MutationInsertIntoRuleInstancesSingleArgs = {
  values: RuleInstancesInsertInput;
};


export type MutationInsertIntoRuleTypesArgs = {
  values: Array<RuleTypesInsertInput>;
};


export type MutationInsertIntoRuleTypesSingleArgs = {
  values: RuleTypesInsertInput;
};


export type MutationInsertIntoUsersArgs = {
  values: Array<UsersInsertInput>;
};


export type MutationInsertIntoUsersSingleArgs = {
  values: UsersInsertInput;
};


export type MutationUpdatePostsArgs = {
  set: PostsUpdateInput;
  where?: InputMaybe<PostsFilters>;
};


export type MutationUpdateRuleInstancesArgs = {
  set: RuleInstancesUpdateInput;
  where?: InputMaybe<RuleInstancesFilters>;
};


export type MutationUpdateRuleTypesArgs = {
  set: RuleTypesUpdateInput;
  where?: InputMaybe<RuleTypesFilters>;
};


export type MutationUpdateUsersArgs = {
  set: UsersUpdateInput;
  where?: InputMaybe<UsersFilters>;
};

/** Order by direction */
export enum OrderDirection {
  /** Ascending order */
  Asc = 'asc',
  /** Descending order */
  Desc = 'desc'
}

export type PostsAuthorIdFilters = {
  OR?: InputMaybe<Array<PostsAuthorIdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PostsAuthorIdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PostsAuthorRelation = {
  __typename?: 'PostsAuthorRelation';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  posts: Array<PostsAuthorRelationPostsRelation>;
};


export type PostsAuthorRelationPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PostsOrderBy>;
  where?: InputMaybe<PostsFilters>;
};

export type PostsAuthorRelationPostsRelation = {
  __typename?: 'PostsAuthorRelationPostsRelation';
  authorId: Scalars['Int']['output'];
  content: Scalars['String']['output'];
  id: Scalars['Int']['output'];
};

export type PostsContentFilters = {
  OR?: InputMaybe<Array<PostsContentfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PostsContentfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PostsFilters = {
  OR?: InputMaybe<Array<PostsFiltersOr>>;
  authorId?: InputMaybe<PostsAuthorIdFilters>;
  content?: InputMaybe<PostsContentFilters>;
  id?: InputMaybe<PostsIdFilters>;
};

export type PostsFiltersOr = {
  authorId?: InputMaybe<PostsAuthorIdFilters>;
  content?: InputMaybe<PostsContentFilters>;
  id?: InputMaybe<PostsIdFilters>;
};

export type PostsIdFilters = {
  OR?: InputMaybe<Array<PostsIdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PostsIdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PostsInsertInput = {
  authorId: Scalars['Int']['input'];
  content: Scalars['String']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type PostsItem = {
  __typename?: 'PostsItem';
  authorId: Scalars['Int']['output'];
  content: Scalars['String']['output'];
  id: Scalars['Int']['output'];
};

export type PostsOrderBy = {
  authorId?: InputMaybe<InnerOrder>;
  content?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
};

export type PostsSelectItem = {
  __typename?: 'PostsSelectItem';
  author?: Maybe<PostsAuthorRelation>;
  authorId: Scalars['Int']['output'];
  content: Scalars['String']['output'];
  id: Scalars['Int']['output'];
};


export type PostsSelectItemAuthorArgs = {
  where?: InputMaybe<UsersFilters>;
};

export type PostsUpdateInput = {
  authorId?: InputMaybe<Scalars['Int']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  posts: Array<PostsSelectItem>;
  postsSingle?: Maybe<PostsSelectItem>;
  ruleInstances: Array<RuleInstancesSelectItem>;
  ruleInstancesSingle?: Maybe<RuleInstancesSelectItem>;
  ruleTypes: Array<RuleTypesSelectItem>;
  ruleTypesSingle?: Maybe<RuleTypesSelectItem>;
  users: Array<UsersSelectItem>;
  usersSingle?: Maybe<UsersSelectItem>;
};


export type QueryPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PostsOrderBy>;
  where?: InputMaybe<PostsFilters>;
};


export type QueryPostsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PostsOrderBy>;
  where?: InputMaybe<PostsFilters>;
};


export type QueryRuleInstancesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RuleInstancesOrderBy>;
  where?: InputMaybe<RuleInstancesFilters>;
};


export type QueryRuleInstancesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RuleInstancesOrderBy>;
  where?: InputMaybe<RuleInstancesFilters>;
};


export type QueryRuleTypesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RuleTypesOrderBy>;
  where?: InputMaybe<RuleTypesFilters>;
};


export type QueryRuleTypesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RuleTypesOrderBy>;
  where?: InputMaybe<RuleTypesFilters>;
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UsersOrderBy>;
  where?: InputMaybe<UsersFilters>;
};


export type QueryUsersSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UsersOrderBy>;
  where?: InputMaybe<UsersFilters>;
};

export type RuleInstancesDescriptionFilters = {
  OR?: InputMaybe<Array<RuleInstancesDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleInstancesDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleInstancesFilters = {
  OR?: InputMaybe<Array<RuleInstancesFiltersOr>>;
  description?: InputMaybe<RuleInstancesDescriptionFilters>;
  name?: InputMaybe<RuleInstancesNameFilters>;
  ruleId?: InputMaybe<RuleInstancesRuleIdFilters>;
};

export type RuleInstancesFiltersOr = {
  description?: InputMaybe<RuleInstancesDescriptionFilters>;
  name?: InputMaybe<RuleInstancesNameFilters>;
  ruleId?: InputMaybe<RuleInstancesRuleIdFilters>;
};

export type RuleInstancesInsertInput = {
  description: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  ruleId?: InputMaybe<Scalars['Int']['input']>;
};

export type RuleInstancesItem = {
  __typename?: 'RuleInstancesItem';
  description: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ruleId: Scalars['Int']['output'];
};

export type RuleInstancesNameFilters = {
  OR?: InputMaybe<Array<RuleInstancesNamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleInstancesNamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleInstancesOrderBy = {
  description?: InputMaybe<InnerOrder>;
  name?: InputMaybe<InnerOrder>;
  ruleId?: InputMaybe<InnerOrder>;
};

export type RuleInstancesRuleIdFilters = {
  OR?: InputMaybe<Array<RuleInstancesRuleIdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleInstancesRuleIdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleInstancesSelectItem = {
  __typename?: 'RuleInstancesSelectItem';
  description: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ruleId: Scalars['Int']['output'];
};

export type RuleInstancesUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ruleId?: InputMaybe<Scalars['Int']['input']>;
};

export type RuleTypesDescriptionFilters = {
  OR?: InputMaybe<Array<RuleTypesDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesFilters = {
  OR?: InputMaybe<Array<RuleTypesFiltersOr>>;
  description?: InputMaybe<RuleTypesDescriptionFilters>;
  name?: InputMaybe<RuleTypesNameFilters>;
  ruleTypeId?: InputMaybe<RuleTypesRuleTypeIdFilters>;
  schemaIn?: InputMaybe<RuleTypesSchemaInFilters>;
  schemaOut?: InputMaybe<RuleTypesSchemaOutFilters>;
};

export type RuleTypesFiltersOr = {
  description?: InputMaybe<RuleTypesDescriptionFilters>;
  name?: InputMaybe<RuleTypesNameFilters>;
  ruleTypeId?: InputMaybe<RuleTypesRuleTypeIdFilters>;
  schemaIn?: InputMaybe<RuleTypesSchemaInFilters>;
  schemaOut?: InputMaybe<RuleTypesSchemaOutFilters>;
};

export type RuleTypesInsertInput = {
  description: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  ruleTypeId?: InputMaybe<Scalars['Int']['input']>;
  schemaIn: Scalars['String']['input'];
  schemaOut: Scalars['String']['input'];
};

export type RuleTypesItem = {
  __typename?: 'RuleTypesItem';
  description: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ruleTypeId: Scalars['Int']['output'];
  schemaIn: Scalars['String']['output'];
  schemaOut: Scalars['String']['output'];
};

export type RuleTypesNameFilters = {
  OR?: InputMaybe<Array<RuleTypesNamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesNamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesOrderBy = {
  description?: InputMaybe<InnerOrder>;
  name?: InputMaybe<InnerOrder>;
  ruleTypeId?: InputMaybe<InnerOrder>;
  schemaIn?: InputMaybe<InnerOrder>;
  schemaOut?: InputMaybe<InnerOrder>;
};

export type RuleTypesRuleTypeIdFilters = {
  OR?: InputMaybe<Array<RuleTypesRuleTypeIdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesRuleTypeIdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesSchemaInFilters = {
  OR?: InputMaybe<Array<RuleTypesSchemaInfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesSchemaInfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesSchemaOutFilters = {
  OR?: InputMaybe<Array<RuleTypesSchemaOutfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesSchemaOutfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RuleTypesSelectItem = {
  __typename?: 'RuleTypesSelectItem';
  description: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ruleTypeId: Scalars['Int']['output'];
  schemaIn: Scalars['String']['output'];
  schemaOut: Scalars['String']['output'];
};

export type RuleTypesUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ruleTypeId?: InputMaybe<Scalars['Int']['input']>;
  schemaIn?: InputMaybe<Scalars['String']['input']>;
  schemaOut?: InputMaybe<Scalars['String']['input']>;
};

export type UsersFilters = {
  OR?: InputMaybe<Array<UsersFiltersOr>>;
  id?: InputMaybe<UsersIdFilters>;
  name?: InputMaybe<UsersNameFilters>;
};

export type UsersFiltersOr = {
  id?: InputMaybe<UsersIdFilters>;
  name?: InputMaybe<UsersNameFilters>;
};

export type UsersIdFilters = {
  OR?: InputMaybe<Array<UsersIdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UsersIdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UsersInsertInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type UsersItem = {
  __typename?: 'UsersItem';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type UsersNameFilters = {
  OR?: InputMaybe<Array<UsersNamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UsersNamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UsersOrderBy = {
  id?: InputMaybe<InnerOrder>;
  name?: InputMaybe<InnerOrder>;
};

export type UsersPostsRelation = {
  __typename?: 'UsersPostsRelation';
  author?: Maybe<UsersPostsRelationAuthorRelation>;
  authorId: Scalars['Int']['output'];
  content: Scalars['String']['output'];
  id: Scalars['Int']['output'];
};


export type UsersPostsRelationAuthorArgs = {
  where?: InputMaybe<UsersFilters>;
};

export type UsersPostsRelationAuthorRelation = {
  __typename?: 'UsersPostsRelationAuthorRelation';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type UsersSelectItem = {
  __typename?: 'UsersSelectItem';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  posts: Array<UsersPostsRelation>;
};


export type UsersSelectItemPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PostsOrderBy>;
  where?: InputMaybe<PostsFilters>;
};

export type UsersUpdateInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type AuthorUserItemFragment = { __typename?: 'UsersSelectItem', id: number, name: string } & { ' $fragmentName'?: 'AuthorUserItemFragment' };

export type PostItemFragment = { __typename?: 'PostsSelectItem', id: number, content: string, authorId: number, author?: { __typename?: 'PostsAuthorRelation', name: string } | null } & { ' $fragmentName'?: 'PostItemFragment' };

export type SelectedUserItemFragment = { __typename?: 'UsersSelectItem', id: number, name: string } & { ' $fragmentName'?: 'SelectedUserItemFragment' };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<(
    { __typename?: 'UsersSelectItem', id: number }
    & { ' $fragmentRefs'?: { 'UserItemFragment': UserItemFragment;'SelectedUserItemFragment': SelectedUserItemFragment;'AuthorUserItemFragment': AuthorUserItemFragment } }
  )> };

export type GetPostsQueryVariables = Exact<{
  where?: InputMaybe<PostsFilters>;
}>;


export type GetPostsQuery = { __typename?: 'Query', posts: Array<(
    { __typename?: 'PostsSelectItem', id: number, authorId: number }
    & { ' $fragmentRefs'?: { 'PostItemFragment': PostItemFragment } }
  )> };

export type CreateUserMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', insertIntoUsersSingle?: { __typename?: 'UsersItem', id: number, name: string } | null };

export type CreatePostMutationVariables = Exact<{
  content: Scalars['String']['input'];
  authorId: Scalars['Int']['input'];
}>;


export type CreatePostMutation = { __typename?: 'Mutation', insertIntoPostsSingle?: { __typename?: 'PostsItem', id: number, content: string, authorId: number } | null };

export type DeletePostMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeletePostMutation = { __typename?: 'Mutation', deleteFromPosts: Array<{ __typename?: 'PostsItem', id: number, content: string, authorId: number }> };

export type UserItemFragment = { __typename?: 'UsersSelectItem', id: number, name: string } & { ' $fragmentName'?: 'UserItemFragment' };

export type SelectRuleTypeItemFragment = { __typename?: 'RuleTypesSelectItem', ruleTypeId: number, name?: string | null } & { ' $fragmentName'?: 'SelectRuleTypeItemFragment' };

export type RuleInstancesItemQueryVariables = Exact<{ [key: string]: never; }>;


export type RuleInstancesItemQuery = { __typename?: 'Query', ruleInstances: Array<{ __typename?: 'RuleInstancesSelectItem', ruleId: number, name?: string | null }> };

export type CreateRuleMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description: Scalars['String']['input'];
}>;


export type CreateRuleMutation = { __typename?: 'Mutation', insertIntoRuleInstancesSingle?: { __typename?: 'RuleInstancesItem', ruleId: number, name?: string | null, description: string } | null };

export type RuleItemFragment = { __typename?: 'RuleInstancesSelectItem', ruleId: number, name?: string | null, description: string } & { ' $fragmentName'?: 'RuleItemFragment' };

export type RuleTypeGeneralItemFragment = { __typename?: 'RuleTypesSelectItem', ruleTypeId: number, name?: string | null, description: string } & { ' $fragmentName'?: 'RuleTypeGeneralItemFragment' };

export type RulesTypeQueryVariables = Exact<{ [key: string]: never; }>;


export type RulesTypeQuery = { __typename?: 'Query', ruleTypes: Array<(
    { __typename?: 'RuleTypesSelectItem', ruleTypeId: number, schemaIn: string, schemaOut: string }
    & { ' $fragmentRefs'?: { 'RuleTypeItemFragment': RuleTypeItemFragment;'RuleTypeGeneralItemFragment': RuleTypeGeneralItemFragment } }
  )> };

export type RuleTypeItemFragment = { __typename?: 'RuleTypesSelectItem', ruleTypeId: number, name?: string | null, schemaIn: string, schemaOut: string } & { ' $fragmentName'?: 'RuleTypeItemFragment' };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const AuthorUserItemFragmentDoc = new TypedDocumentString(`
    fragment AuthorUserItem on UsersSelectItem {
  id
  name
}
    `, {"fragmentName":"AuthorUserItem"}) as unknown as TypedDocumentString<AuthorUserItemFragment, unknown>;
export const PostItemFragmentDoc = new TypedDocumentString(`
    fragment PostItem on PostsSelectItem {
  id
  content
  authorId
  author {
    name
  }
}
    `, {"fragmentName":"PostItem"}) as unknown as TypedDocumentString<PostItemFragment, unknown>;
export const SelectedUserItemFragmentDoc = new TypedDocumentString(`
    fragment SelectedUserItem on UsersSelectItem {
  id
  name
}
    `, {"fragmentName":"SelectedUserItem"}) as unknown as TypedDocumentString<SelectedUserItemFragment, unknown>;
export const UserItemFragmentDoc = new TypedDocumentString(`
    fragment UserItem on UsersSelectItem {
  id
  name
}
    `, {"fragmentName":"UserItem"}) as unknown as TypedDocumentString<UserItemFragment, unknown>;
export const SelectRuleTypeItemFragmentDoc = new TypedDocumentString(`
    fragment SelectRuleTypeItem on RuleTypesSelectItem {
  ruleTypeId
  name
}
    `, {"fragmentName":"SelectRuleTypeItem"}) as unknown as TypedDocumentString<SelectRuleTypeItemFragment, unknown>;
export const RuleItemFragmentDoc = new TypedDocumentString(`
    fragment RuleItem on RuleInstancesSelectItem {
  ruleId
  name
  description
}
    `, {"fragmentName":"RuleItem"}) as unknown as TypedDocumentString<RuleItemFragment, unknown>;
export const RuleTypeGeneralItemFragmentDoc = new TypedDocumentString(`
    fragment RuleTypeGeneralItem on RuleTypesSelectItem {
  ruleTypeId
  name
  description
}
    `, {"fragmentName":"RuleTypeGeneralItem"}) as unknown as TypedDocumentString<RuleTypeGeneralItemFragment, unknown>;
export const RuleTypeItemFragmentDoc = new TypedDocumentString(`
    fragment RuleTypeItem on RuleTypesSelectItem {
  ruleTypeId
  name
  schemaIn
  schemaOut
}
    `, {"fragmentName":"RuleTypeItem"}) as unknown as TypedDocumentString<RuleTypeItemFragment, unknown>;
export const GetUsersDocument = new TypedDocumentString(`
    query GetUsers {
  users(orderBy: {name: {direction: asc, priority: 1}}) {
    id
    ...UserItem
    ...SelectedUserItem
    ...AuthorUserItem
  }
}
    fragment AuthorUserItem on UsersSelectItem {
  id
  name
}
fragment SelectedUserItem on UsersSelectItem {
  id
  name
}
fragment UserItem on UsersSelectItem {
  id
  name
}`) as unknown as TypedDocumentString<GetUsersQuery, GetUsersQueryVariables>;
export const GetPostsDocument = new TypedDocumentString(`
    query GetPosts($where: PostsFilters) {
  posts(where: $where, orderBy: {id: {direction: desc, priority: 1}}) {
    id
    authorId
    ...PostItem
  }
}
    fragment PostItem on PostsSelectItem {
  id
  content
  authorId
  author {
    name
  }
}`) as unknown as TypedDocumentString<GetPostsQuery, GetPostsQueryVariables>;
export const CreateUserDocument = new TypedDocumentString(`
    mutation CreateUser($name: String!) {
  insertIntoUsersSingle(values: {name: $name}) {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<CreateUserMutation, CreateUserMutationVariables>;
export const CreatePostDocument = new TypedDocumentString(`
    mutation CreatePost($content: String!, $authorId: Int!) {
  insertIntoPostsSingle(values: {content: $content, authorId: $authorId}) {
    id
    content
    authorId
  }
}
    `) as unknown as TypedDocumentString<CreatePostMutation, CreatePostMutationVariables>;
export const DeletePostDocument = new TypedDocumentString(`
    mutation DeletePost($id: Int!) {
  deleteFromPosts(where: {id: {eq: $id}}) {
    id
    content
    authorId
  }
}
    `) as unknown as TypedDocumentString<DeletePostMutation, DeletePostMutationVariables>;
export const RuleInstancesItemDocument = new TypedDocumentString(`
    query RuleInstancesItem {
  ruleInstances(orderBy: {ruleId: {direction: asc, priority: 1}}) {
    ruleId
    name
  }
}
    `) as unknown as TypedDocumentString<RuleInstancesItemQuery, RuleInstancesItemQueryVariables>;
export const CreateRuleDocument = new TypedDocumentString(`
    mutation CreateRule($name: String!, $description: String!) {
  insertIntoRuleInstancesSingle(values: {name: $name, description: $description}) {
    ruleId
    name
    description
  }
}
    `) as unknown as TypedDocumentString<CreateRuleMutation, CreateRuleMutationVariables>;
export const RulesTypeDocument = new TypedDocumentString(`
    query RulesType {
  ruleTypes(orderBy: {ruleTypeId: {direction: asc, priority: 1}}) {
    ruleTypeId
    schemaIn
    schemaOut
    ...RuleTypeItem
    ...RuleTypeGeneralItem
  }
}
    fragment RuleTypeGeneralItem on RuleTypesSelectItem {
  ruleTypeId
  name
  description
}
fragment RuleTypeItem on RuleTypesSelectItem {
  ruleTypeId
  name
  schemaIn
  schemaOut
}`) as unknown as TypedDocumentString<RulesTypeQuery, RulesTypeQueryVariables>;