import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchTransactions } from '../data/transactionsApi'
import type { CardState, Transaction } from '../types/transaction'
import { CardContext, type CardContextValue } from './cardContextInstance'

const TRANSACTIONS_CACHE_KEY = 'transit-pass-demo:transactions-cache'
const HOLDER_ALIAS = '通勤用'

function readCache(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_CACHE_KEY)
    return raw ? (JSON.parse(raw) as Transaction[]) : null
  } catch {
    return null
  }
}

function writeCache(transactions: Transaction[]) {
  try {
    localStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(transactions))
  } catch {
    // localStorageが使用できない環境でもアプリの動作は継続する
  }
}

/** occurredAt降順（新しい順）に並べ替える */
function sortByOccurredAtDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
}

function toBalanceState(transactions: Transaction[]): Pick<CardState, 'balance' | 'lastUpdatedAt'> {
  const latest = transactions[0]
  return latest
    ? { balance: latest.balanceAfter, lastUpdatedAt: latest.occurredAt }
    : { balance: 0, lastUpdatedAt: new Date().toISOString() }
}

export function CardProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => readCache() ?? [])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const fresh = sortByOccurredAtDesc(await fetchTransactions())
      setTransactions(fresh)
      writeCache(fresh)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '取引データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // マウント時にネットワークから取引データを取得する（React Query等は未導入のため素のuseEffectで実装）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const refreshBalance = useCallback(() => {
    setIsRefreshing(true)
    load().finally(() => setIsRefreshing(false))
  }, [load])

  const value = useMemo<CardContextValue>(
    () => ({
      ...toBalanceState(transactions),
      holderAlias: HOLDER_ALIAS,
      transactions,
      isLoading,
      error,
      isRefreshing,
      refreshBalance,
    }),
    [transactions, isLoading, error, isRefreshing, refreshBalance],
  )

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}
