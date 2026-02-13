# UI Design for Posts and Users

## Overview
This document outlines the user interface design for the `/posts_and_users` route. The goal is to provide a dashboard to view, create, and manage `Users` and `Posts` using the provided GraphQL schema.

## Layout Strategy
The interface will use a **Master-Detail** or **Split-View** layout:
1.  **Users List (Sidebar/Left)**: Navigation and selection of users.
2.  **Posts Feed (Main/Right)**: Display of posts, filtered by the selected user or showing all posts.

## Components

### 1. Users Panel
**Purpose**: List all users and allow adding new ones.

*   **Display**: List of User names.
*   **Actions**:
    *   **Select**: Clicking a user filters the Posts Feed.
    *   **Add User**: Button to open a modal with a form for `UsersInsertInput`.
*   **Data Source**:
    ```graphql
    query GetUsers {
      users(orderBy: { name: { direction: asc, priority: 1 } }) {
        id
        name
      }
    }
    ```

### 2. Posts Feed
**Purpose**: Display content streams.

*   **Display**: Cards containing:
    *   Post Content (`content`)
    *   Author Name (`author.name`)
*   **Actions**:
    *   **Create Post**: Button to add a post. If a user is selected in the left panel, the `authorId` is pre-filled.
    *   **Delete**: Icon to remove a post.
*   **Data Source**:
    ```graphql
    query GetPosts($where: PostsFilters) {
      posts(
        where: $where,
        orderBy: { id: { direction: desc, priority: 1 } }
      ) {
        id
        content
        authorId
        author {
          name
        }
      }
    }
    ```

## Interactions & State

### Filtering
*   **Default State**: `where` is undefined. All posts are shown.
*   **User Selected**: When a user (e.g., ID `5`) is clicked in the Users Panel, the Posts query updates:
    ```json
    { "where": { "authorId": { "eq": 5 } } }
    ```

### Mutations

#### Create User
Form Input: `Name` (String)
```graphql
mutation AddUser($name: String!) {
  insertIntoUsersSingle(values: { name: $name }) {
    id
    name
  }
}
```

#### Create Post
Form Input: `Content` (String), `Author` (Dropdown or pre-selected ID)
```graphql
mutation AddPost($content: String!, $authorId: Int!) {
  insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {
    id
    content
    author {
      name
    }
  }
}
```