import { ApiClient,type TokenPair,type TokenStore } from '@express-platform/api-client';
import type { AuthSession,LoginInput,OrderActionInput,OrderDetail,OrderSummary } from '@express-platform/shared-types';
const TOKEN_KEY='express.courier.tokens';
const tokenStore:TokenStore={get(){const value=uni.getStorageSync(TOKEN_KEY) as unknown;if(!value||typeof value!=='object'||!('accessToken'in value)||!('refreshToken'in value))return null;const pair=value as{accessToken:unknown;refreshToken:unknown};return typeof pair.accessToken==='string'&&typeof pair.refreshToken==='string'?{accessToken:pair.accessToken,refreshToken:pair.refreshToken}:null;},set(tokens){uni.setStorageSync(TOKEN_KEY,tokens);},clear(){uni.removeStorageSync(TOKEN_KEY);}};
export const api=new ApiClient({baseUrl:import.meta.env.VITE_API_BASE_URL||'/api/v1',tokenStore,timeoutMs:12000,onUnauthorized:()=>{uni.removeStorageSync('express.courier.subject');uni.reLaunch({url:'/pages/login/index?reason=expired'});}});
export const courierApi={
  login(input:LoginInput):Promise<AuthSession>{return api.post('/auth/login',input,{auth:false,retryUnauthorized:false});},
  orders():Promise<OrderSummary[]>{return api.get('/orders');},
  order(id:string):Promise<OrderDetail>{return api.get(`/orders/${encodeURIComponent(id)}`);},
  act(id:string,input:OrderActionInput):Promise<OrderDetail>{return api.post(`/orders/${encodeURIComponent(id)}/actions`,input);},
  reject(id:string,reason:string,photoKey?:string):Promise<OrderDetail>{return api.post(`/errands/${encodeURIComponent(id)}/reject`,{reason,photoKey});},
  collect(id:string,paymentImgKey?:string):Promise<OrderDetail>{return api.post(`/errands/${encodeURIComponent(id)}/collect`,{paymentImgKey});},
  proof(id:string,kind:'pickup'|'payment',storageKey:string):Promise<unknown>{return api.post(`/errands/${encodeURIComponent(id)}/proofs`,{kind,storageKey});},
};
export{tokenStore};
