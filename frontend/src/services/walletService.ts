/**
 * EVORA Reactive Wallet Service.
 * Synchronizes wallet balance and transactions across Header, BookingsPage, and WalletPage
 * backed by persistent SQLite backend APIs and localStorage caching.
 */

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'Completed' | 'Pending' | 'Failed';
  reference_id?: string | null;
}

export interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
}

const WALLET_BALANCE_KEY = 'evora_wallet_balance';
const WALLET_TXS_KEY = 'evora_wallet_transactions';
const WALLET_EVENT = 'evora_wallet_update';
const BASE_URL = 'http://localhost:8000/api';

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-9012',
    date: '30 Sep 2026, 19:30',
    description: 'Tata Power EZ Charge - Phoenix Marketcity, Pune',
    amount: 447.70,
    type: 'debit',
    status: 'Completed',
    reference_id: 'BK-2026-0901'
  },
  {
    id: 'TX-8991',
    date: '28 Sep 2026, 11:20',
    description: 'Wallet Top-up via HDFC Bank UPI (Demo)',
    amount: 1000.00,
    type: 'credit',
    status: 'Completed'
  },
  {
    id: 'TX-8920',
    date: '26 Sep 2026, 14:15',
    description: 'Zeon Charging - Mumbai-Pune Expressway (Urse)',
    amount: 641.25,
    type: 'debit',
    status: 'Completed'
  },
  {
    id: 'TX-8854',
    date: '20 Sep 2026, 18:40',
    description: 'Jio-bp pulse - Baner High Street, Pune',
    amount: 382.20,
    type: 'debit',
    status: 'Completed'
  },
  {
    id: 'TX-8790',
    date: '15 Sep 2026, 10:00',
    description: 'Wallet Top-up via ICICI RuPay (Demo)',
    amount: 2000.00,
    type: 'credit',
    status: 'Completed'
  }
];

class WalletManager {
  private balance: number = 2450.00;
  private transactions: WalletTransaction[] = DEFAULT_TRANSACTIONS;
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
    this.syncFromBackend();
  }

  private loadFromStorage() {
    try {
      const storedBal = localStorage.getItem(WALLET_BALANCE_KEY);
      if (storedBal !== null) {
        this.balance = parseFloat(storedBal);
      }
      const storedTxs = localStorage.getItem(WALLET_TXS_KEY);
      if (storedTxs) {
        this.transactions = JSON.parse(storedTxs);
      }
    } catch {
      // Fallback to defaults
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(WALLET_BALANCE_KEY, this.balance.toFixed(2));
      localStorage.setItem(WALLET_TXS_KEY, JSON.stringify(this.transactions));
    } catch {
      // Ignore
    }
  }

  public async syncFromBackend() {
    try {
      const res = await fetch(`${BASE_URL}/wallet`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.balance_inr === 'number') {
          this.balance = data.balance_inr;
          if (Array.isArray(data.transactions) && data.transactions.length > 0) {
            this.transactions = data.transactions;
          }
          this.saveToStorage();
          this.notify();
        }
      }
    } catch {
      // Local fallback continues gracefully
    } finally {
      this.isInitialized = true;
    }
  }

  public getBalance(): number {
    return this.balance;
  }

  public getTransactions(): WalletTransaction[] {
    return [...this.transactions];
  }

  public getState(): WalletState {
    return {
      balance: this.balance,
      transactions: [...this.transactions]
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(WALLET_EVENT, { detail: { balance: this.balance } }));
    }
  }

  /**
   * Process payment for a new charging slot booking.
   * Deducts amount from wallet and records transaction.
   */
  public async deductForBooking(params: {
    bookingId: string;
    stationName: string;
    connector: string;
    timeSlot: string;
    amount: number;
  }): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    const cost = Math.max(0, Math.round(params.amount * 100) / 100);
    this.balance = Math.max(0, Math.round((this.balance - cost) * 100) / 100);

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newTx: WalletTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${formattedDate}`,
      description: `Slot Booking: ${params.stationName} (${params.connector}, ${params.timeSlot})`,
      amount: cost,
      type: 'debit',
      status: 'Completed',
      reference_id: params.bookingId
    };

    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    this.notify();

    // Persist to backend asynchronously
    try {
      fetch(`${BASE_URL}/wallet/debit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cost,
          description: newTx.description,
          booking_id: params.bookingId
        })
      }).catch(() => {});
    } catch {
      // Keep local update
    }

    return {
      success: true,
      newBalance: this.balance,
      transaction: newTx
    };
  }

  /**
   * Process refund when a booking is cancelled.
   */
  public async refundBooking(params: {
    bookingId: string;
    stationName: string;
    amount: number;
  }): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    const refundAmt = Math.max(0, Math.round(params.amount * 100) / 100);
    this.balance = Math.round((this.balance + refundAmt) * 100) / 100;

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const refundTx: WalletTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${formattedDate}`,
      description: `Booking Refund: ${params.stationName} (${params.bookingId})`,
      amount: refundAmt,
      type: 'credit',
      status: 'Completed',
      reference_id: params.bookingId
    };

    this.transactions = [refundTx, ...this.transactions];
    this.saveToStorage();
    this.notify();

    try {
      fetch(`${BASE_URL}/chargers/bookings/${params.bookingId}/cancel`, {
        method: 'POST'
      }).catch(() => {});
    } catch {
      // Keep local update
    }

    return {
      success: true,
      newBalance: this.balance,
      transaction: refundTx
    };
  }

  /**
   * Top-up money into wallet.
   */
  public async addMoney(amount: number, method: string = 'UPI'): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
    const addAmt = Math.max(0, Math.round(amount * 100) / 100);
    this.balance = Math.round((this.balance + addAmt) * 100) / 100;

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const topupTx: WalletTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${formattedDate}`,
      description: `Wallet Top-up via ${method} (Demo)`,
      amount: addAmt,
      type: 'credit',
      status: 'Completed'
    };

    this.transactions = [topupTx, ...this.transactions];
    this.saveToStorage();
    this.notify();

    try {
      fetch(`${BASE_URL}/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: addAmt, method })
      }).catch(() => {});
    } catch {
      // Keep local update
    }

    return {
      success: true,
      newBalance: this.balance,
      transaction: topupTx
    };
  }
}

export const walletService = new WalletManager();
