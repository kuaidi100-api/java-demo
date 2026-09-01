<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { OrderAction, OrderStatus, type OrderDetail, type OrderSummary } from '@express-platform/shared-types';
import AppHeader from '@express-platform/ui-components/mobile/AppHeader.vue';
import BottomNavigation, { type NavigationItem } from '@express-platform/ui-components/mobile/BottomNavigation.vue';
import PriceDisplay from '@express-platform/ui-components/mobile/PriceDisplay.vue';
import StatusBadge from '@express-platform/ui-components/mobile/StatusBadge.vue';
import { courierApi } from '../../services/api';
import { requireCourier, useCourierAuth } from '../../stores/auth';
import { errorMessage, formatTime, statusLabel } from '../../utils';

const auth=useCourierAuth();
const orders=ref<OrderSummary[]>([]);
const details=ref<Record<string,OrderDetail>>({});
const loading=ref(true); const error=ref(''); const actingId=ref('');
const tab=ref<'pending'|'mine'|'history'|'profile'>('pending');
const navigation:NavigationItem[]=[{key:'workbench',label:'工作台',icon:'work'},{key:'tasks',label:'任务',icon:'list'},{key:'history',label:'历史',icon:'clock'},{key:'profile',label:'我的',icon:'user'}];
const visible=computed(()=>tab.value==='pending'?orders.value.filter(o=>o.status===OrderStatus.PENDING_ACCEPTANCE):tab.value==='history'?orders.value.filter(o=>[OrderStatus.COMPLETED,OrderStatus.CANCELLED].includes(o.status)):orders.value.filter(o=>![OrderStatus.PENDING_ACCEPTANCE,OrderStatus.COMPLETED,OrderStatus.CANCELLED].includes(o.status)));
const activeCount=computed(()=>orders.value.filter(o=>![OrderStatus.COMPLETED,OrderStatus.CANCELLED].includes(o.status)).length);
onShow(()=>{if(requireCourier())void load();});
async function load():Promise<void>{loading.value=true;error.value='';try{orders.value=await courierApi.orders();const result=await Promise.all(orders.value.map(order=>courierApi.order(order.id)));details.value=Object.fromEntries(result.map(detail=>[detail.id,detail]));}catch(cause:unknown){error.value=errorMessage(cause);}finally{loading.value=false;}}
function open(id:string):void{uni.navigateTo({url:`/pages/order-detail/index?id=${encodeURIComponent(id)}`});}
function address(id:string,type:'SENDER'|'RECIPIENT'):string{
  const item=details.value[id]?.addresses.find(address=>address.type===type);
  if(!item) return '地址加载中';
  const base=`${item.district||item.city} · ${item.detail}`;
  const lat=item.latitude!=null?Number(item.latitude):NaN;
  const lng=item.longitude!=null?Number(item.longitude):NaN;
  if(Number.isFinite(lat)&&Number.isFinite(lng)) return `${base}（${lat.toFixed(4)}, ${lng.toFixed(4)}）`;
  return base;
}
function distanceText(id:string):string{
  const list=details.value[id]?.addresses??[];
  const a=list.find(x=>x.type==='SENDER');
  const b=list.find(x=>x.type==='RECIPIENT');
  const lat1=a?.latitude!=null?Number(a.latitude):NaN;
  const lng1=a?.longitude!=null?Number(a.longitude):NaN;
  const lat2=b?.latitude!=null?Number(b.latitude):NaN;
  const lng2=b?.longitude!=null?Number(b.longitude):NaN;
  if(![lat1,lng1,lat2,lng2].every(Number.isFinite)) return '地图坐标待完善';
  const toRad=(d:number)=>d*Math.PI/180;
  const R=6371;
  const dLat=toRad(lat2-lat1);
  const dLng=toRad(lng2-lng1);
  const h=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  const km=2*R*Math.asin(Math.sqrt(h));
  return km<1?`约 ${Math.round(km*1000)} m`:`约 ${km.toFixed(1)} km`;
}
function selectNavigation(key:string):void{if(key==='workbench'||key==='tasks')tab.value='pending';else if(key==='history')tab.value='history';else tab.value='profile';}
function showMessages():void{uni.showToast({title:'暂无新任务消息',icon:'none'});}
async function accept(order:OrderSummary):Promise<void>{if(actingId.value)return;actingId.value=order.id;try{await courierApi.act(order.id,{action:OrderAction.ACCEPT,reason:'配送员工作台确认接单'});uni.showToast({title:'接单成功',icon:'success'});await load();tab.value='mine';}catch(cause:unknown){uni.showToast({title:errorMessage(cause),icon:'none',duration:2500});}finally{actingId.value='';}}
</script>

