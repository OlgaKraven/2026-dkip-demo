import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export function publishExample(pack) {
  const temp = fs.mkdtempSync(path.join(tmpdir(), 'dkip-example-'));
  try {
    for (const [file, bytes] of Object.entries(pack)) {
      if (!file.startsWith('DairyDemo.Auth/') && !file.endsWith('.nupkg') && file !== 'NuGet.Config') continue;
      const destination = path.join(temp, file);
      fs.mkdirSync(path.dirname(destination), {recursive:true});
      fs.writeFileSync(destination, bytes);
    }
    const published = path.join(temp, 'published');
    const args = [
      'publish', 'DairyDemo.Auth/DairyDemo.Auth.csproj',
      '--configuration', 'Release', '--runtime', 'win-x64', '--no-self-contained',
      '--output', published, '--nologo', '-p:EnableWindowsTargeting=true',
    ];
    if (process.platform !== 'win32') {
      // The build host needs the Windows targeting and app-host packs.
      args.push('--source', path.join(temp, 'nuget-packages'), '--source', 'https://api.nuget.org/v3/index.json');
    }
    execFileSync('dotnet', args, {cwd:temp, stdio:'inherit'});

    return Object.fromEntries(fs.readdirSync(published, {recursive:true, withFileTypes:true})
      .filter(entry => entry.isFile() && !entry.name.endsWith('.pdb'))
      .map(entry => {
        const file = path.join(entry.parentPath, entry.name);
        return ['Launch/' + path.relative(published, file).split(path.sep).join('/'), fs.readFileSync(file)];
      }));
  } finally {
    fs.rmSync(temp, {recursive:true, force:true});
  }
}
