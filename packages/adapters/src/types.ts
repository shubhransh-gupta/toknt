export interface ToolInput {
  toolName: string;
  arguments: Record<string, unknown>;
  sessionId?: string;
}

export interface ToolOutput {
  toolName: string;
  content: string;
  metadata?: Record<string, unknown>;
  path?: string;
  success?: boolean;
}

export interface AgentInfo {
  name: string;
  installed: boolean;
  version?: string;
  configPath?: string;
}

export interface AgentAdapter {
  readonly name: string;

  detect(): Promise<AgentInfo>;

  install(): Promise<void>;

  uninstall(): Promise<void>;

  interceptToolInput?(input: ToolInput): Promise<ToolInput>;

  interceptToolOutput?(output: ToolOutput): Promise<ToolOutput>;

  onSessionStart?(): Promise<void>;

  onSessionEnd?(): Promise<void>;
}

export abstract class BaseAdapter implements AgentAdapter {
  abstract readonly name: string;

  abstract detect(): Promise<AgentInfo>;
  abstract install(): Promise<void>;
  abstract uninstall(): Promise<void>;

  async interceptToolInput(input: ToolInput): Promise<ToolInput> {
    return input;
  }

  async interceptToolOutput(output: ToolOutput): Promise<ToolOutput> {
    return output;
  }

  async onSessionStart(): Promise<void> {}
  async onSessionEnd(): Promise<void> {}
}
