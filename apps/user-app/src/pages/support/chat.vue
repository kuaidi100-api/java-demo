<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { backOrHome } from '../../utils/navigation';
import { errorMessage } from '../../utils/presentation';
import { t, locale } from '../../i18n';
import {
  SUPPORT_BUSINESSES,
  type SupportBusiness,
  type SupportChannel,
} from '../../data/support';

type Msg = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  orderCard?: { orderId: string; orderNo: string; status?: string };
};

const business = ref<SupportBusiness>('EXPRESS');
const channel = ref<SupportChannel>('ai');
const orderId = ref('');
const orderNo = ref('');
const orderStatus = ref('');
const sessionId = ref('');
const agentStatus = ref<'online' | 'offline'>('online');
const messages = ref<Msg[]>([]);
const draft = ref('');
const loading = ref(false);
const sending = ref(false);

const bizTitle = computed(() => {
  const hit = SUPPORT_BUSINESSES.find((b) => b.type === business.value);
  return hit ? t(hit.titleKey) : t('support.chatTitle');
});

const statusLabel = computed(() =>
  channel.value === 'ai'
    ? t('support.ai')
    : agentStatus.value === 'online'
      ? t('support.online')
      : t('support.offline'),
);

function goBack(): void {
  backOrHome();
}

async function bootstrap(): Promise<void> {
  if (!requireUserSession()) return;
  loading.value = true;
  try {
    const session = await userApi.createSupportSession({
      businessType: business.value,
      channel: channel.value,
      orderId: orderId.value || undefined,
      orderNo: orderNo.value || undefined,
      orderStatus: orderStatus.value || undefined,
    });
    sessionId.value = session.sessionId;
    channel.value = session.channel;
    agentStatus.value = session.agentStatus;
    messages.value = session.messages;
  } catch (cause: unknown) {
    // Local/test fallback when API/DB unavailable
    const now = new Date().toISOString();
    sessionId.value = `local-${Date.now()}`;
    agentStatus.value = channel.value === 'human' ? 'offline' : 'online';
    messages.value = [
      {
        id: `m-${Date.now()}`,
        role: channel.value === 'ai' ? 'assistant' : 'agent',
        content:
          channel.value === 'ai'
            ? t('support.ai')
            : t('support.offline'),
        createdAt: now,
      },
    ];
    if (orderId.value && orderNo.value) {
      messages.value.push({
        id: `m-${Date.now()}-card`,
        role: 'system',
        content: t('support.orderCard'),
        createdAt: now,
        orderCard: { orderId: orderId.value, orderNo: orderNo.value, status: orderStatus.value },
      });
    }
    messages.value.push({
      id: `m-${Date.now()}-2`,
      role: 'system',
      content: `${business.value} · ${errorMessage(cause)}`,
      createdAt: now,
    });
  } finally {
    loading.value = false;
  }
}

async function send(): Promise<void> {
  const content = draft.value.trim();
  if (!content || !sessionId.value || sending.value) return;
  sending.value = true;
  try {
    if (sessionId.value.startsWith('local-')) {
      const now = new Date().toISOString();
      messages.value = [
        ...messages.value,
        { id: `u-${Date.now()}`, role: 'user', content, createdAt: now },
        {
          id: `a-${Date.now()}`,
          role: channel.value === 'ai' ? 'assistant' : 'agent',
          content: channel.value === 'ai'
            ? `${t('support.ai')}: ${content.slice(0, 80)}`
            : t('support.offline'),
          createdAt: now,
        },
      ];
      draft.value = '';
      return;
    }
    const session = await userApi.sendSupportMessage(sessionId.value, content);
    messages.value = session.messages;
    draft.value = '';
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    sending.value = false;
  }
}

async function transfer(): Promise<void> {
  if (!sessionId.value) return;
  try {
    if (sessionId.value.startsWith('local-')) {
      channel.value = 'human';
      agentStatus.value = 'offline';
      messages.value = [
        ...messages.value,
        {
          id: `s-${Date.now()}`,
          role: 'system',
          content: t('support.transfer'),
          createdAt: new Date().toISOString(),
        },
      ];
      return;
    }
    const session = await userApi.transferSupport(sessionId.value);
    channel.value = session.channel;
    agentStatus.value = session.agentStatus;
    messages.value = session.messages;
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  }
}

