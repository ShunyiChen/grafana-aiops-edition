import { memo } from 'react';
import { t } from '@grafana/i18n';
import { ToolbarButton } from '@grafana/ui';
import { useGrafana } from 'app/core/context/GrafanaContext';

interface Props {
  isSmallScreen: boolean;
}

export const AIChatTopBarButton = memo(function AIChatTopBarButton({ isSmallScreen }: Props) {
  const { chrome } = useGrafana();
  const state = chrome.useState();
  const isOpen = state.aiChatOpen;

  return (
    <ToolbarButton
      iconOnly
      icon="ai-sparkle"
      aria-label={t('navigation.help.aria-label', 'AI Chat')}
      variant={isOpen ? 'active' : 'default'}
      tooltip={
        isOpen
          ? t('navigation.help.interactive-learning.close-tooltip', 'Close AI Chat')
          : t('navigation.help.interactive-learning.open-tooltip', 'Open AI Chat')
      }
      onClick={() => {
        chrome.toggleAIChat();
      }}
    />
  );
});
