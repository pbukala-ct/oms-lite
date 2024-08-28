import { formatDistanceToNow, parseISO } from 'date-fns';

export const getProcessingTime = (timestamp) => {
  if (!timestamp) return { text: 'N/A', status: 'normal' };

  const date = parseISO(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  let text = formatDistanceToNow(date, { addSuffix: true });
  let status = 'normal';

  if (diffInHours > 8) {
    status = 'critical';
  } else if (diffInHours > 2) {
    status = 'warning';
  }

  return { text, status };
};