<template>
  <view class="page workbench-page">
    <AppHeader mark="骑" :title="auth.subject?.displayName??'配送员工作台'" subtitle="万象测试服务区 · 在线接单" @message="showMessages"/>
    <view v-if="tab!=='profile'">
      <view class="work-hero"><view><text class="hero-label">今日任务</text><text class="hero-number">{{activeCount}}</text><text class="hero-copy">当前可处理配送任务</text></view><view class="availability"><i/><text>接单中</text></view><text class="dev-corner">模拟</text></view>
      <view class="quick-stats card"><view><strong>{{orders.filter(o=>o.status===OrderStatus.PENDING_ACCEPTANCE).length}}</strong><text>待接单</text></view><view><strong>{{orders.filter(o=>[OrderStatus.ACCEPTED,OrderStatus.PICKING_UP,OrderStatus.PICKED_UP,OrderStatus.IN_TRANSIT].includes(o.status)).length}}</strong><text>进行中</text></view><view><strong>{{orders.filter(o=>o.status===OrderStatus.COMPLETED).length}}</strong><text>已完成</text></view></view>
      <view class="tabs"><button :class="{active:tab==='pending'}" @tap="tab='pending'">待接任务</button><button :class="{active:tab==='mine'}" @tap="tab='mine'">进行中</button><button :class="{active:tab==='history'}" @tap="tab='history'">历史</button></view>
      <view v-if="loading" class="state-panel card"><text class="state-title">正在同步任务</text><text>从调度中心获取最新订单…</text></view>
      <view v-else-if="error" class="state-panel error-panel"><text class="state-title">任务加载失败</text><text>{{error}}</text><button class="secondary-button retry" @tap="load">重新加载</button></view>
      <view v-else-if="visible.length===0" class="state-panel card"><text class="empty-icon">✓</text><text class="state-title">当前没有任务</text><text>{{tab==='pending'?'调度中心有新订单时会显示在这里。':'完成的任务会记录在历史中。'}}</text></view>
      <view v-else><view v-for="order in visible" :key="order.id" class="task-card card"><view class="task-head"><view><text class="order-no">{{order.orderNo}}</text><text class="task-time">预约 {{formatTime(order.scheduledPickupAt)}}</text></view><StatusBadge :label="statusLabel[order.status]" :tone="order.status===OrderStatus.PENDING_ACCEPTANCE?'warning':'primary'"/></view><view class="route"><view><i>取</i><text>{{address(order.id,'SENDER')}}</text></view><span/><view><i class="end">送</i><text>{{address(order.id,'RECIPIENT')}}</text></view></view><view class="task-meta"><text>{{distanceText(order.id)}}</text><PriceDisplay :value="order.estimatedFee" :currency="order.currency" strong/></view><view class="task-actions"><button class="secondary-button" @tap="open(order.id)">查看任务</button><button v-if="order.status===OrderStatus.PENDING_ACCEPTANCE" class="primary-button" :loading="actingId===order.id" :disabled="Boolean(actingId)" @tap="accept(order)">{{actingId===order.id?'接单中…':'立即接单'}}</button><button v-else class="primary-button" @tap="open(order.id)">继续处理</button></view></view></view>
      <view class="work-note card"><text class="note-icon">安</text><view><strong>保持在线，及时确认任务</strong><text>地图导航当前为适配层占位，出发前请核对取送地址。</text></view></view>
    </view>
    <view v-else class="profile-panel"><view class="profile-card card"><view class="avatar">{{auth.subject?.displayName?.slice(0,1)??'骑'}}</view><view><text class="profile-name">{{auth.subject?.displayName??'配送员'}}</text><text class="profile-meta">在线 · 模拟配送账号</text></view></view><button class="logout" @tap="auth.logout">退出配送员账号</button></view>
    <BottomNavigation :active="tab==='profile'?'profile':tab==='history'?'history':tab==='mine'?'tasks':'workbench'" :items="navigation" @select="selectNavigation"/>
  </view>
