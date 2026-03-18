/* eslint-disable no-alert */
import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from './StatusBar';

/** Wrapper to render StatusBar at full width */
function StatusBarStory(props: React.ComponentProps<typeof StatusBar>) {
  return (
    <div style={{ width: '100%', height: 40, border: '1px solid #eee', background: '#fafafa' }}>
      <StatusBar {...props} />
    </div>
  );
}

const meta: Meta<typeof StatusBarStory> = {
  title: 'GraphEditor/Palette/StatusBar',
  component: StatusBarStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBarStory>;

/** Idle state — empty pipeline, download and upload ready (Stories 7.1, 7.4) */
export const Idle: Story = {
  args: {
    onDownload: () => alert('Download JSON clicked'),
    onUpload: (p) => alert(`Uploaded pipeline: ${p.id}`),
  },
};

/** Download ready — pipeline with steps configured (Story 7.1) */
export const DownloadReady: Story = {
  args: {
    onDownload: () => alert('Download JSON clicked'),
    onUpload: (p) => alert(`Uploaded pipeline: ${p.id}`),
  },
};

/** Upload ready — demonstrates upload button alongside download (Story 7.4) */
export const UploadReady: Story = {
  args: {
    onDownload: () => alert('Download JSON clicked'),
    onUpload: (p) => alert(`Uploaded pipeline: ${p.name} (${p.steps.length} steps)`),
  },
};
