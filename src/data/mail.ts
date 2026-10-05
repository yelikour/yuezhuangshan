/** 邮件到达条件集中管理；正文仍来自 content.ts。 */
import { MAIL } from './content';
import { CLUE } from './clues';
import type { NodeId } from '@shared/state';

export interface MailItem {
  id: string;
  from: string;
  to?: string;
  subject: string;
  date: string;
  body: string;
  key?: string;
  requireNode?: NodeId;
  requireClue?: string;
  folder?: 'inbox' | 'spam';
}

export const ALL_MAILS: MailItem[] = [
  { id: 'awardNotice', ...MAIL.awardNotice, requireNode: 'P01' },
  { id: 'bankStatement', ...MAIL.bankStatement, requireNode: 'P01' },
  { id: 'preInvite', ...MAIL.preInvite, requireNode: 'P01' },
  { id: 'invite', ...MAIL.invite, key: CLUE.INVITE, requireNode: 'P01' },
  { id: 'schedule', ...MAIL.schedule, requireNode: 'P01' },
  { id: 'checkin', ...MAIL.checkin, key: CLUE.CREDENTIAL_HINT, requireNode: 'P01' },
  { id: 'hotelConfirm', ...MAIL.hotelConfirm, requireNode: 'P01' },
  { id: 'peerAuthor', ...MAIL.peerAuthor, requireNode: 'P02' },
  { id: 'shenranWarn', ...MAIL.shenranWarn, requireNode: 'P04' },
  { id: 'zhouYanLetter', ...MAIL.zhouYanLetter, key: CLUE.ZHOU_FAMILY, requireClue: CLUE.FORUM_ARCHIVE },
  { id: 'spam', ...MAIL.spam, folder: 'spam', requireNode: 'P01' },
  { id: 'spamGame', ...MAIL.spamGame, folder: 'spam', requireNode: 'P01' },
  { id: 'spamCoupon', ...MAIL.spamCoupon, folder: 'spam', requireNode: 'P01' },
  { id: 'luYanSpam1', ...MAIL.luYanSpam1, key: CLUE.LUYUAN_INTERCEPT, folder: 'spam', requireNode: 'P04' },
  { id: 'luYanSpam2', ...MAIL.luYanSpam2, key: CLUE.LUYUAN_SILENCED, folder: 'spam', requireNode: 'P06' },
];
