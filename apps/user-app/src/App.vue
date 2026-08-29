<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  if (import.meta.env.VITE_PROVIDER_MODE !== 'mock') {
    console.warn('客户端未处于默认 Mock Provider 模式');
  }
});
</script>

<style>
page { background: #f7f3ed; color: #292621; font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif; }
view, text, input, textarea, button, picker { box-sizing: border-box; }
button::after { border: none; }
.page { min-height: 100vh; padding: 24rpx 28rpx 56rpx; }
.mock-pill { display: inline-flex; align-items: center; gap: 8rpx; padding: 8rpx 16rpx; color: #a7481c; background: #fff0e6; border: 1px solid #ffd0b8; border-radius: 999rpx; font-size: 22rpx; font-weight: 700; }
.topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28rpx; }
.topbar-title { font-size: 36rpx; font-weight: 800; }
.card { background: #fffdf9; border: 1px solid rgba(72, 57, 45, .08); border-radius: 28rpx; box-shadow: 0 14rpx 34rpx rgba(81, 52, 28, .07); }
.primary-button { height: 92rpx; line-height: 92rpx; border-radius: 22rpx; border: 0; color: #fff; background: linear-gradient(135deg, #f47736, #e95621); font-size: 30rpx; font-weight: 800; box-shadow: 0 14rpx 26rpx rgba(236, 91, 35, .22); }
.primary-button[disabled] { opacity: .55; }
.secondary-button { height: 78rpx; line-height: 78rpx; border-radius: 20rpx; color: #d95823; background: #fff3eb; font-size: 27rpx; font-weight: 700; }
.field { margin-bottom: 24rpx; }
.field-label { display: block; margin-bottom: 12rpx; font-size: 24rpx; color: #6f675f; font-weight: 700; }
.field-input { width: 100%; min-height: 84rpx; padding: 0 24rpx; border-radius: 18rpx; background: #f6f2ed; border: 1px solid transparent; font-size: 28rpx; }
.field-input:focus { border-color: #f47736; background: #fff; }
.textarea { height: 140rpx; padding-top: 22rpx; }
.state-panel { padding: 42rpx 28rpx; text-align: center; color: #7a7168; }
.state-title { display: block; margin-bottom: 12rpx; color: #3d3833; font-size: 28rpx; font-weight: 800; }
.error-panel { color: #a83b2e; background: #fff0ed; border-radius: 20rpx; }
.section-title { display: flex; justify-content: space-between; align-items: center; margin: 34rpx 4rpx 18rpx; font-size: 30rpx; font-weight: 800; }
.status-badge { display: inline-flex; padding: 8rpx 14rpx; border-radius: 999rpx; color: #a7481c; background: #fff0e6; font-size: 21rpx; font-weight: 800; }
</style>
