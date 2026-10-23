// Module responsible for implementing the finite allowlist of workspace automation tools.

import path from 'node:path';
import type { ToolDefinition } from '@oneintern/domain';
import type { ScopedWorkspace } from './workspace.js';

export interface ToolResult {
  summary: string;
  detail: string;
  changedFiles: string[];
}

export interface WorkspaceTool extends ToolDefinition {
  execute(workspace: ScopedWorkspace, signal: AbortSignal): Promise<ToolResult>;
}

abstract class ReadTool implements WorkspaceTool {
  abstract readonly id: string;
  abstract readonly title: string;
  abstract readonly description: string;
  readonly risk = 'read' as const;
  readonly writesWorkspace = false;
  abstract execute(workspace: ScopedWorkspace, signal: AbortSignal): Promise<ToolResult>;
}

export class InventoryTool extends ReadTool {
  readonly id = 'inventory';
  readonly title = 'Map workspace';
  readonly description = 'Inventory supported files without reading outside the sandbox.';

  async execute(workspace: ScopedWorkspace): Promise<ToolResult> {
    const files = workspace.listFiles();
    return {
      summary: `${files.length} workspace files mapped`,
      detail: files.join(', '),
      changedFiles: [],
    };
  }
}

export class TodoScanTool extends ReadTool {
  readonly id = 'todo_scan';
  readonly title = 'Scan maintenance markers';
  readonly description = 'Find TODO and FIXME markers for human review.';

  async execute(workspace: ScopedWorkspace): Promise<ToolResult> {
    const findings = workspace.listTextFiles().flatMap((file) => {
      const lines = workspace.read(file).split('\n');
      return lines.flatMap((line, index) =>
        /\b(TODO|FIXME)\b/i.test(line) ? [`${file}:${index + 1}`] : [],
      );
    });
    return {
      summary: `${findings.length} maintenance marker${findings.length === 1 ? '' : 's'} found`,
      detail:
        findings.length > 0 ? findings.join(', ') : 'No TODO or FIXME markers found.',
      changedFiles: [],
    };
  }
}

export class MarkdownLinksTool extends ReadTool {
  readonly id = 'markdown_links';
  readonly title = 'Validate local links';
  readonly description = 'Check relative Markdown links inside the workspace boundary.';

  async execute(workspace: ScopedWorkspace): Promise<ToolResult> {
    const missing: string[] = [];
    const markdown = workspace.listFiles().filter((file) => file.endsWith('.md'));
    for (const file of markdown) {
      for (const match of workspace.read(file).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = match[1];
        if (!target || /^(https?:|#|mailto:)/.test(target)) continue;
        const clean = target.split('#')[0];
        if (!clean) continue;
        try {
          workspace.read(path.join(path.dirname(file), clean));
        } catch {
          missing.push(`${file} -> ${target}`);
        }
      }
    }
    return {
      summary:
        missing.length === 0
          ? 'All local links resolve'
          : `${missing.length} broken link(s) found`,
      detail:
        missing.length > 0
          ? missing.join(', ')
          : `${markdown.length} Markdown files checked.`,
      changedFiles: [],
    };
  }
}

export class QualitySnapshotTool extends ReadTool {
  readonly id = 'quality_snapshot';
  readonly title = 'Measure hygiene';
  readonly description = 'Check line limits, final newlines, and trailing whitespace.';

  async execute(workspace: ScopedWorkspace): Promise<ToolResult> {
    let trailing = 0;
    let missingFinalNewline = 0;
    let oversized = 0;
    for (const file of workspace.listTextFiles()) {
      const content = workspace.read(file);
      trailing += content.split('\n').filter((line) => /[ \t]+$/.test(line)).length;
      if (!content.endsWith('\n')) missingFinalNewline += 1;
      const maximum = /\.(test|spec)\./.test(file) ? 1000 : 300;
      if (content.split('\n').length > maximum) oversized += 1;
    }
    const total = trailing + missingFinalNewline + oversized;
    return {
      summary:
        total === 0
          ? 'Workspace hygiene checks pass'
          : `${total} hygiene issue(s) detected`,
      detail: `${trailing} trailing spaces, ${missingFinalNewline} missing final newlines, ${oversized} oversized files.`,
      changedFiles: [],
    };
  }
}

export class NormalizeMarkdownTool implements WorkspaceTool {
  readonly id = 'normalize_markdown';
  readonly title = 'Normalize Markdown';
  readonly description =
    'Remove trailing whitespace and add one final newline to Markdown files.';
  readonly risk = 'write' as const;
  readonly writesWorkspace = true;

  async execute(workspace: ScopedWorkspace): Promise<ToolResult> {
    const changedFiles: string[] = [];
    for (const file of workspace.listFiles().filter((item) => item.endsWith('.md'))) {
      const before = workspace.read(file);
      const after = `${before.replace(/[ \t]+$/gm, '').trimEnd()}\n`;
      if (after !== before) {
        workspace.write(file, after);
        changedFiles.push(file);
      }
    }
    return {
      summary: `${changedFiles.length} Markdown file${changedFiles.length === 1 ? '' : 's'} normalized`,
      detail:
        changedFiles.length > 0
          ? changedFiles.join(', ')
          : 'No Markdown changes were needed.',
      changedFiles,
    };
  }
}

export function createTools(): Map<string, WorkspaceTool> {
  const tools: WorkspaceTool[] = [
    new InventoryTool(),
    new TodoScanTool(),
    new MarkdownLinksTool(),
    new QualitySnapshotTool(),
    new NormalizeMarkdownTool(),
  ];
  return new Map(tools.map((tool) => [tool.id, tool]));
}
