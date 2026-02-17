import { Result } from '@effect-atom/atom-react'
import { UsersSidebar, UsersSidebarProps } from './UsersSidebar'

export default {
  title: 'PostsAndUsers/UsersSidebar',
  tags: ['autodocs'],
}

const defaultUsers = Result.success([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
])

const baseProps: UsersSidebarProps = {
  selectedUserId: null,
  setSelectedUserId: () => {},
  onAddUser: () => {},
  users: defaultUsers,
}

export const Default = () => <UsersSidebar {...baseProps} />

export const WithSelectedUser = () => (
  <UsersSidebar {...baseProps} selectedUserId={2} />
)

export const Loading = () => (
  <UsersSidebar {...baseProps} users={Result.initial(true)} />
)

export const WithError = () => (
  <UsersSidebar {...baseProps} users={Result.fail("Failed to load users")} />
)

export const Empty = () => <UsersSidebar {...baseProps} users={Result.success([])} />
