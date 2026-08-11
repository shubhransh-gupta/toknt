export interface DirectoryNode {
  name: string;
  fileCount: number;
  children: DirectoryNode[];
}

export interface DirectorySummary {
  tree: string;
  totalFiles: number;
  topLevelDirs: Array<{ name: string; count: number }>;
}

export function parseDirectoryPaths(paths: string[]): DirectorySummary {
  const dirCounts = new Map<string, number>();
  let totalFiles = 0;

  for (const rawPath of paths) {
    const path = rawPath.replace(/^\.\//, '').trim();
    if (!path) continue;
    totalFiles++;

    const parts = path.split('/');
    if (parts.length === 1) {
      dirCounts.set('(root)', (dirCounts.get('(root)') ?? 0) + 1);
    } else {
      const topDir = parts[0];
      dirCounts.set(topDir, (dirCounts.get(topDir) ?? 0) + 1);
    }
  }

  const topLevelDirs = [...dirCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));

  const tree = topLevelDirs
    .map(({ name, count }) => `${name}/          ${count.toLocaleString()} files`)
    .join('\n');

  return { tree, totalFiles, topLevelDirs };
}

export function formatDirectorySummary(summary: DirectorySummary, recallUri: string): string {
  return [
    'PROJECT STRUCTURE',
    '',
    summary.tree,
    '',
    'Total:',
    `${summary.totalFiles.toLocaleString()} files`,
    '',
    'Detailed listing available for recall.',
    `Reference: ${recallUri}`,
  ].join('\n');
}

export function shouldCompressDirectory(content: string, threshold = 50): boolean {
  return content.split('\n').filter((l) => l.trim()).length >= threshold;
}

export function searchDirectoryIndex(
  paths: string[],
  query: string
): string[] {
  const lower = query.toLowerCase();
  return paths.filter((p) => p.toLowerCase().includes(lower)).slice(0, 50);
}
