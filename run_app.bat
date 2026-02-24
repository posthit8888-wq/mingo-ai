@echo off
title AI Workspace Launcher
echo ==========================================
echo    AI Workspace 앱을 실행하는 중입니다...
echo ==========================================
echo.
echo [!] 방법 1 (가장 추천): VS Code에서 'Live Server'를 사용하세요.
echo     (가장 안정적인 방법입니다. 설치 후 오른쪽 하단 'Go Live' 클릭)
echo.
echo [!] 방법 2 (현실적인 방법): 아래 검은 창이 켜져 있는 동안만 로그인이 가능합니다.
echo.

:: Check Method 1: Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python을 사용하여 서버를 시작합니다...
    start http://127.0.0.1:8000/chat.html
    python -m http.server 8000
    goto END
)

:: Check Method 2: Node.js
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js(npx)를 사용하여 서버를 시작합니다...
    start http://127.0.0.1:8000/chat.html
    npx -y http-server -p 8000
    goto END
)

:: Check Method 3: PowerShell (Windows Native)
echo [!] 윈도우 기본 서버(PowerShell)로 실행을 시도합니다...
echo [!] 혹시 '허용' 팝업이 뜨면 [예]를 눌러주세요.
echo.

start http://127.0.0.1:8000/chat.html
powershell -NoProfile -ExecutionPolicy Bypass -Command "$l = New-Object System.Net.HttpListener; $l.Prefixes.Add('http://127.0.0.1:8000/'); try { $l.Start(); Write-Host '서버가 http://127.0.0.1:8000 에서 작동 중입니다!'; while($l.IsListening) { $c = $l.GetContext(); $p = Join-Path $pwd ($c.Request.Url.LocalPath -replace '^/',''); if(Test-Path $p -PathType Leaf){ $b = [System.IO.File]::ReadAllBytes($p); $ext = [System.IO.Path]::GetExtension($p); $ct = 'text/html'; if($ext -eq '.js'){$ct='application/javascript'} elseif($ext -eq '.css'){$ct='text/css'} elseif($ext -eq '.png'){$ct='image/png'}; $c.Response.ContentType = $ct; $c.Response.ContentLength64 = $b.Length; $c.Response.OutputStream.Write($b, 0, $b.Length) } else { $c.Response.StatusCode = 404 }; $c.Response.Close() } } catch { Write-Host '--- 오류 발견 ---' -ForegroundColor Red; $_.Exception.Message; pause }"

:END
if %errorlevel% neq 0 (
    echo.
    echo [X] 서버를 시작하지 못했습니다.
    echo.
    echo 1. VS Code 우측 하단의 [Go Live] 버튼을 사용하거나
    echo 2. 파이썬(python.org)을 설치해 주세요.
    pause
)
