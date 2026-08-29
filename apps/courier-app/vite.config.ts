import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
export default defineConfig(({mode})=>{const env=loadEnv(mode,'../../','VITE_');return{envDir:'../../',plugins:[uni()],server:{host:'127.0.0.1',port:Number(env.VITE_COURIER_APP_PORT??5174),strictPort:true}};});
