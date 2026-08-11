import { watch, type FSWatcher } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { TokntEngine } from './engine.js';

export interface FileWatcherOptions {
  engine: TokntEngine;
  paths: string[];
  recursive?: boolean;
  onInvalidate?: (path: string) => void;
}

/**
 * Watches filesystem paths and clears duplicate-tracking for changed files
 * so the next agent read is not incorrectly deduplicated.
 */
export class FileWatcher {
  private watchers: FSWatcher[] = [];
  private readonly engine: TokntEngine;
  private readonly paths: string[];
  private readonly recursive: boolean;
  private readonly onInvalidate?: (path: string) => void;
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(options: FileWatcherOptions) {
    this.engine = options.engine;
    this.paths = options.paths;
    this.recursive = options.recursive ?? true;
    this.onInvalidate = options.onInvalidate;
  }

  start(): void {
    for (const watchPath of this.paths) {
      const resolved = resolve(watchPath);
      const watcher = watch(resolved, { recursive: this.recursive }, (_event, filename) => {
        if (!filename) return;
        const fullPath = join(resolved, filename.toString());
        this.scheduleInvalidate(fullPath);
      });
      this.watchers.push(watcher);
    }
  }

  stop(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    for (const w of this.watchers) {
      w.close();
    }
    this.watchers = [];
  }

  private scheduleInvalidate(fullPath: string): void {
    const existing = this.debounceTimers.get(fullPath);
    if (existing) clearTimeout(existing);

    this.debounceTimers.set(
      fullPath,
      setTimeout(() => {
        this.debounceTimers.delete(fullPath);
        void this.handleChange(fullPath);
      }, 100)
    );
  }

  private async handleChange(fullPath: string): Promise<void> {
    try {
      await readFile(fullPath, 'utf-8');
    } catch {
      // file deleted or unreadable — still invalidate tracking
    }
    this.engine.invalidateFile(fullPath);
    this.onInvalidate?.(fullPath);
  }
}
