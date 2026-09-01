<script setup lang="ts">
import { openSupportSheet } from '../../utils/supportBus';
import type { SupportBusiness } from '../../data/support';
import { t } from '../../i18n';

const props = defineProps<{ business: SupportBusiness }>();

function contact(): void {
  openSupportSheet({ business: props.business, locked: true });
}
</script>

<template>
  <view class="cs-contact" role="button" @tap="contact">
    <text class="cs-contact-txt">{{ t('support.contact') }}</text>
  </view>
</template>

<style scoped>
.cs-contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--km-primary, #2563eb) 40%, transparent);
  background: color-mix(in srgb, var(--km-primary, #2563eb) 8%, var(--km-surface, #fff));
}
.cs-contact-txt {
  font-size: 13px;
  font-weight: 700;
  color: var(--km-primary, #2563eb);
}
</style>
