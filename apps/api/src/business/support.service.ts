import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type SupportBusiness = 'EXPRESS' | 'ERRAND' | 'RIDE' | 'HOTEL';
export type SupportChannel = 'ai' | 'human';
export type AgentStatus = 'online' | 'offline';

export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  createdAt: string;
  /** Structured order card payload for client rendering */
  orderCard?: { orderId: string; orderNo: string; status?: string };
}

export interface SupportSession {
  sessionId: string;
  userId: string;
  businessType: SupportBusiness;
  channel: SupportChannel;
  agentStatus: AgentStatus;
  messages: SupportMessage[];
  orderId?: string;
  isMock: true;
  createdAt: string;
  updatedAt: string;
}

export interface SupportQrConfig {
  id: 'wechat' | 'telegram' | 'whatsapp';
  label: string;
  imageUrl: string;
}

@Injectable()
export class SupportService {
  private readonly sessions = new Map<string, SupportSession>();
  private humanOnline = true;
  private qrItems: SupportQrConfig[] = [
    { id: 'wechat', label: '微信', imageUrl: 'https://via.placeholder.com/160x160.png?text=WeChat' },
    { id: 'telegram', label: 'Telegram', imageUrl: 'https://via.placeholder.com/160x160.png?text=Telegram' },
    { id: 'whatsapp', label: 'WhatsApp', imageUrl: 'https://via.placeholder.com/160x160.png?text=WhatsApp' },
  ];

  getConfig() {
    return {
      qrItems: this.qrItems,
      humanOnline: this.humanOnline,
      businesses: ['EXPRESS', 'ERRAND', 'RIDE', 'HOTEL'] as SupportBusiness[],
    };
  }

  updateConfig(input: { qrItems?: SupportQrConfig[]; humanOnline?: boolean }) {
    if (input.qrItems) this.qrItems = input.qrItems;
    if (typeof input.humanOnline === 'boolean') this.humanOnline = input.humanOnline;
    return this.getConfig();
  }

  createSession(
    userId: string,
    businessType: SupportBusiness,
    channel: SupportChannel,
    order?: { orderId?: string; orderNo?: string; orderStatus?: string },
  ): SupportSession {
    const now = new Date().toISOString();
    const sessionId = randomUUID();
    const agentStatus: AgentStatus = channel === 'human' ? (this.humanOnline ? 'online' : 'offline') : 'online';
    const hello =
      channel === 'ai'
        ? '您好，我是 AI 客服。请描述您的问题，必要时可为您转接人工。'
        : agentStatus === 'online'
          ? '您好，已为您接入人工客服通道。'
          : '当前人工客服离线，留言后我们会尽快回复。';

    const messages: SupportMessage[] = [
      {
        id: randomUUID(),
        role: channel === 'ai' ? 'assistant' : 'agent',
        content: hello,
        createdAt: now,
      },
    ];
    if (order?.orderId && order.orderNo) {
      messages.push({
        id: randomUUID(),
        role: 'system',
        content: `关联订单 ${order.orderNo}`,
        createdAt: now,
        orderCard: {
          orderId: order.orderId,
          orderNo: order.orderNo,
          status: order.orderStatus,
        },
      });
    }

    const session: SupportSession = {
      sessionId,
      userId,
      businessType,
      channel,
      agentStatus,
      isMock: true,
      orderId: order?.orderId,
      createdAt: now,
      updatedAt: now,
      messages,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string, userId?: string): SupportSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new NotFoundException('会话不存在');
    if (userId && session.userId !== userId) throw new NotFoundException('会话不存在');
    return session;
  }

  listByBusiness(businessType?: SupportBusiness) {
    const all = [...this.sessions.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return businessType ? all.filter((s) => s.businessType === businessType) : all;
  }

  addMessage(sessionId: string, userId: string, content: string): SupportSession {
    const session = this.getSession(sessionId, userId);
    const now = new Date().toISOString();
    session.messages.push({ id: randomUUID(), role: 'user', content, createdAt: now });

    if (session.channel === 'ai') {
      session.messages.push({
        id: randomUUID(),
        role: 'assistant',
        content: `已收到（${session.businessType}）：${content.slice(0, 80)}。如需人工协助，请点击「转人工」。`,
        createdAt: new Date().toISOString(),
      });
    } else if (session.agentStatus === 'offline') {
      session.messages.push({
        id: randomUUID(),
        role: 'system',
        content: '留言已记录，客服上线后会回复您。',
        createdAt: new Date().toISOString(),
      });
    } else {
      session.messages.push({
        id: randomUUID(),
        role: 'agent',
        content: '人工客服已收到，稍候为您处理。',
        createdAt: new Date().toISOString(),
      });
    }
    session.updatedAt = new Date().toISOString();
    return session;
  }

  transferToHuman(sessionId: string, userId: string): SupportSession {
    const session = this.getSession(sessionId, userId);
    session.channel = 'human';
    session.agentStatus = this.humanOnline ? 'online' : 'offline';
    session.messages.push({
      id: randomUUID(),
      role: 'system',
      content: session.agentStatus === 'online' ? '已转接人工客服' : '已申请转人工，当前客服离线，请留言',
      createdAt: new Date().toISOString(),
    });
    session.updatedAt = new Date().toISOString();
    return session;
  }

  clearMockSessions(): { cleared: number } {
    const before = this.sessions.size;
    this.sessions.clear();
    return { cleared: before };
  }
}
