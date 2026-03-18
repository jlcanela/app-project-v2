// Pipeline JSON export/import utility — Stories 7.1, 7.4
// Uses Schema.encodeSync / decodeSync to convert between PipelineConfig instances and plain JSON.
import { PipelineConfig } from '@app/domain';
import { Schema } from 'effect';

/**
 * Encodes a PipelineConfig instance to a plain JSON-serializable object
 * using Effect Schema.encodeSync — the ONLY export path per architecture.
 */
export function encodePipeline(pipeline: PipelineConfig): unknown {
  return Schema.encodeSync(PipelineConfig)(pipeline);
}

/**
 * Decodes a plain JSON object into a PipelineConfig class instance
 * using Effect Schema.decodeSync. Throws on invalid input.
 */
export function decodePipeline(json: unknown): PipelineConfig {
  return Schema.decodeSync(PipelineConfig)(json as any);
}

/**
 * Triggers a browser file download of the pipeline as a JSON file.
 * File name is derived from the pipeline id.
 */
export function downloadPipelineJson(pipeline: PipelineConfig): void {
  const encoded = encodePipeline(pipeline);
  const json = JSON.stringify(encoded, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pipeline.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
