import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  BankAccountDto,
  CryptoAddressDto,
  CryptoAsset,
  WalletTransactionDto,
} from '@bitemate/shared';
import {
  addBankAccount,
  cryptoWithdraw,
  depositWallet,
  fetchBankAccounts,
  fetchCryptoAddresses,
  fetchWalletBalance,
  fetchWalletTransactions,
  setDefaultBankAccount,
  transferWallet,
  verifyBankAccount,
  withdrawWallet,
} from '@/data/repositories/walletRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const CRYPTO_ASSETS: CryptoAsset[] = ['BTC', 'ETH', 'USDT', 'USDC', 'DOGE', 'SOL'];

export function WalletPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(0);
  const [pending, setPending] = useState(0);
  const [escrowHeld, setEscrowHeld] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddressDto[]>([]);
  const [depositAmount, setDepositAmount] = useState('25');
  const [withdrawAmount, setWithdrawAmount] = useState('10');
  const [withdrawBankId, setWithdrawBankId] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('5');
  const [cryptoAsset, setCryptoAsset] = useState<CryptoAsset>('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('0.001');
  const [cryptoDestination, setCryptoDestination] = useState('');
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: '',
    country: '',
    accountNumber: '',
    routingNumber: '',
  });
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyAccountId, setVerifyAccountId] = useState('');
  const [pendingVerifyCode, setPendingVerifyCode] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const [balance, txResponse, accounts, addresses] = await Promise.all([
        fetchWalletBalance(accessToken),
        fetchWalletTransactions(accessToken),
        fetchBankAccounts(accessToken),
        fetchCryptoAddresses(accessToken),
      ]);

      setAvailable(balance.fiat.available);
      setPending(balance.fiat.pending);
      setEscrowHeld(balance.escrowHeld);
      setCurrency(balance.fiat.currency);
      setTransactions(txResponse.items);
      setBankAccounts(accounts);
      setCryptoAddresses(addresses);
      if (!withdrawBankId && accounts.length > 0) {
        const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
        setWithdrawBankId(defaultAccount.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [accessToken, withdrawBankId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleDeposit() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      const response = await depositWallet(accessToken, {
        amount: Number(depositAmount),
      });
      setActionMessage(
        response.clientSecret
          ? 'Stripe payment intent created — complete payment in Stripe Elements.'
          : `Deposit completed. Net credited: ${response.transaction.netAmount} ${response.transaction.currency}`,
      );
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Deposit failed');
    }
  }

  async function handleWithdraw() {
    if (!accessToken || !withdrawBankId) return;
    setActionMessage(null);
    try {
      await withdrawWallet(accessToken, {
        amount: Number(withdrawAmount),
        bankAccountId: withdrawBankId,
      });
      setActionMessage('Withdrawal submitted.');
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Withdraw failed');
    }
  }

  async function handleTransfer() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      await transferWallet(accessToken, {
        recipientUserId: transferRecipient,
        amount: Number(transferAmount),
      });
      setActionMessage('Transfer completed.');
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Transfer failed');
    }
  }

  async function handleAddBank() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      const created = await addBankAccount(accessToken, {
        ...bankForm,
        setAsDefault: bankAccounts.length === 0,
      });
      if (created.verificationCode) {
        setPendingVerifyCode(created.verificationCode);
        setVerifyAccountId(created.id);
      }
      setActionMessage('Bank account added. Verify with the code shown below.');
      setBankForm({
        bankName: '',
        accountHolderName: '',
        country: '',
        accountNumber: '',
        routingNumber: '',
      });
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to add bank account');
    }
  }

  async function handleVerifyBank() {
    if (!accessToken || !verifyAccountId) return;
    setActionMessage(null);
    try {
      await verifyBankAccount(accessToken, verifyAccountId, {
        verificationCode: verifyCode,
      });
      setPendingVerifyCode(null);
      setVerifyCode('');
      setActionMessage('Bank account verified.');
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Verification failed');
    }
  }

  async function handleCryptoWithdraw() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      await cryptoWithdraw(accessToken, {
        asset: cryptoAsset,
        amount: Number(cryptoAmount),
        destinationAddress: cryptoDestination,
      });
      setActionMessage('Crypto withdrawal submitted.');
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Crypto withdrawal failed');
    }
  }

  const selectedCrypto = cryptoAddresses.find((entry) => entry.asset === cryptoAsset);

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{t('wallet.title')}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/profile">Profile</Link>
            <Link to="/bookings">Bookings</Link>
          </div>
        </div>

        {loading && <p className="hint">Loading wallet…</p>}
        {error && <p className="error">{error}</p>}
        {actionMessage && <p className="hint">{actionMessage}</p>}

        {!loading && (
          <>
            <article className="card">
              <h2>Fiat balance</h2>
              <p>
                Available: <strong>{available.toFixed(2)} {currency}</strong>
              </p>
              <p>Pending: {pending.toFixed(2)} {currency}</p>
              <p>Escrow held: {escrowHeld.toFixed(2)} {currency}</p>
            </article>

            <article className="card flow">
              <h2>Deposit (card)</h2>
              <label className="field">
                Amount
                <input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </label>
              <button type="button" onClick={() => void handleDeposit()}>
                Deposit
              </button>
            </article>

            <article className="card flow">
              <h2>Withdraw to bank</h2>
              <label className="field">
                Amount
                <input
                  type="number"
                  min="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </label>
              <label className="field">
                Bank account
                <select
                  value={withdrawBankId}
                  onChange={(e) => setWithdrawBankId(e.target.value)}
                >
                  <option value="">Select account</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName} •••• {account.last4} ({account.status})
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={() => void handleWithdraw()}>
                Withdraw
              </button>
            </article>

            <article className="card flow">
              <h2>Internal transfer</h2>
              <label className="field">
                Recipient user ID
                <input
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                />
              </label>
              <label className="field">
                Amount
                <input
                  type="number"
                  min="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </label>
              <button type="button" onClick={() => void handleTransfer()}>
                Transfer
              </button>
            </article>

            <article className="card flow">
              <h2>Bank accounts</h2>
              {bankAccounts.length === 0 && <p className="hint">No bank accounts yet.</p>}
              <ul className="card-list">
                {bankAccounts.map((account) => (
                  <li key={account.id} className="card">
                    <p>
                      {account.bankName} •••• {account.last4} — {account.status}
                      {account.isDefault ? ' (default)' : ''}
                    </p>
                    {account.status === 'VERIFIED' && !account.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          void setDefaultBankAccount(accessToken!, account.id).then(() => reload())
                        }
                      >
                        Set default
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <h3>Add bank account</h3>
              <label className="field">
                Bank name
                <input
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                />
              </label>
              <label className="field">
                Account holder
                <input
                  value={bankForm.accountHolderName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountHolderName: e.target.value })
                  }
                />
              </label>
              <label className="field">
                Country
                <input
                  value={bankForm.country}
                  onChange={(e) => setBankForm({ ...bankForm, country: e.target.value })}
                />
              </label>
              <label className="field">
                Account number
                <input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                />
              </label>
              <label className="field">
                Routing / IBAN (optional)
                <input
                  value={bankForm.routingNumber}
                  onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                />
              </label>
              <button type="button" onClick={() => void handleAddBank()}>
                Add account
              </button>

              {(pendingVerifyCode || verifyAccountId) && (
                <div className="flow">
                  {pendingVerifyCode && (
                    <p className="hint">Verification code (dev): {pendingVerifyCode}</p>
                  )}
                  <label className="field">
                    Verification code
                    <input
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                    />
                  </label>
                  <button type="button" onClick={() => void handleVerifyBank()}>
                    Verify account
                  </button>
                </div>
              )}
            </article>

            <article className="card flow">
              <h2>Crypto wallets</h2>
              <label className="field">
                Asset
                <select
                  value={cryptoAsset}
                  onChange={(e) => setCryptoAsset(e.target.value as CryptoAsset)}
                >
                  {CRYPTO_ASSETS.map((asset) => (
                    <option key={asset} value={asset}>
                      {asset}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCrypto && (
                <div className="flow">
                  <p>
                    Deposit address: <code>{selectedCrypto.address}</code>
                  </p>
                  <img
                    src={selectedCrypto.qrCodeDataUrl}
                    alt={`${selectedCrypto.asset} QR code`}
                    width={200}
                    height={200}
                  />
                </div>
              )}

              <h3>Crypto withdrawal</h3>
              <label className="field">
                Amount
                <input
                  type="number"
                  min="0.00001"
                  step="any"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                />
              </label>
              <label className="field">
                Destination address
                <input
                  value={cryptoDestination}
                  onChange={(e) => setCryptoDestination(e.target.value)}
                />
              </label>
              <button type="button" onClick={() => void handleCryptoWithdraw()}>
                Withdraw crypto
              </button>
            </article>

            <article className="card">
              <h2>Transaction history</h2>
              {transactions.length === 0 && <p className="hint">No transactions yet.</p>}
              <ul className="card-list">
                {transactions.map((tx) => (
                  <li key={tx.id} className="card">
                    <p>
                      <strong>{tx.type}</strong> — {tx.status}
                    </p>
                    <p>
                      {tx.cryptoAsset
                        ? `${tx.cryptoAmount} ${tx.cryptoAsset}`
                        : `${tx.amount} ${tx.currency}`}
                      {tx.fee > 0 ? ` (fee ${tx.fee})` : ''}
                    </p>
                    {tx.description && <p>{tx.description}</p>}
                    <p className="hint">{new Date(tx.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </article>
          </>
        )}
      </section>
    </main>
  );
}
