import { AddPostModal, type AddPostModalProps } from './AddPostModal'

export default {
  title: 'PostsAndUsers/AddPostModal',
  tags: ['autodocs'],
}

const defaultUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
]

const baseProps: AddPostModalProps = {
  opened: true,
  onClose: () => {},
  defaultAuthorId: null,
  users: defaultUsers,
  onCreatePost: () => {},
}

export const Default = () => <AddPostModal {...baseProps} />

export const WithDefaultAuthor = () => (
  <AddPostModal {...baseProps} defaultAuthorId={2} />
)

export const NoUsers = () => <AddPostModal {...baseProps} users={[]} />

export const Closed = () => <AddPostModal {...baseProps} opened={false} />
