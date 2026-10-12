import { useState, useEffect } from 'react';
import { walletService, WalletTransaction } from '../services/walletService';

export function useWallet() {
  const [balance, setBalance] = useState<number>(walletService.getBalance());
  const [transactions, setTransactions] = useState<WalletTransaction[]>(walletService.getTransactions());

  useEffect(() => {
    // Initial sync
    setBalance(walletService.getBalance());
    setTransactions(walletService.getTransactions());

    // Subscribe to state updates
    const unsubscribe = walletService.subscribe(() => {
      setBalance(walletService.getBalance());
      setTransactions(walletService.getTransactions());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    balance,
    transactions,
    deductForBooking: walletService.deductForBooking.bind(walletService),
    refundBooking: walletService.refundBooking.bind(walletService),
    addMoney: walletService.addMoney.bind(walletService),
    refreshWallet: walletService.syncFromBackend.bind(walletService)
  };
}
