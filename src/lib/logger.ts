// Logger utilitário centralizado
// Só loga em desenvolvimento, mas pode ser expandido para produção com integração externa

const isDev = import.meta.env.MODE === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    // Sempre loga erro em dev, e pode ser expandido para enviar para Sentry/Datadog em prod
    if (isDev) console.error('[ERROR]', ...args);
    // Exemplo de integração futura:
    // if (!isDev) Sentry.captureException(args[0]);
  },
}; 