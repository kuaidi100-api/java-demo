import { computed } from 'vue';
import { locale, t } from '../i18n';

export function useUserTabs() {
  return computed(() => {
    void locale.value;
    return [
      { key: 'home', label: t('tab.home'), icon: 'home' },
      { key: 'tracking', label: t('tab.tracking'), icon: 'search' },
      { key: 'flash', label: t('tab.flash'), icon: 'zap' },
      { key: 'orders', label: t('tab.orders'), icon: 'package' },
      { key: 'profile', label: t('tab.profile'), icon: 'user' },
    ];
  });
}
