import { render, screen, userEvent } from '@test-utils'
import { AddUserModal, type AddUserModalProps } from './AddUserModal'

const baseProps: AddUserModalProps = {
  opened: true,
  onClose: vi.fn(),
  onCreateUser: vi.fn(),
}

describe('AddUserModal', () => {
  it('renders the modal title', () => {
    render(<AddUserModal {...baseProps} />)
    expect(screen.getByText('Add User')).toBeInTheDocument()
  })

  it('renders name input', () => {
    render(<AddUserModal {...baseProps} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('renders Cancel and Save buttons', () => {
    render(<AddUserModal {...baseProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<AddUserModal {...baseProps} onClose={onClose} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onCreateUser when name is empty', async () => {
    const onCreateUser = vi.fn()
    render(<AddUserModal {...baseProps} onCreateUser={onCreateUser} />)
    await userEvent.click(screen.getByText('Save'))
    expect(onCreateUser).not.toHaveBeenCalled()
  })

  it('calls onCreateUser with the name and closes modal', async () => {
    const onCreateUser = vi.fn()
    const onClose = vi.fn()
    render(<AddUserModal {...baseProps} onCreateUser={onCreateUser} onClose={onClose} />)
    await userEvent.type(screen.getByLabelText('Name'), 'New User')
    await userEvent.click(screen.getByText('Save'))
    expect(onCreateUser).toHaveBeenCalledWith('New User')
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    render(<AddUserModal {...baseProps} opened={false} />)
    expect(screen.queryByText('Add User')).not.toBeInTheDocument()
  })
})
