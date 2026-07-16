import type { Transaction } from '../types/transaction'

interface TransactionsResponse {
  transactions?: Transaction[]
  error?: string
}

/**
 * GAS Web App から取引データを取得する。
 * 認証は共有シークレットをクエリパラメータで渡す方式（GAS Web Appはブラウザから
 * 直接fetchするためGoogleアカウント認証を使えないので、簡易トークンで代替している）。
 */
export async function fetchTransactions(): Promise<Transaction[]> {
  const endpoint = import.meta.env.VITE_GAS_ENDPOINT_URL
  const token = import.meta.env.VITE_GAS_SHARED_SECRET

  if (!endpoint || !token) {
    throw new Error(
      'GASのエンドポイントURL・共有トークンが未設定です（.env.local を確認してください）',
    )
  }

  const url = `${endpoint}?token=${encodeURIComponent(token)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`取引データの取得に失敗しました（HTTP ${response.status}）`)
  }

  const body = (await response.json()) as TransactionsResponse

  if (body.error) {
    throw new Error(`取引データの取得に失敗しました（${body.error}）`)
  }
  if (!body.transactions) {
    throw new Error('取引データの形式が不正です')
  }

  return body.transactions
}
