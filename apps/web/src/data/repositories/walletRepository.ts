import type {
  BankAccountDto,
  CreateBankAccountRequestDto,
  CryptoAddressDto,
  CryptoWithdrawRequestDto,
  DepositRequestDto,
  DepositResponseDto,
  TransferRequestDto,
  VerifyBankAccountRequestDto,
  WalletBalanceResponseDto,
  WalletTransactionDto,
  WalletTransactionsResponseDto,
  WithdrawRequestDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function fetchWalletBalance(
  accessToken: string,
): Promise<WalletBalanceResponseDto> {
  return apiFetch<WalletBalanceResponseDto>('/wallet/balance', {
    headers: authHeaders(accessToken),
  });
}

export async function depositWallet(
  accessToken: string,
  payload: DepositRequestDto,
): Promise<DepositResponseDto> {
  return apiFetch<DepositResponseDto>('/wallet/deposit', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function withdrawWallet(
  accessToken: string,
  payload: WithdrawRequestDto,
): Promise<WalletTransactionDto> {
  return apiFetch<WalletTransactionDto>('/wallet/withdraw', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function transferWallet(
  accessToken: string,
  payload: TransferRequestDto,
): Promise<WalletTransactionDto> {
  return apiFetch<WalletTransactionDto>('/wallet/transfer', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchWalletTransactions(
  accessToken: string,
  cursor?: string,
): Promise<WalletTransactionsResponseDto> {
  const search = new URLSearchParams({ limit: '30' });
  if (cursor) search.set('cursor', cursor);

  return apiFetch<WalletTransactionsResponseDto>(
    `/wallet/transactions?${search.toString()}`,
    { headers: authHeaders(accessToken) },
  );
}

export async function fetchBankAccounts(accessToken: string): Promise<BankAccountDto[]> {
  return apiFetch<BankAccountDto[]>('/wallet/bank-accounts', {
    headers: authHeaders(accessToken),
  });
}

export async function addBankAccount(
  accessToken: string,
  payload: CreateBankAccountRequestDto,
): Promise<BankAccountDto & { verificationCode?: string }> {
  return apiFetch<BankAccountDto & { verificationCode?: string }>('/wallet/bank-accounts', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function verifyBankAccount(
  accessToken: string,
  bankAccountId: string,
  payload: VerifyBankAccountRequestDto,
): Promise<BankAccountDto> {
  return apiFetch<BankAccountDto>(`/wallet/bank-accounts/${bankAccountId}/verify`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function setDefaultBankAccount(
  accessToken: string,
  bankAccountId: string,
): Promise<BankAccountDto> {
  return apiFetch<BankAccountDto>(`/wallet/bank-accounts/${bankAccountId}/default`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
  });
}

export async function fetchCryptoAddresses(
  accessToken: string,
): Promise<CryptoAddressDto[]> {
  return apiFetch<CryptoAddressDto[]>('/crypto/addresses', {
    headers: authHeaders(accessToken),
  });
}

export async function cryptoWithdraw(
  accessToken: string,
  payload: CryptoWithdrawRequestDto,
): Promise<WalletTransactionDto> {
  return apiFetch<WalletTransactionDto>('/crypto/withdraw', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}
