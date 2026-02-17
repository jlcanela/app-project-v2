import { render, screen, userEvent } from '@test-utils'
import { UsersSidebar, type UsersSidebarProps } from './UsersSidebar'
import { Result } from '@effect-atom/atom-react'

const defaultUsers = Result.success([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

const baseProps: UsersSidebarProps = {
  selectedUserId: null,
  setSelectedUserId: vi.fn(),
  onAddUser: vi.fn(),
  users: defaultUsers,
}

describe('UsersSidebar', () => {
  it('renders the Users title', () => {
    render(<UsersSidebar {...baseProps} />)
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders All Users nav link', () => {
    render(<UsersSidebar {...baseProps} />)
    expect(screen.getByText('All Users')).toBeInTheDocument()
  })

  it('renders user names', () => {
    render(<UsersSidebar {...baseProps} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('calls setSelectedUserId when a user is clicked', async () => {
    const setSelectedUserId = vi.fn()
    render(<UsersSidebar {...baseProps} setSelectedUserId={setSelectedUserId} />)
    await userEvent.click(screen.getByText('Alice'))
    expect(setSelectedUserId).toHaveBeenCalledWith(1)
  })

  it('calls setSelectedUserId with null when All Users is clicked', async () => {
    const setSelectedUserId = vi.fn()
    render(<UsersSidebar {...baseProps} selectedUserId={1} setSelectedUserId={setSelectedUserId} />)
    await userEvent.click(screen.getByText('All Users'))
    expect(setSelectedUserId).toHaveBeenCalledWith(null)
  })

  it('calls onAddUser when + Add button is clicked', async () => {
    const onAddUser = vi.fn()
    render(<UsersSidebar {...baseProps} onAddUser={onAddUser} />)
    await userEvent.click(screen.getByText('+ Add'))
    expect(onAddUser).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(<UsersSidebar {...baseProps} users={Result.initial(true)} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<UsersSidebar {...baseProps} users={Result.fail("Network error")} />)
    expect(screen.getByText('Error: Network error')).toBeInTheDocument()
  })

  it('renders empty list when no users', () => {
    render(<UsersSidebar {...baseProps} users={Result.success([])} />)
    expect(screen.getByText('All Users')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })
})
