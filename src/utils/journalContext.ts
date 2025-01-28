import { getJournalEntries } from './journal';

export async function getJournalContext() {
  const entries = await getJournalEntries();
  return entries
    .map(entry => `[${new Date(entry.timestamp).toLocaleDateString()}] ${entry.content}`)
    .join('\n\n');
}