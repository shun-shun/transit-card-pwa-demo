import { createContext } from 'react'
import type { CardState, Transaction } from '../types/transaction'

export interface CardContextValue extends CardState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  isRefreshing: boolean
  refreshBalance: () => void
}

export const CardContext = createContext<CardContextValue | undefined>(undefined)
