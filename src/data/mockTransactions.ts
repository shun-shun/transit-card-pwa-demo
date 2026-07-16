import type { Transaction } from '../types/transaction'

/**
 * 学習用のローカルモックデータ。実在の駅・店舗・鉄道会社とは一切関係ない。
 *
 * 現在アプリ本体はGAS Web App経由でネットワークから取引データを取得するため、
 * このファイルはランタイムでは使用していない。GAS側スプレッドシートの初期シードデータの
 * 参照用として残してある（docs/gas-backend-setup.md 参照）。
 *
 * 時系列順（古い→新しい）に記録し、balanceAfter は直前残高からの積み上げで
 * 矛盾なく計算してある。
 *
 * 「バスセンター駅」⇔「菊水駅」の通勤利用（平日 2026-06-29〜2026-07-15）を想定し、
 * 行き（8:00〜8:30）・帰り（19:00〜20:30）にランダムな時刻で片道210円ずつ発生させている。
 */
const chronological: Transaction[] = [
  {
    id: 'txn-001',
    type: 'charge',
    occurredAt: '2026-06-29T07:50:00+09:00',
    title: 'チャージ（デモ入金）',
    amount: 4000,
    balanceAfter: 4000,
  },
  {
    id: 'txn-002',
    type: 'train',
    occurredAt: '2026-06-29T08:07:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 3790,
  },
  {
    id: 'txn-003',
    type: 'train',
    occurredAt: '2026-06-29T19:35:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 3580,
  },
  {
    id: 'txn-004',
    type: 'train',
    occurredAt: '2026-06-30T08:12:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 3370,
  },
  {
    id: 'txn-005',
    type: 'train',
    occurredAt: '2026-06-30T20:10:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 3160,
  },
  {
    id: 'txn-006',
    type: 'train',
    occurredAt: '2026-07-01T08:03:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 2950,
  },
  {
    id: 'txn-007',
    type: 'train',
    occurredAt: '2026-07-01T19:48:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 2740,
  },
  {
    id: 'txn-008',
    type: 'train',
    occurredAt: '2026-07-02T08:22:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 2530,
  },
  {
    id: 'txn-009',
    type: 'train',
    occurredAt: '2026-07-02T19:22:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 2320,
  },
  {
    id: 'txn-010',
    type: 'train',
    occurredAt: '2026-07-03T08:15:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 2110,
  },
  {
    id: 'txn-011',
    type: 'train',
    occurredAt: '2026-07-03T20:05:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 1900,
  },
  {
    id: 'txn-012',
    type: 'train',
    occurredAt: '2026-07-06T08:09:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 1690,
  },
  {
    id: 'txn-013',
    type: 'train',
    occurredAt: '2026-07-06T19:58:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 1480,
  },
  {
    id: 'txn-014',
    type: 'train',
    occurredAt: '2026-07-07T08:26:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 1270,
  },
  {
    id: 'txn-015',
    type: 'train',
    occurredAt: '2026-07-07T19:15:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 1060,
  },
  {
    id: 'txn-016',
    type: 'charge',
    occurredAt: '2026-07-08T07:50:00+09:00',
    title: 'チャージ（デモ入金）',
    amount: 3000,
    balanceAfter: 4060,
  },
  {
    id: 'txn-017',
    type: 'train',
    occurredAt: '2026-07-08T08:04:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 3850,
  },
  {
    id: 'txn-018',
    type: 'train',
    occurredAt: '2026-07-08T20:22:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 3640,
  },
  {
    id: 'txn-019',
    type: 'train',
    occurredAt: '2026-07-09T08:18:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 3430,
  },
  {
    id: 'txn-020',
    type: 'train',
    occurredAt: '2026-07-09T19:40:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 3220,
  },
  {
    id: 'txn-021',
    type: 'train',
    occurredAt: '2026-07-10T08:11:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 3010,
  },
  {
    id: 'txn-022',
    type: 'train',
    occurredAt: '2026-07-10T19:52:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 2800,
  },
  {
    id: 'txn-023',
    type: 'train',
    occurredAt: '2026-07-13T08:29:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 2590,
  },
  {
    id: 'txn-024',
    type: 'train',
    occurredAt: '2026-07-13T20:15:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 2380,
  },
  {
    id: 'txn-025',
    type: 'train',
    occurredAt: '2026-07-14T08:06:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 2170,
  },
  {
    id: 'txn-026',
    type: 'train',
    occurredAt: '2026-07-14T19:28:00+09:00',
    title: '菊水駅 → バスセンター駅',
    amount: -210,
    balanceAfter: 1960,
  },
  {
    id: 'txn-027',
    type: 'train',
    occurredAt: '2026-07-15T08:14:00+09:00',
    title: 'バスセンター駅 → 菊水駅',
    amount: -210,
    balanceAfter: 1750,
  },
]

/** 新しい順（画面表示用の既定順） */
export const mockTransactions: Transaction[] = [...chronological].reverse()
