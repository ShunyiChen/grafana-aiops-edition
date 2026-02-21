import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Icon, IconButton } from '@grafana/ui';
import { useGrafana } from 'app/core/context/GrafanaContext';

export const AIChatWindow = () => {
    const styles = useStyles2(getStyles);
    const { chrome } = useGrafana();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Icon name="ai-sparkle" size="lg" className={styles.headerIcon} />
                    <span>AI Chat</span>
                </div>
                <div className={styles.headerActions}>
                    <IconButton name="plus" onClick={() =>{}} tooltip="New Conversation" aria-label="New Conversation" />
                    <IconButton name="history" onClick={() =>{}} tooltip="Past Conversation" aria-label="Past Conversation" />
                    <IconButton name="times" onClick={() => chrome.setAIChatOpen(false)} aria-label="Close" />
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.placeholder}>
                    <Icon name="comment-alt" size="xxl" />
                    <p>How can I help you today?</p>
                </div>
            </div>
            <div className={styles.footer}>
                <input type="text" className={styles.input} placeholder="Type your message..." />
                <IconButton name="message" variant="primary" aria-label="Send message" />
            </div>
        </div>
    );
};

const getStyles = (theme: GrafanaTheme2) => ({
    container: css({
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: theme.colors.background.primary,
        borderLeft: `1px solid ${theme.colors.border.weak}`,
        boxShadow: theme.shadows.z3,
    }),
    header: css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 16px',
        borderBottom: `1px solid ${theme.colors.border.weak}`,
    }),
    headerActions: css({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    }),
    headerTitle: css({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        fontSize: theme.typography.h4.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
    }),
    headerIcon: css({
        color: theme.colors.secondary.main,
    }),
    content: css({
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing(2),
    }),
    placeholder: css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colors.text.disabled,
        gap: theme.spacing(2),
    }),
    footer: css({
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.colors.border.weak}`,
        display: 'flex',
        gap: theme.spacing(1),
    }),
    input: css({
        flex: 1,
        padding: theme.spacing(0.5, 1),
        borderRadius: theme.shape.borderRadius(),
        border: `1px solid ${theme.colors.border.weak}`,
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
        '&:focus': {
            outline: 'none',
            borderColor: theme.colors.primary.main,
        },
    }),
});
