@echo off
setlocal
pushd "%~dp0" || exit /b 1
dotnet restore "DairyDemo.Auth.sln" --configfile "NuGet.Config" --no-http-cache
if errorlevel 1 (
    echo.
    echo Restore failed. Check that .NET 8 SDK is installed and the entire ZIP is extracted.
    pause
    popd
    exit /b 1
)
start "" "%~dp0DairyDemo.Auth.sln"
popd
