import { render, screen, userEvent } from '@test-utils';
import { AddRuleModal, type AddRuleModalProps } from './AddRuleModal';

const defaultRuleTypes = [
  { ruleTypeId: 1, name: 'Rule1', schemaIn: '[]', schemaOut: '[]' },
  { ruleTypeId: 2, name: 'Rule2', schemaIn: '[]', schemaOut: '[]' },
];

const baseProps: AddRuleModalProps = {
  opened: true,
  onClose: vi.fn(),
  onCreateRule: vi.fn(),
  ruleTypes: defaultRuleTypes,
};

describe('AddRuleModal', () => {
  it('renders the modal title', () => {
    render(<AddRuleModal {...baseProps} />);
    expect(screen.getByText('Add Rule')).toBeInTheDocument();
  });

  it('renders name input', () => {
    render(<AddRuleModal {...baseProps} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders Cancel and Save buttons', () => {
    render(<AddRuleModal {...baseProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<AddRuleModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onCreateRule when name is empty', async () => {
    const onCreateRule = vi.fn();
    render(<AddRuleModal {...baseProps} onCreateRule={onCreateRule} />);
    await userEvent.click(screen.getByText('Save'));
    expect(onCreateRule).not.toHaveBeenCalled();
  });

  it('calls onCreateRule with the name and closes modal', async () => {
    const onCreateRule = vi.fn();
    const onClose = vi.fn();
    render(<AddRuleModal {...baseProps} onCreateRule={onCreateRule} onClose={onClose} />);
    await userEvent.type(screen.getByLabelText('Name'), 'New Rule');
    await userEvent.click(screen.getByText('Save'));
    expect(onCreateRule).toHaveBeenCalledWith({
      name: 'New Rule',
      description: '',
      content: '{ nodes: [], edges: []}',
    });
    // TODO add test about onClose being closed in index.ts
  });

  it('does not render when closed', () => {
    render(<AddRuleModal {...baseProps} opened={false} />);
    expect(screen.queryByText('Add Rule')).not.toBeInTheDocument();
  });
});
