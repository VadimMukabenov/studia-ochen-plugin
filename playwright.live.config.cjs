const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests/live',workers:1,use:{baseURL:'http://127.0.0.1:18763',headless:true,viewport:{width:1100,height:900},video:'on'},outputDir:'test-results/live'});