</template>

<style scoped>
.workbench-page{padding-top:22rpx}.work-hero{position:relative;display:flex;align-items:center;justify-content:space-between;padding:30rpx;border-radius:24rpx;color:#111827;background:#fff;border:1rpx solid rgba(17,24,39,.06)}.hero-label,.hero-number,.hero-copy{display:block}.hero-label{color:#6b7280;font-size:20rpx;font-weight:500}.hero-number{margin-top:6rpx;font-size:52rpx;font-weight:600;letter-spacing:-0.04em}.hero-copy{color:#666;font-size:19rpx}.availability{display:flex;align-items:center;gap:10rpx;padding:13rpx 17rpx;border-radius:999rpx;background:#fff;font-size:19rpx}.availability i{width:12rpx;height:12rpx;border-radius:50%;background:#4caf50;box-shadow:0 0 0 7rpx rgba(76,175,80,.12)}.dev-corner{position:absolute;right:20rpx;top:16rpx;color:#999;font-size:16rpx}.quick-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:17rpx;padding:20rpx}.quick-stats view{text-align:center;border-right:1px solid var(--km-border)}.quick-stats view:last-child{border:0}.quick-stats strong,.quick-stats text{display:block}.quick-stats strong{font-size:30rpx}.quick-stats text{margin-top:4rpx;color:var(--km-text-muted);font-size:18rpx}.tabs{display:flex;gap:9rpx;margin:25rpx 0 15rpx}.tabs button{height:58rpx;padding:0 20rpx;border:0;border-radius:999rpx;color:#666;background:#f3f4f6;font-size:20rpx}.tabs button.active{color:#fff;background:#2563eb;font-weight:600}.task-card{margin-bottom:16rpx;padding:24rpx}.task-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14rpx}.order-no,.task-time{display:block}.order-no{font-size:23rpx;font-weight:900}.task-time{margin-top:7rpx;color:var(--km-text-muted);font-size:18rpx}.route{margin:22rpx 0}.route>view{display:flex;align-items:center;gap:13rpx;color:#554e48;font-size:21rpx}.route i{display:grid;place-items:center;width:40rpx;height:40rpx;border-radius:13rpx;color:#fff;background:var(--km-primary);font-style:normal;font-size:17rpx;font-weight:900}.route i.end{background:#90caf9}.route span{display:block;width:2px;height:20rpx;margin:3rpx 0 3rpx 19rpx;background:#bbdefb}.task-meta{display:flex;align-items:center;justify-content:space-between;padding:17rpx 0;border-top:1px dashed var(--km-border);color:var(--km-text-muted);font-size:19rpx}.task-actions{display:grid;grid-template-columns:1fr 1.35fr;gap:12rpx}.task-actions button{width:100%;height:72rpx;line-height:72rpx;font-size:22rpx}.work-note{display:flex;gap:16rpx;margin-top:18rpx;padding:21rpx}.work-note strong,.work-note text{display:block}.work-note strong{font-size:21rpx}.work-note text{margin-top:6rpx;color:var(--km-text-muted);font-size:18rpx;line-height:1.5}.note-icon{flex:none;display:grid!important;place-items:center;width:42rpx;height:42rpx!important;margin:0!important;border-radius:14rpx;color:#fff!important;background:var(--km-success);font-weight:900}.retry{width:220rpx;margin-top:20rpx}.empty-icon{display:grid;place-items:center;width:58rpx;height:58rpx;margin:0 auto 16rpx;border-radius:50%;color:var(--km-success);background:#e7f5ef;font-weight:900}.profile-card{display:flex;align-items:center;gap:20rpx;margin-top:12rpx;padding:28rpx}.avatar{display:grid;place-items:center;width:78rpx;height:78rpx;border-radius:24rpx;color:#fff;background:var(--km-primary);font-size:30rpx;font-weight:900}.profile-name,.profile-meta{display:block}.profile-name{font-size:28rpx;font-weight:900}.profile-meta{margin-top:7rpx;color:var(--km-text-muted);font-size:20rpx}.logout{width:100%;margin-top:22rpx;border:1px solid var(--km-border);border-radius:22rpx;color:var(--km-danger);background:#fff;font-size:23rpx}
</style>
