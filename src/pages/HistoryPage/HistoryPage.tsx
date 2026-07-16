import { AppLayout } from '../../components/AppLayout/AppLayout'
import { BalanceDisplay } from '../../components/BalanceDisplay/BalanceDisplay'
import { TransactionList } from '../../components/TransactionList/TransactionList'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { useCard } from '../../hooks/useCard'
import styles from './HistoryPage.module.css'

export function HistoryPage() {
  const { balance, transactions, isLoading, error } = useCard()

  return (
    <AppLayout>
      <section className={styles.balanceSection} aria-label="現在残高">
        <BalanceDisplay balance={balance} compact />
      </section>
      {error ? (
        <EmptyState title="取引データを取得できませんでした" description={error} variant="error" />
      ) : isLoading && transactions.length === 0 ? (
        <EmptyState title="読み込み中..." description="取引データを取得しています。" />
      ) : (
        <TransactionList transactions={transactions} emptyMessage="利用履歴はまだありません。" />
      )}
    </AppLayout>
  )
}
