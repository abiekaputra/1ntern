// Module responsible for constraining file access to the configured demo workspace.

import fs from 'node:fs';
import path from 'node:path';
import type { WorkspaceFile } from '@oneintern/domain';

const ignoredNames = new Set(['.git', 'node_modules', 'dist']);

export class ScopedWorkspace {
  constructor(
    readonly root: string,
    private readonly fixtureRoot: string,
  ) {}

  reset(): void {
    fs.rmSync(this.root, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(this.root), { recursive: true });
    fs.cpSync(this.fixtureRoot, this.root, { recursive: true });
  }

  resolve(relativePath: string): string {
    const absolute = path.resolve(this.root, relativePath);
    const rootPrefix = `${path.resolve(this.root)}${path.sep}`;
    if (absolute !== path.resolve(this.root) && !absolute.startsWith(rootPrefix)) {
      throw new Error('Path escapes the scoped workspace.');
    }
    const existingParent = fs.existsSync(absolute) ? absolute : path.dirname(absolute);
    if (fs.existsSync(existingParent) && fs.lstatSync(existingParent).isSymbolicLink()) {
      throw new Error('Symbolic links are outside the supported workspace boundary.');
    }
    return absolute;
  }

  listFiles(): string[] {
    const walk = (directory: string): string[] =>
      fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (ignoredNames.has(entry.name)) return [];
        const absolute = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) return [];
        return entry.isDirectory()
          ? walk(absolute)
          : [path.relative(this.root, absolute)];
      });
    return fs.existsSync(this.root) ? walk(this.root).sort() : [];
  }

  listTextFiles(): string[] {
    return this.listFiles().filter((file) =>
      /\.(md|txt|json|ts|tsx|js|css)$/i.test(file),
    );
  }

  read(relativePath: string): string {
    return fs.readFileSync(this.resolve(relativePath), 'utf8');
  }

  write(relativePath: string, content: string): void {
    fs.writeFileSync(this.resolve(relativePath), content, 'utf8');
  }

  snapshot(files: string[]): Record<string, string> {
    return Object.fromEntries(files.map((file) => [file, this.read(file)]));
  }

  restore(snapshot: Record<string, string>): void {
    for (const [file, content] of Object.entries(snapshot)) this.write(file, content);
  }

  describeFiles(changedFiles: Set<string>): WorkspaceFile[] {
    return this.listFiles().map((file) => ({
      path: file,
      bytes: fs.statSync(this.resolve(file)).size,
      status: changedFiles.has(file) ? 'changed' : 'clean',
    }));
  }
}
