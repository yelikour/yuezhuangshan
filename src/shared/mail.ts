import { ALL_MAILS, type MailItem } from '@data/mail';
import type { GameState } from './state';

/** 首页可预览初始邮件数量，但不据此解锁邮箱或后续节点。 */
export function visibleMails(state: GameState, previewWelcome = false): MailItem[] {
  return ALL_MAILS
    .filter((mail) => state.unlockedNodes.includes(mail.requireNode ?? 'P01') ||
      (previewWelcome && (mail.requireNode ?? 'P01') === 'P01'))
    .filter((mail) => !mail.requireClue || state.discoveredClues.includes(mail.requireClue))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function unreadMailCount(state: GameState, folder: 'inbox' | 'spam', previewWelcome = false): number {
  return visibleMails(state, previewWelcome).filter((mail) =>
    (mail.folder ?? 'inbox') === folder && !state.readMails.includes(mail.id),
  ).length;
}
