import { EventBusTriggerConfig, HttpTriggerConfig, type TriggerConfig } from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { TriggerForm } from './TriggerForm';

/** Wrapper to render TriggerForm at config panel width */
function TriggerFormStory({
  trigger,
  onUpdate,
  onTypeChange,
}: {
  trigger: TriggerConfig;
  onUpdate?: (patch: Partial<TriggerConfig>) => void;
  onTypeChange?: (type: 'http' | 'event_bus') => void;
}) {
  return (
    <div style={{ width: 340, padding: 16, border: '1px solid #eee' }}>
      <TriggerForm trigger={trigger} onUpdate={onUpdate} onTypeChange={onTypeChange} />
    </div>
  );
}

const meta: Meta<typeof TriggerFormStory> = {
  title: 'GraphEditor/Config/TriggerForm',
  component: TriggerFormStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TriggerFormStory>;

/** HTTP Trigger with POST method and webhook path */
export const HttpPost: Story = {
  args: {
    trigger: new HttpTriggerConfig({
      type: 'http',
      method: 'POST',
      path: '/api/webhook',
    }),
  },
};

/** HTTP Trigger with GET method and api path */
export const HttpGet: Story = {
  args: {
    trigger: new HttpTriggerConfig({
      type: 'http',
      method: 'GET',
      path: '/api/orders',
    }),
  },
};

/** HTTP Trigger with all optional fields populated */
export const HttpWithSchemaRef: Story = {
  args: {
    trigger: new HttpTriggerConfig({
      type: 'http',
      method: 'PUT',
      path: '/api/customers',
      payloadSchemaRef: 'CustomerPayload',
    }),
  },
};

/** Event Bus Trigger — basic channel only */
export const EventBusBasic: Story = {
  args: {
    trigger: new EventBusTriggerConfig({
      type: 'event_bus',
      channel: 'order-events',
    }),
  },
};

/** Event Bus Trigger — all optional fields populated */
export const EventBusFullyPopulated: Story = {
  args: {
    trigger: new EventBusTriggerConfig({
      type: 'event_bus',
      channel: 'order-events',
      payloadSchemaRef: 'OrderPayload',
      filterExpression: 'event.type == "created"',
    }),
  },
};

/** Event Bus Trigger — empty optional fields */
export const EventBusEmptyOptionals: Story = {
  args: {
    trigger: new EventBusTriggerConfig({
      type: 'event_bus',
      channel: '',
    }),
  },
};

/** HTTP Trigger with type switcher visible (Story 3.4) */
export const HttpWithTypeSwitcher: Story = {
  args: {
    trigger: new HttpTriggerConfig({
      type: 'http',
      method: 'POST',
      path: '/api/webhook',
    }),
    onTypeChange: () => {},
  },
};

/** Event Bus Trigger with type switcher visible (Story 3.4) */
export const EventBusWithTypeSwitcher: Story = {
  args: {
    trigger: new EventBusTriggerConfig({
      type: 'event_bus',
      channel: 'order-events',
    }),
    onTypeChange: () => {},
  },
};
