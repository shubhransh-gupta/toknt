export type SafetyLevel =
  | 'CRITICAL'
  | 'IMPORTANT'
  | 'NORMAL'
  | 'STALE'
  | 'DUPLICATE'
  | 'RECOVERABLE';

export type OptimizationMode = 'safe' | 'balanced' | 'aggressive';

export type ContextItemType =
  | 'user_request'
  | 'task_instruction'
  | 'git_diff'
  | 'compiler_error'
  | 'test_failure'
  | 'patch_anchor'
  | 'edited_file'
  | 'tool_argument'
  | 'structured_data'
  | 'file_read'
  | 'file_write'
  | 'terminal_output'
  | 'directory_listing'
  | 'tool_output'
  | 'documentation'
  | 'log'
  | 'unknown';

export interface ContextItem {
  id: string;
  type: ContextItemType;
  content: string;
  metadata?: Record<string, unknown>;
  path?: string;
  toolName?: string;
}

export interface ClassificationResult {
  level: SafetyLevel;
  compressible: boolean;
  reason: string;
}

const NEVER_COMPRESS_TYPES: Set<ContextItemType> = new Set([
  'user_request',
  'task_instruction',
  'git_diff',
  'compiler_error',
  'test_failure',
  'patch_anchor',
  'edited_file',
  'tool_argument',
  'structured_data',
]);

export function classifyContextItem(
  item: ContextItem,
  mode: OptimizationMode = 'safe'
): ClassificationResult {
  if (NEVER_COMPRESS_TYPES.has(item.type)) {
    return {
      level: 'CRITICAL',
      compressible: false,
      reason: 'Critical context — never compress',
    };
  }

  if (item.type === 'file_read' && item.metadata?.isDuplicate) {
    return {
      level: 'DUPLICATE',
      compressible: true,
      reason: 'Duplicate file read detected',
    };
  }

  if (item.type === 'tool_output' && item.metadata?.isDuplicate) {
    return {
      level: 'DUPLICATE',
      compressible: true,
      reason: 'Duplicate tool output detected',
    };
  }

  if (item.type === 'terminal_output') {
    const lines = item.content.split('\n').length;
    if (lines > 100 && (mode === 'balanced' || mode === 'aggressive')) {
      return {
        level: 'RECOVERABLE',
        compressible: true,
        reason: `Large terminal output (${lines} lines)`,
      };
    }
    if (lines > 50 && mode === 'aggressive') {
      return {
        level: 'RECOVERABLE',
        compressible: true,
        reason: `Terminal output (${lines} lines) — aggressive mode`,
      };
    }
  }

  if (item.type === 'directory_listing') {
    const lines = item.content.split('\n').length;
    if (lines > 50 && (mode === 'balanced' || mode === 'aggressive')) {
      return {
        level: 'RECOVERABLE',
        compressible: true,
        reason: `Large directory listing (${lines} entries)`,
      };
    }
  }

  if (item.type === 'documentation' || item.type === 'log') {
    if (mode === 'aggressive') {
      return {
        level: 'STALE',
        compressible: true,
        reason: 'Stale context — aggressive mode',
      };
    }
  }

  return {
    level: 'NORMAL',
    compressible: false,
    reason: 'Default — pass through',
  };
}

export function shouldCompress(
  classification: ClassificationResult,
  mode: OptimizationMode
): boolean {
  if (!classification.compressible) return false;
  if (classification.level === 'CRITICAL') return false;

  if (mode === 'safe') {
    return classification.level === 'DUPLICATE';
  }

  if (mode === 'balanced') {
    return ['DUPLICATE', 'RECOVERABLE'].includes(classification.level);
  }

  // aggressive
  return ['DUPLICATE', 'RECOVERABLE', 'STALE'].includes(classification.level);
}
