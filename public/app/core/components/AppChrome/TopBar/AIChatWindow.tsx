import { css } from '@emotion/css';
import { useState, useRef, useEffect } from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Icon, IconButton, TextArea } from '@grafana/ui';
import { useGrafana } from 'app/core/context/GrafanaContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AIChatWindow = () => {
    const styles = useStyles2(getStyles);
    const { chrome } = useGrafana();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) {
            return;
        }

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const currentMessages = [...messages, userMessage];
        // Add an empty assistant message to be filled
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        try {
            // Replace with your actual FastAPI endpoint
            const response = await fetch('http://localhost:8000/api/v1/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: currentMessages,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch from AI API: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            let assistantContent = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) {
                        continue;
                    }

                    let contentChunk = '';
                    if (trimmedLine.startsWith('data: ')) {
                        const data = trimmedLine.slice(6);
                        if (data === '[DONE]') {
                            break;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            // Adjust based on your FastAPI response schema
                            contentChunk = parsed.content || parsed.message?.content || parsed.choices?.[0]?.delta?.content || (typeof parsed === 'string' ? parsed : '');
                        } catch (e) {
                            contentChunk = data;
                        }
                    } else {
                        // Raw text chunk handling
                        contentChunk = line;
                    }

                    if (contentChunk) {
                        assistantContent += contentChunk;
                        setMessages((prev) => {
                            const next = [...prev];
                            if (next.length > 0) {
                                next[next.length - 1] = {
                                    role: 'assistant',
                                    content: assistantContent,
                                };
                            }
                            return next;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages((prev) => {
                const next = [...prev];
                if (next.length > 0) {
                    next[next.length - 1] = {
                        role: 'assistant',
                        content: 'Error: Could not connect to the AI service. Please check if your FastAPI server is running.',
                    };
                }
                return next;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewConversation = () => {
        setMessages([]);
        setInput('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Icon name="ai-sparkle" size="lg" className={styles.headerIcon} />
                    <span>AI Chat</span>
                </div>
                <div className={styles.headerActions}>
                    <IconButton name="plus" onClick={handleNewConversation} tooltip="New Conversation" aria-label="New Conversation" />
                    <IconButton name="history" onClick={() => { }} tooltip="Past Conversation" aria-label="Past Conversation" />
                    <IconButton name="times" onClick={() => chrome.setAIChatOpen(false)} aria-label="Close" />
                </div>
            </div>
            <div className={styles.content} ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className={styles.placeholder}>
                        <Icon name="comment-alt" size="xxl" />
                        <p>How can I help you today?</p>
                    </div>
                ) : (
                    <div className={styles.messageList}>
                        {messages.map((m, i) => (
                            <div key={i} className={m.role === 'user' ? styles.userMessage : styles.assistantMessage}>
                                <div className={styles.messageContent}>{m.content}</div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1].content === '' && (
                            <div className={styles.assistantMessage}>
                                <div className={styles.messageContent}>...</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.footer}>
                <TextArea
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    rows={1}
                    autoFocus
                />
                <IconButton
                    name="message"
                    variant="primary"
                    aria-label="Send message"
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                />
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
        // border: 'none',
        outline: 'none',
        boxShadow: 'none',
        '&:focus': {
            outline: 'none',
            // border: 'none',
            boxShadow: 'none',
        },
        '&:hover': {
            // border: 'none',
        },
    }),
    messageList: css({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    }),
    userMessage: css({
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.background.canvas,
        color: theme.colors.text.primary,
        padding: theme.spacing(1, 1.5),
        borderRadius: theme.shape.borderRadius(2),
        maxWidth: '85%',
        border: `1px solid ${theme.colors.border.weak}`,
    }),
    assistantMessage: css({
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
        padding: theme.spacing(1, 1.5),
        borderRadius: theme.shape.borderRadius(2),
        maxWidth: '85%',
        border: `1px solid ${theme.colors.border.weak}`,
    }),
    messageContent: css({
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    }),
});
