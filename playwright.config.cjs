const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
 testDir:'./tests',timeout:30000,workers:1,
 use:{baseURL:'http://127.0.0.1:3101',headless:true,launchOptions:{executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'},viewport:{width:1440,height:1000}},
 globalSetup:require.resolve('./tests/test-server.cjs')
});