onLoad((params) => {
  const biz = String(params?.business || 'EXPRESS').toUpperCase() as SupportBusiness;
  const ch = String(params?.channel || 'ai').toLowerCase() as SupportChannel;
  if (['EXPRESS', 'ERRAND', 'RIDE', 'HOTEL'].includes(biz)) business.value = biz;
  if (ch === 'ai' || ch === 'human') channel.value = ch;
  orderId.value = typeof params?.orderId === 'string' ? params.orderId : '';
  orderNo.value = typeof params?.orderNo === 'string' ? params.orderNo : '';
  orderStatus.value = typeof params?.orderStatus === 'string' ? params.orderStatus : '';
  void bootstrap();
});

function openOrder(id: string): void {
  uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(id)}` });
}
</script>

<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <view class="titles">
        <text class="title">{{ t('support.chatTitle') }}</text>
        <text class="sub">{{ bizTitle }} · {{ statusLabel }}</text>
      </view>
      <text
        v-if="channel === 'ai'"
        class="transfer"
        @tap="transfer"
      >{{ t('support.transfer') }}</text>
      <text v-else class="ph" />
    </view>

    <scroll-view scroll-y class="thread" :scroll-into-view="messages.length ? `m-${messages[messages.length - 1].id}` : ''">
      <view v-if="loading" class="empty">…</view>
      <view
        v-for="m in messages"
        :id="`m-${m.id}`"
        :key="m.id"
        class="bubble-row"
        :class="{ me: m.role === 'user' }"
      >
        <view v-if="m.orderCard" class="order-card" @tap="openOrder(m.orderCard.orderId)">
          <text class="order-card-kicker">{{ t('support.orderCard') }}</text>
          <text class="order-card-no">{{ m.orderCard.orderNo }}</text>
          <text class="order-card-go">{{ t('support.viewOrder') }} ›</text>
        </view>
        <view v-else class="bubble" :class="m.role">{{ m.content }}</view>
      </view>
    </scroll-view>

    <view class="composer">
      <input
        v-model="draft"
        class="input"
        :placeholder="t('support.inputPh')"
        confirm-type="send"
        @confirm="send"
      />
      <view class="send" :class="{ disabled: sending }" @tap="send">{{ t('support.send') }}</view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--km-bg);
}
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 70px 16px 12px;
  background: var(--km-surface, #fff);
  border-bottom: 1px solid var(--km-divider, var(--km-border));
}
.back { width: 28px; font-size: 28px; line-height: 1; }
.titles { flex: 1; min-width: 0; }
.title { display: block; font-size: 16px; font-weight: 800; color: var(--km-text, var(--km-text)); }
.sub { display: block; margin-top: 2px; font-size: 12px; color: var(--km-text-muted, var(--km-text-secondary)); }
.transfer {
  font-size: 13px;
  font-weight: 700;
  color: var(--km-primary, #2563eb);
  padding: 6px 8px;
}
.ph { width: 48px; }
.thread {
  flex: 1;
  height: 0;
  padding: 16px;
  box-sizing: border-box;
}
.bubble-row { display: flex; margin-bottom: 12px; }
.bubble-row.me { justify-content: flex-end; }
.bubble {
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.45;
  background: var(--km-surface, #fff);
  color: var(--km-text, var(--km-text));
  border: 1px solid var(--km-divider, var(--km-border));
}
.bubble.user {
  background: var(--km-primary, #2563eb);
  color: #fff;
  border-color: transparent;
}
.bubble.system {
  background: transparent;
  border: none;
  color: var(--km-text-muted, var(--km-text-muted));
  font-size: 12px;
  text-align: center;
  max-width: 100%;
  width: 100%;
}
.order-card {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--km-surface);
  border: 1px solid var(--km-border);
  text-align: left;
}
.order-card-kicker { display: block; font-size: 11px; color: var(--km-text-muted); }
.order-card-no { display: block; margin-top: 4px; font-size: 15px; font-weight: 700; color: var(--km-text); }
.order-card-go { display: block; margin-top: 6px; font-size: 12px; color: var(--km-primary); }
.composer {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  background: var(--km-surface, #fff);
  border-top: 1px solid var(--km-divider, var(--km-border));
}
.input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  background: var(--km-bg);
  font-size: 14px;
  color: var(--km-text, var(--km-text));
}
.send {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--km-primary, #2563eb);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
.send.disabled { opacity: 0.6; }
.empty { text-align: center; color: var(--km-text-muted, var(--km-text-muted)); padding: 24px; }
</style>
