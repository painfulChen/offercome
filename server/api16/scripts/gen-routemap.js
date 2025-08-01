// 路由映射生成脚本
const fs = require('fs');
const path = require('path');

// 扫描routes目录下的所有路由文件
function scanRouteFiles() {
    const routesDir = path.join(__dirname, '../routes');
    const files = fs.readdirSync(routesDir);
    
    return files
        .filter(file => file.endsWith('.js'))
        .map(file => path.join(routesDir, file));
}

// 从路由文件中提取路由信息
function extractRoutesFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const routes = [];
    
    // 简单的路由提取逻辑（可以根据需要扩展）
    const routeRegex = /router\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
        routes.push({
            method: match[1].toUpperCase(),
            path: match[2],
            file: path.basename(filePath)
        });
    }
    
    return routes;
}

// 生成路由映射
function generateRouteMap() {
    const routeFiles = scanRouteFiles();
    const allRoutes = [];
    
    routeFiles.forEach(file => {
        const routes = extractRoutesFromFile(file);
        allRoutes.push(...routes);
    });
    
    console.log('// 自动生成的路由映射');
    console.log('// 生成时间:', new Date().toISOString());
    console.log('');
    console.log('const routeMap = {');
    
    allRoutes.forEach((route, index) => {
        const isLast = index === allRoutes.length - 1;
        console.log(`  '${route.method} ${route.path}': {`);
        console.log(`    method: '${route.method}',`);
        console.log(`    path: '${route.path}',`);
        console.log(`    file: '${route.file}'`);
        console.log(`  }${isLast ? '' : ','}`);
    });
    
    console.log('};');
    console.log('');
    console.log('module.exports = routeMap;');
}

// 执行生成
if (require.main === module) {
    generateRouteMap();
} 