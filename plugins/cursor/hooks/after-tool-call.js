#!/usr/bin/env node
/**
 * Tokn't Cursor Hook
 * Intercepts tool output and applies token optimization.
 */
import { OptimizingAdapterWrapper } from '@toknt/adapters';

const wrapper = new OptimizingAdapterWrapper();

export async function afterToolCall(event) {
  if (!event?.output) return event;

  const content =
    typeof event.output === 'string' ? event.output : JSON.stringify(event.output);

  const optimized = await wrapper.processToolOutput({
    toolName: event.toolName ?? event.tool ?? 'unknown',
    content,
    path: event.path ?? event.arguments?.path,
    metadata: event.metadata,
  });

  return {
    ...event,
    output: optimized.content,
    toknt: optimized.metadata?.toknt,
  };
}

export async function beforeToolCall(event) {
  return event;
}
