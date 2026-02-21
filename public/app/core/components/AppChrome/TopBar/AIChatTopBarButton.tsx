import { memo } from 'react';

import { t } from '@grafana/i18n';
import { getAppEvents } from '@grafana/runtime';
import { Dropdown, ToolbarButton } from '@grafana/ui';
import { OpenExtensionSidebarEvent } from 'app/types/events';

import {
  useExtensionSidebarContext,
  getComponentIdFromComponentMeta,
  getInteractiveLearningPluginId,
} from '../ExtensionSidebar/ExtensionSidebarProvider';

import { TopNavBarMenu } from './TopNavBarMenu';
import { useHelpNode } from './useHelpNode';

interface Props {
  isSmallScreen: boolean;
}

export const AIChatTopBarButton = memo(function AIChatTopBarButton({ isSmallScreen }: Props) {
  const enrichedHelpNode = useHelpNode();
  const { setDockedComponentId, dockedComponentId, availableComponents } = useExtensionSidebarContext();

  if (!enrichedHelpNode) {
    return null;
  }

  const interactiveLearningPluginId = getInteractiveLearningPluginId(availableComponents);

  if (isSmallScreen || !enrichedHelpNode.hideFromTabs || interactiveLearningPluginId === undefined) {
    return (
      // <Dropdown overlay={() => <TopNavBarMenu node={enrichedHelpNode} />} placement="bottom-end">
      <ToolbarButton
        iconOnly
        icon="ai-sparkle"
        aria-label={t('navigation.help.aria-label', 'AI Chat')}
        tooltip={t('navigation.help.tooltip', 'A DEEP AGENT that can answer questions about database and k8s clusters, and help you write queries and troubleshoot issues.')}
      />
      // </Dropdown>
    );
  }

  const componentId = getComponentIdFromComponentMeta(interactiveLearningPluginId, 'Interactive learning');
  const isOpen = dockedComponentId === componentId;

  return (
    <ToolbarButton
      iconOnly
      icon="ai-sparkle"
      aria-label={t('navigation.help.aria-label', 'Help')}
      variant={isOpen ? 'active' : 'default'}
      tooltip={
        isOpen
          ? t(
            'navigation.help.interactive-learning.close-tooltip',
            'Close interactive learning, help, and documentation'
          )
          : t('navigation.help.interactive-learning.open-tooltip', 'Open interactive learning, help, and documentation')
      }
      onClick={() => {
        if (isOpen) {
          setDockedComponentId(undefined);
        } else {
          const appEvents = getAppEvents();
          appEvents.publish(
            new OpenExtensionSidebarEvent({
              pluginId: interactiveLearningPluginId,
              componentTitle: 'Interactive learning',
            })
          );
        }
      }}
    />
  );
});
