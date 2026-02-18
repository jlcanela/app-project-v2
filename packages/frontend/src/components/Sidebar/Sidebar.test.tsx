import { Result } from '@effect-atom/atom-react';
import { render, screen, userEvent } from '@test-utils';
import { UserItemFragment } from '@/graphql/graphql';
import { Sidebar } from './Sidebar';

const defaultUsers = Result.success([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]);

const selectedUserId = 1;
const setSelectedId = () => {};
const openUserModal = () => {};
const users = defaultUsers;

const baseProps = {
  title: 'Users',
  allLabel: 'All Users',
  selectedId: selectedUserId,
  onSelect: setSelectedId,
  onAdd: openUserModal,
  items: users,
  getKey: (u: UserItemFragment) => u.id,
  getLabel: (u: UserItemFragment) => u.name,
};

describe('UsersSidebar', () => {
  it('renders the Users title', () => {
    render(<Sidebar {...baseProps} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders All Users nav link', () => {
    render(<Sidebar {...baseProps} />);
    expect(screen.getByText('All Users')).toBeInTheDocument();
  });

  it('renders user names', () => {
    render(<Sidebar {...baseProps} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('calls setSelectedUserId when a user is clicked', async () => {
    const setSelectedUserId = vi.fn();
    render(<Sidebar {...baseProps} onSelect={setSelectedUserId} />);
    await userEvent.click(screen.getByText('Alice'));
    expect(setSelectedUserId).toHaveBeenCalledWith(1);
  });

  it('calls setSelectedUserId with null when All Users is clicked', async () => {
    const setSelectedUserId = vi.fn();
    render(<Sidebar {...baseProps} selectedId={1} onSelect={setSelectedUserId} />);
    await userEvent.click(screen.getByText('All Users'));
    expect(setSelectedUserId).toHaveBeenCalledWith(null);
  });

  it('calls onAddUser when + Add button is clicked', async () => {
    const onAddUser = vi.fn();
    render(<Sidebar {...baseProps} onAdd={onAddUser} />);
    await userEvent.click(screen.getByText('+ Add'));
    expect(onAddUser).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Sidebar {...baseProps} items={Result.initial(true)} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Sidebar {...baseProps} items={Result.fail('Network error')} />);
    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  it('renders empty list when no users', () => {
    render(<Sidebar {...baseProps} items={Result.success([])} />);
    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });
});
