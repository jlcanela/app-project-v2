import { render, screen, userEvent } from '@test-utils'
import { PostsMain, PostsMainProps } from './PostsMain'
import { PostItemFragment, SelectedUserItemFragment } from '@/graphql/graphql'
import { Result } from '@effect-atom/atom-react'
import { Option } from 'effect'

const defaultPosts = Result.success<PostItemFragment[], string>([
  { id: 1, content: 'Hello world!', authorId: 1, author: { name: 'Alice' } },
  { id: 2, content: 'Effect is great', authorId: 2, author: { name: 'Bob' } },
])

const defaultUser = Result.success<Option.Option<SelectedUserItemFragment>>(Option.some({id: 1, name:"Alice"}))
const noUser = Result.success(Option.none())

const baseProps: PostsMainProps = {
  onCreatePost: vi.fn(),
  onDeletePost: vi.fn(),
  selectedPosts: defaultPosts,
  selectedUser: Result.success(Option.none()),
}

describe('PostsMain', () => {
  it('renders All Posts title when no user selected', () => {
    render(<PostsMain {...baseProps} />)
    expect(screen.getByText('All Posts')).toBeInTheDocument()
  })

  it('renders user-specific title when user is selected', () => {
    render(<PostsMain {...baseProps} selectedUser={defaultUser} />)
    expect(screen.getByText('Posts by Alice')).toBeInTheDocument()
  })

  it('renders post content', () => {
    render(<PostsMain {...baseProps} />)
    expect(screen.getByText('Hello world!')).toBeInTheDocument()
    expect(screen.getByText('Effect is great')).toBeInTheDocument()
  })

  it('renders author names', () => {
    render(<PostsMain {...baseProps} />)
    expect(screen.getAllByText('Alice')).toHaveLength(1)
    expect(screen.getAllByText('Bob')).toHaveLength(1)
  })

  it('calls onCreatePost when Create Post button is clicked', async () => {
    const onCreatePost = vi.fn()
    render(<PostsMain {...baseProps} onCreatePost={onCreatePost} />)
    await userEvent.click(screen.getByText('Create Post'))
    expect(onCreatePost).toHaveBeenCalled()
  })

  it('calls onDeletePost when Delete button is clicked', async () => {
    const onDeletePost = vi.fn()
    render(<PostsMain {...baseProps} onDeletePost={onDeletePost} />)
    const deleteButtons = screen.getAllByText('Delete')
    await userEvent.click(deleteButtons[0])
    expect(onDeletePost).toHaveBeenCalledWith(1)
  })

  it('shows loading state', () => {
    render(<PostsMain {...baseProps} selectedPosts={Result.initial(true)} selectedUser={noUser} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<PostsMain {...baseProps} selectedPosts={Result.fail("Network error")} />)
    expect(screen.getByText('Error loading posts.')).toBeInTheDocument()
  })

  it('shows empty state when no posts', () => {
    render(<PostsMain {...baseProps} selectedPosts={Result.success([])} />)
    expect(screen.getByText('No posts found.')).toBeInTheDocument()
  })
})
