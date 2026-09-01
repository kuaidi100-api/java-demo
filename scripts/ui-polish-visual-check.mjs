import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const path=resolve(process.cwd(),'.env');
  for(const raw of readFileSync(path,'utf8').split(/\r?\n/u)){
    const line=raw.trim(); if(!line||line.startsWith('#')||!line.includes('='))continue;
    const index=line.indexOf('='); const key=line.slice(0,index).trim();
    if(process.env[key]===undefined)process.env[key]=line.slice(index+1).trim();
  }
}
loadEnv();
const executablePath=['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync);
if(!executablePath)throw new Error('未找到 Chrome 或 Edge');
const outputDir=resolve(process.cwd(),'.runtime','ui-polish'); mkdirSync(outputDir,{recursive:true});
const browser=await chromium.launch({executablePath,headless:true});
const results=[];

async function loginMobile({name,url,identifier,password,buttonText,expectedPath,readyText}){
  const context=await browser.newContext({viewport:{width:390,height:844}}); const page=await context.newPage();
  const consoleErrors=[]; page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());}); page.on('pageerror',error=>consoleErrors.push(error.message));
  await page.goto(url,{waitUntil:'networkidle'}); await page.locator('input').nth(0).fill(identifier); await page.locator('input').nth(1).fill(password);
  const loginResponse=page.waitForResponse(response=>response.url().endsWith('/auth/login')&&response.request().method()==='POST');
  await page.getByText(buttonText,{exact:true}).click(); const response=await loginResponse; await page.waitForURL(expectedPath,{timeout:10_000}); await page.getByText(readyText,{exact:false}).first().waitFor({state:'visible'}); await page.waitForTimeout(2_000);
  const mobilePath=resolve(outputDir,`${name}-390x844.png`); await page.screenshot({path:mobilePath});
  await page.setViewportSize({width:1440,height:900}); await page.waitForTimeout(400); const desktopPath=resolve(outputDir,`${name}-desktop-1440x900.png`); await page.screenshot({path:desktopPath});
  results.push({name,loginStatus:response.status(),url:page.url(),consoleErrors,mobilePath,desktopPath}); await context.close();
}

try{
  await loginMobile({name:'user-home',url:'http://127.0.0.1:5173/#/pages/login/index',identifier:process.env.SEED_USER_PHONE,password:process.env.SEED_USER_PASSWORD,buttonText:'进入木棉速达',expectedPath:/#\/pages\/home\/index/u,readyText:'最近订单'});
  await loginMobile({name:'courier-workbench',url:'http://127.0.0.1:5174/#/pages/login/index',identifier:process.env.SEED_COURIER_PHONE,password:process.env.SEED_COURIER_PASSWORD,buttonText:'进入工作台',expectedPath:/#\/pages\/workbench\/index/u,readyText:'待接任务'});

  const context=await browser.newContext({viewport:{width:1440,height:900}}); const page=await context.newPage(); const consoleErrors=[];
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());}); page.on('pageerror',error=>consoleErrors.push(error.message));
  await page.goto('http://127.0.0.1:5175/#/login',{waitUntil:'networkidle'}); await page.locator('input').nth(0).fill(process.env.SEED_ADMIN_USERNAME); await page.locator('input').nth(1).fill(process.env.SEED_ADMIN_PASSWORD);
  const loginResponse=page.waitForResponse(response=>response.url().endsWith('/auth/login')&&response.request().method()==='POST'); await page.getByText('进入运营中心',{exact:true}).click(); const response=await loginResponse; await page.waitForURL(/#\/overview/u);
  await page.goto('http://127.0.0.1:5175/#/orders',{waitUntil:'networkidle'}); const pendingOrder=page.locator('tbody tr').filter({hasText:'待接单'}).first(); let selectedOrder=pendingOrder; try{await pendingOrder.waitFor({state:'visible',timeout:5_000});}catch{selectedOrder=page.locator('tbody tr').first();await selectedOrder.waitFor({state:'visible'});} await selectedOrder.click(); await page.waitForURL(/#\/orders\//u); await page.getByText('订单操作',{exact:true}).waitFor({state:'visible'}); await page.waitForTimeout(500);
  const adminPath=resolve(outputDir,'admin-order-detail-1440x900.png'); await page.screenshot({path:adminPath});
  results.push({name:'admin-order-detail',loginStatus:response.status(),url:page.url(),consoleErrors,desktopPath:adminPath}); await context.close();
}finally{await browser.close();}

const resultPath=resolve(outputDir,'visual-check-results.json'); writeFileSync(resultPath,`${JSON.stringify(results,null,2)}\n`,'utf8'); console.log(JSON.stringify({resultPath,results},null,2));
if(results.some(result=>result.loginStatus!==200||result.consoleErrors.length>0))process.exitCode=1;
