import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import path from 'node:path';

const bcrypt = ['BCrypt.Net-Next', '4.0.3', '0715c7023215db106e44f51ecf30bee6385a1e2421827a93935935928dc3e83b'];
export const nugetPackages = {
  mysql: [
    ['MySqlConnector', '2.6.1', '225c217c2fb6a63b03bbfb17e30d3f7ba31931cc48ce53bc312deb3d3c5cc44e'],
    bcrypt,
    ['Microsoft.Extensions.Logging.Abstractions', '8.0.2', '707a5ef17d818186b90f3ba565fab6e2b83c3b62b92e6ab63a22e1a320158097'],
    ['Microsoft.Extensions.DependencyInjection.Abstractions', '8.0.2', '51f2df1100245f10da54f0bb7e813f277155117777d4fbbab902214e27372606'],
  ],
  postgresql: [
    ['Npgsql', '10.0.1', '71be33f961fdab29d2ea7e08e371734a289f58bce01f6e8700ffc39d9bec8da9'],
    bcrypt,
    ['Microsoft.Extensions.Logging.Abstractions', '9.0.0', '8814ecf6dc2359715e111b78084ae42087282595358eb775456088f15e63eca5'],
    ['Microsoft.Extensions.DependencyInjection.Abstractions', '9.0.0', '0a7715c24299e42b081b63b4f8e33da97b985e1de9e941b2b9e4c748b0d52fe7'],
    ['Microsoft.Extensions.Logging.Abstractions', '10.0.0', '067860199734d47c134b1a206afabb51eab857b88c037c0f9db7d1c10e118469'],
    ['Microsoft.Extensions.DependencyInjection.Abstractions', '10.0.0', 'f62a1d5cfdfd62a831a269ce3cec5dfe6cdb1b425f3925f3168354de8993d8fb'],
  ],
};

const packageFile = (name, version) => `${name.toLowerCase()}.${version}.nupkg`;
export const downloadPackage = (name, version) =>
  `https://api.nuget.org/v3-flatcontainer/${name.toLowerCase()}/${version}/${packageFile(name, version)}`;

export const offlineConfig = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageRestore>
    <add key="enabled" value="True" />
    <add key="automatic" value="True" />
  </packageRestore>
  <packageSources>
    <clear />
    <add key="DKIP offline" value="nuget-packages" />
  </packageSources>
  <auditSources>
    <clear />
  </auditSources>
</configuration>
`;

const sourceNotice = `# Пакеты NuGet

Здесь хранятся оригинальные файлы .nupkg для .NET 10 и .NET 9. Сведения об авторах и лицензиях доступны в пакетах и на страницах NuGet.

- [MySqlConnector](https://www.nuget.org/packages/MySqlConnector/2.6.1) · [MIT](https://github.com/mysql-net/MySqlConnector/blob/2.6.1/LICENSE)
- [Npgsql](https://www.nuget.org/packages/Npgsql/10.0.1) · [PostgreSQL License](https://github.com/npgsql/npgsql/blob/v10.0.1/LICENSE)
- [BCrypt.Net-Next](https://www.nuget.org/packages/BCrypt.Net-Next/4.0.3) · [лицензия](https://github.com/BcryptNet/bcrypt.net/blob/main/licence.txt)
- [Microsoft.Extensions.Logging.Abstractions](https://www.nuget.org/packages/Microsoft.Extensions.Logging.Abstractions), [Microsoft.Extensions.DependencyInjection.Abstractions](https://www.nuget.org/packages/Microsoft.Extensions.DependencyInjection.Abstractions) · MIT
`;

async function readPackage([name, version, expectedHash]) {
  const file = packageFile(name, version);
  const cache = process.env.NUGET_PACKAGES || path.join(homedir(), '.nuget', 'packages');
  const local = await fs.readFile(path.join(cache, name.toLowerCase(), version, file)).catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
  const hasExpectedHash = bytes => createHash('sha256').update(bytes).digest('hex') === expectedHash;
  if (local && hasExpectedHash(local)) return [file, local];

  const response = await fetch(downloadPackage(name, version), {signal: AbortSignal.timeout(60_000)});
  if (!response.ok) throw new Error(`NuGet ${file}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!hasExpectedHash(bytes)) throw new Error(`NuGet ${file}: SHA-256 не совпадает`);
  return [file, bytes];
}

export async function offlinePackages() {
  const unique = new Map(Object.values(nugetPackages).flat().map(entry => [packageFile(...entry), entry]));
  const files = new Map(await Promise.all([...unique.values()].map(readPackage)));
  return Object.fromEntries(Object.entries(nugetPackages).map(([stack, packages]) => [stack, {
    'nuget-packages/README.md': sourceNotice,
    ...Object.fromEntries(packages.map(entry => {
      const file = packageFile(...entry);
      return [`nuget-packages/${file}`, files.get(file)];
    })),
  }]));
}
