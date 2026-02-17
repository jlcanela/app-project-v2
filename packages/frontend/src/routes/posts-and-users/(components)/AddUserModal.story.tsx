import { AddUserModal, type AddUserModalProps } from './AddUserModal'

export default {
  title: 'PostsAndUsers/AddUserModal',
  tags: ['autodocs'],
}

const baseProps: AddUserModalProps = {
  opened: true,
  onClose: () => {},
  onCreateUser: () => {},
}

export const Default = () => <AddUserModal {...baseProps} />

export const Closed = () => <AddUserModal {...baseProps} opened={false} />
