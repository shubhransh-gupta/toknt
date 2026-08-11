import { createHash } from 'node:crypto';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  hash: string;
  previousHash?: string;
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

export class DuplicateTracker {
  private fileHashes = new Map<string, string>();
  private toolHashes = new Map<string, string>();

  checkFile(path: string, content: string): DuplicateCheckResult {
    const hash = hashContent(content);
    const previousHash = this.fileHashes.get(path);
    const isDuplicate = previousHash !== undefined && previousHash === hash;

    if (!isDuplicate) {
      this.fileHashes.set(path, hash);
    }

    return { isDuplicate, hash, previousHash };
  }

  checkToolOutput(toolKey: string, content: string): DuplicateCheckResult {
    const hash = hashContent(content);
    const previousHash = this.toolHashes.get(toolKey);
    const isDuplicate = previousHash !== undefined && previousHash === hash;

    if (!isDuplicate) {
      this.toolHashes.set(toolKey, hash);
    }

    return { isDuplicate, hash, previousHash };
  }

  invalidateFile(path: string): void {
    this.fileHashes.delete(path);
  }

  clear(): void {
    this.fileHashes.clear();
    this.toolHashes.clear();
  }

  getStats(): { trackedFiles: number; trackedTools: number } {
    return {
      trackedFiles: this.fileHashes.size,
      trackedTools: this.toolHashes.size,
    };
  }
}

export function formatDuplicateFileMessage(path: string, hash: string, recallUri: string): string {
  return `[UNCHANGED FILE]

${path} was already loaded.

Content hash:
${hash}

Full content is available for recall.
Reference: ${recallUri}`;
}

export function formatDuplicateToolMessage(hash: string, recallUri: string): string {
  return `[UNCHANGED TOOL OUTPUT]

Previously returned:
output:${hash}

No changes detected.
Reference: ${recallUri}`;
}
