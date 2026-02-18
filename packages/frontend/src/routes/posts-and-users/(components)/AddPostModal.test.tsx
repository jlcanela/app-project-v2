import { render, screen, userEvent } from '@test-utils';
import { AddPostModal, type AddPostModalProps } from './AddPostModal';

const defaultUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const baseProps: AddPostModalProps = {
  opened: true,
  onClose: vi.fn(),
  defaultAuthorId: null,
  users: defaultUsers,
  onCreatePost: vi.fn(),
};

describe('AddPostModal', () => {
  it('renders the modal title', () => {
    render(<AddPostModal {...baseProps} />);
    expect(screen.getByText('Create Post')).toBeInTheDocument();
  });

  it('renders author select with users', () => {
    render(<AddPostModal {...baseProps} />);
    const authorSelect = screen.getByPlaceholderText('Select author');
    expect(authorSelect).toBeInTheDocument();
  });

  it('renders content input', () => {
    render(<AddPostModal {...baseProps} />);
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });

  it('renders Cancel and Post buttons', () => {
    render(<AddPostModal {...baseProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<AddPostModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onCreatePost when content is empty', async () => {
    const onCreatePost = vi.fn();
    render(<AddPostModal {...baseProps} onCreatePost={onCreatePost} />);
    await userEvent.click(screen.getByText('Post'));
    expect(onCreatePost).not.toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(<AddPostModal {...baseProps} opened={false} />);
    expect(screen.queryByText('Create Post')).not.toBeInTheDocument();
  });
});
