<script setup lang="ts">
import type { AddressInput } from '@express-platform/shared-types';

const model = defineModel<AddressInput>({ required: true });
</script>

<template>
  <view>
    <view class="field"><text class="field-label">联系人</text><input v-model.trim="model.contactName" class="field-input" placeholder="寄件人姓名" /></view>
    <view class="field"><text class="field-label">国际格式手机号</text><input v-model.trim="model.phone" class="field-input" placeholder="+85620…" /></view>
    <view class="field"><text class="field-label">城市</text><input v-model.trim="model.city" class="field-input" placeholder="万象市" /></view>
    <view class="field"><text class="field-label">地区</text><input v-model.trim="model.district" class="field-input" placeholder="区 / 县" /></view>
    <view class="field"><text class="field-label">详细地址</text><textarea v-model.trim="model.detail" class="field-input textarea" placeholder="街道、门牌、地标" /></view>
  </view>
</template>
