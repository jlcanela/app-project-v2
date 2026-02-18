import { Result } from '@effect-atom/atom-react';
import { UserItemFragment } from '@/graphql/graphql';
import { Sidebar } from './Sidebar';

export default {
  title: 'Components/Sidebar',
  tags: ['autodocs'],
};

const defaultUsers = Result.success([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
]);

const setSelectedUserId = () => {};
const openUserModal = () => {};
const users = defaultUsers;

const baseProps = {
  title: 'Users',
  allLabel: 'All Users',
  selectedId: null,
  onSelect: setSelectedUserId,
  onAdd: openUserModal,
  items: users,
  getKey: (u: UserItemFragment) => u.id,
  getLabel: (u: UserItemFragment) => u.name,
};

export const Default = () => <Sidebar {...baseProps} />;

export const WithSelectedUser = () => <Sidebar {...baseProps} selectedId={2} />;

export const Loading = () => <Sidebar {...baseProps} items={Result.initial(true)} />;

export const WithError = () => (
  <Sidebar {...baseProps} items={Result.fail('Failed to load users')} />
);

export const Empty = () => <Sidebar {...baseProps} items={Result.success([])} />;
