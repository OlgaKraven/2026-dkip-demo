$ErrorActionPreference='Stop'
$share=Join-Path (Split-Path -Parent $PSScriptRoot) 'site\downloads'
$work=Join-Path $env:TEMP ('Dkip2026PackageCheck-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work | Out-Null
foreach($stack in 'mysql','postgresql'){
  $zip=Join-Path $share ("dkip2026-"+$stack+'.zip')
  $target=Join-Path $work $stack
  Expand-Archive -LiteralPath $zip -DestinationPath $target
  $project=Join-Path $target 'DairyDemo.Auth\DairyDemo.Auth.csproj'
  & dotnet build $project --nologo -v quiet -p:NuGetAudit=false
  if($LASTEXITCODE -ne 0){ throw ('Build failed '+$stack) }
  $images=Join-Path $target 'DairyDemo.Auth\bin\Debug\net8.0-windows\Assets\captcha'
  $count=@(Get-ChildItem -LiteralPath $images -Filter '*.png').Count
  if($count -ne 4){throw ('Captcha missing in '+$stack)}
  Write-Output "$stack build OK, $count PNG files copied to output"
}
