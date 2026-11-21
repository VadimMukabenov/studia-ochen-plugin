const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests/ui',use:{baseURL:'http://127.0.0.1:18761',headless:true},webServer:{command:'python3 -m http.server 18761 --bind 127.0.0.1',url:'http://127.0.0.1:18761',reuseExistingServer:false},workers:1});
