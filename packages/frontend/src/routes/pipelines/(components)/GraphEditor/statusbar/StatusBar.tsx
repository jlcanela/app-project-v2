// StatusBar — Stories 7.1, 7.4 (JSON Download & Upload)
// Bottom bar with pipeline actions: download JSON, upload JSON, deploy (future stories).
import { useCallback, useRef } from 'react';
import type { PipelineConfig } from '@app/domain';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { decodePipeline } from '../export';

export interface StatusBarProps {
  onDownload: () => void;
  onUpload: (pipeline: PipelineConfig) => void;
}

/** Bottom status bar with pipeline export actions. */
export function StatusBar({ onDownload, onUpload }: StatusBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = useCallback(() => {
    onDownload();
  }, [onDownload]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Reset input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          if (!text || text.trim().length === 0) {
            throw new Error('File is empty');
          }
          const json = JSON.parse(text);
          const decoded = decodePipeline(json);
          onUpload(decoded);
        } catch (err) {
          notifications.show({
            title: 'Import failed',
            message: err instanceof Error ? err.message : 'Invalid pipeline JSON file',
            color: 'red',
            autoClose: 5000,
          });
        }
      };
      reader.readAsText(file);
    },
    [onUpload]
  );

  return (
    <Group h="100%" px="md" justify="flex-end" data-testid="status-bar">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="upload-json-input"
      />
      <Button
        variant="light"
        size="xs"
        leftSection={<IconUpload size={14} />}
        onClick={handleUploadClick}
        data-testid="upload-json-button"
      >
        Upload JSON
      </Button>
      <Button
        variant="light"
        size="xs"
        leftSection={<IconDownload size={14} />}
        onClick={handleDownload}
        data-testid="download-json-button"
      >
        Download JSON
      </Button>
    </Group>
  );
}
