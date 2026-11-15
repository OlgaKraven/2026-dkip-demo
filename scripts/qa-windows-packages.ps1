$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$share=Join-Path $root 'site\downloads'
$work=Join-Path $root ('output\Dkip2026PackageCheck-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $work | Out-Null
foreach($stack in 'mysql','postgresql'){
  $zip=Join-Path $share ("dkip2026-"+$stack+'.zip')
  $target=Join-Path $work $stack
  Expand-Archive -LiteralPath $zip -DestinationPath $target
  $project=Join-Path $target 'DairyDemo.Auth\DairyDemo.Auth.csproj'
  $config=Join-Path $target 'NuGet.Config'
  $emptyPackages=Join-Path $work "restore-$stack"
  & dotnet restore $project --configfile $config --packages $emptyPackages --no-http-cache --nologo
  if($LASTEXITCODE -ne 0){ throw ('Offline restore failed '+$stack) }
  & dotnet build $project --no-restore --nologo -v quiet
  if($LASTEXITCODE -ne 0){ throw ('Build failed '+$stack) }
  $images=Join-Path $target 'DairyDemo.Auth\bin\Debug\net10.0-windows\Assets\captcha'
  $count=@(Get-ChildItem -LiteralPath $images -Filter '*.png').Count
  if($count -ne 4){throw ('Captcha missing in '+$stack)}
  $sourceSettings=Join-Path $target 'Launch\db-connection.txt'
  $builtSettings=Join-Path (Split-Path -Parent (Split-Path -Parent $images)) 'db-connection.txt'
  if(!(Test-Path -LiteralPath $builtSettings) -or
      (Get-FileHash -LiteralPath $builtSettings).Hash -ne (Get-FileHash -LiteralPath $sourceSettings).Hash){
    throw ('Connection settings were not copied '+$stack)
  }
  $application=Join-Path $target 'Launch\DairyDemo.Auth.exe'
  if(!(Test-Path -LiteralPath $application -PathType Leaf)){throw ('Launcher missing in '+$stack)}
  Write-Output "$stack offline restore and build OK, $count PNG files copied to output"
}
