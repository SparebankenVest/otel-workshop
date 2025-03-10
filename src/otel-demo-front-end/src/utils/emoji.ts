import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const emojis: string[] = ['😊', '😂', '😍', '😎', '🤔', '😜', '😇', '🤩', '🥳', '😴'];

const logger = logs.getLogger('otel.workshop.client');


export function createFloatingEmoji(): string {
  const emoji = document.createElement('div');
  emoji.classList.add('emoji');
  emoji.textContent = getRandomEmoji();
  logger.emit({
    body: `emoji: ${emoji.textContent}`,
    severityNumber: SeverityNumber.INFO,
  });
  document.body.appendChild(emoji);

  setTimeout(() => {
    document.body.removeChild(emoji);
  }, 20000); // 20s duration of the animation

  return emoji.textContent;
}

export function getRandomEmoji(): string {
  const randomIndex = Math.floor(Math.random() * emojis.length);

  return emojis[randomIndex];
}