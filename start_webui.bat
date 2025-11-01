@echo off
chcp 65001 > nul
echo ========================================
echo    NutriScan MY - Backend Dashboard
echo ========================================
echo.

cd /d "%~dp0"
cd web_ui

echo 检查 Node.js 是否已安装...
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 检查端口 5000 是否被占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo 发现端口占用，正在关闭旧进程 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo 检查依赖是否已安装...
if not exist "node_modules\" (
    echo 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo 正在启动后端服务器...
echo 访问地址: http://localhost:5000
echo.
echo 按 Ctrl+C 可以停止服务器
echo ========================================
echo.

call npm start

pause

