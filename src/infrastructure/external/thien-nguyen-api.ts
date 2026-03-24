/**
 * Thiện Nguyện App API Integration
 * Handles communication with apiv2.thiennguyen.app for charity transactions
 */

/**
 * Transaction from Thiện Nguyện App API
 */
export interface IThienNguyenTransaction {
  id: string;
  refId: string; // FTxxxxx - Mã tham chiếu giao dịch
  amount: number;
  narrative: string; // Nội dung chuyển khoản
  senderName: string;
  transactionTime: string; // ISO datetime string (VN timezone without tz info)
  accountNo: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response structure from Thiện Nguyện App
 */
export interface IThienNguyenApiResponse {
  success: boolean;
  data: IThienNguyenTransaction[];
  total: number;
  page: number;
  pageSize: number;
  message?: string;
}

/**
 * Query parameters for transaction lookup
 */
export interface ITransactionQueryParams {
  accountNo: string;
  fromDate?: Date;
  toDate?: Date;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Thiện Nguyện App API Client
 * Handles fetching transactions from charity bank accounts
 */
export class ThienNguyenAPI {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly isDevelopment: boolean;

  constructor(baseUrl: string = 'https://apiv2.thiennguyen.app', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    // Check if we're in development mode or if the API is unavailable
    this.isDevelopment = process.env.NODE_ENV === 'development' || process.env.SKIP_THIENNGUYEN_API === 'true';
  }

  /**
   * Get transactions for a charity account
   * @param params Query parameters
   * @returns List of transactions
   */
  async getTransactions(params: ITransactionQueryParams): Promise<IThienNguyenTransaction[]> {
    const { accountNo, fromDate, toDate, keyword, pageNumber = 1, pageSize = 50 } = params;

    // In development mode, return mock data
    if (this.isDevelopment) {
      console.log('[ThienNguyenAPI] Development mode - returning empty transactions');
      return [];
    }

    try {
      // Build URL with query parameters
      const url = new URL(
        `/api/v2/bank-account-transaction/${accountNo}/transactionsV2`,
        this.baseUrl
      );

      // Format dates for API (YYYY-MM-DD format)
      if (fromDate) {
        url.searchParams.append('fromDate', this.formatDate(fromDate));
      }
      if (toDate) {
        url.searchParams.append('toDate', this.formatDate(toDate));
      }
      if (keyword) {
        url.searchParams.append('keyword', keyword);
      }
      url.searchParams.append('pageNumber', pageNumber.toString());
      url.searchParams.append('pageSize', pageSize.toString());

      console.log(`[ThienNguyenAPI] Fetching transactions from: ${url.toString()}`);

      // Make API request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ThienNguyenAPI] API error: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data: IThienNguyenApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }

      console.log(`[ThienNguyenAPI] Fetched ${data.data.length} transactions`);

      // Parse and convert transaction times to proper Date objects
      // Note: API returns VN timezone times without timezone info
      return data.data.map((tx) => ({
        ...tx,
        transactionTime: this.parseVietnamTime(tx.transactionTime),
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[ThienNguyenAPI] Request timeout');
        throw new Error('Request timeout');
      }
      console.error('[ThienNguyenAPI] Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Find transaction by payment code (keyword in narrative)
   * @param accountNo Charity account number
   * @param paymentCode Payment code to search for
   * @param fromDate Optional start date
   * @returns Matching transaction or null
   */
  async findTransactionByPaymentCode(
    accountNo: string,
    paymentCode: string,
    fromDate?: Date
  ): Promise<IThienNguyenTransaction | null> {
    try {
      const transactions = await this.getTransactions({
        accountNo,
        keyword: paymentCode,
        fromDate: fromDate || this.getDefaultFromDate(),
        pageSize: 100,
      });

      // Find exact match in narrative (case-insensitive)
      const paymentCodeUpper = paymentCode.toUpperCase();
      const match = transactions.find(
        (tx) => tx.narrative?.toUpperCase().includes(paymentCodeUpper)
      );

      if (match) {
        console.log(`[ThienNguyenAPI] Found transaction for payment code ${paymentCode}:`, match);
      } else {
        console.log(`[ThienNguyenAPI] No transaction found for payment code ${paymentCode}`);
      }

      return match || null;
    } catch (error) {
      console.error('[ThienNguyenAPI] Error finding transaction:', error);
      // Return null instead of throwing - this allows graceful handling
      return null;
    }
  }

  /**
   * Find transaction by amount and approximate time
   * @param accountNo Charity account number
   * @param amount Expected amount
   * @param withinMinutes Time window in minutes
   * @returns Matching transaction or null
   */
  async findTransactionByAmount(
    accountNo: string,
    amount: number,
    withinMinutes: number = 60
  ): Promise<IThienNguyenTransaction | null> {
    try {
      const fromDate = new Date();
      fromDate.setMinutes(fromDate.getMinutes() - withinMinutes);

      const transactions = await this.getTransactions({
        accountNo,
        fromDate,
        pageSize: 50,
      });

      // Find transaction with matching amount within time window
      const match = transactions.find((tx) => {
        const txTime = new Date(tx.transactionTime);
        const timeDiff = Date.now() - txTime.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        return tx.amount === amount && minutesDiff <= withinMinutes;
      });

      return match || null;
    } catch (error) {
      console.error('[ThienNguyenAPI] Error finding transaction by amount:', error);
      throw error;
    }
  }

  /**
   * Format date to YYYY-MM-DD format for API
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse Vietnam time string to ISO string
   * API returns times in Vietnam timezone (UTC+7) without timezone info
   */
  private parseVietnamTime(timeStr: string): string {
    if (!timeStr) return timeStr;

    // If already has timezone info, return as is
    if (timeStr.includes('Z') || timeStr.includes('+') || timeStr.includes('T')) {
      // If it has T but no timezone, assume Vietnam time
      if (!timeStr.includes('Z') && !timeStr.includes('+')) {
        // Parse as Vietnam time and convert to UTC
        return this.convertVietnamToUtc(timeStr);
      }
      return timeStr;
    }

    // Convert Vietnam time to UTC
    return this.convertVietnamToUtc(timeStr);
  }

  /**
   * Convert Vietnam time (UTC+7) to UTC ISO string
   */
  private convertVietnamToUtc(vietnamTimeStr: string): string {
    try {
      // Parse the Vietnam time
      const date = new Date(vietnamTimeStr);

      // If the string doesn't have timezone, JavaScript will interpret it as local time
      // We need to adjust for Vietnam timezone
      // Vietnam is UTC+7, so we subtract 7 hours to get UTC
      const vietnamOffset = 7 * 60; // 7 hours in minutes
      const localOffset = date.getTimezoneOffset(); // Local timezone offset in minutes

      // Adjust the time
      const adjustedTime = new Date(date.getTime() + (localOffset + vietnamOffset) * 60 * 1000);

      return adjustedTime.toISOString();
    } catch {
      return vietnamTimeStr;
    }
  }

  /**
   * Get default from date (30 days ago)
   */
  private getDefaultFromDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }
}

// Singleton instance
let thienNguyenApiInstance: ThienNguyenAPI | null = null;

/**
 * Get the singleton instance of ThienNguyenAPI
 */
export function getThienNguyenAPI(): ThienNguyenAPI {
  if (!thienNguyenApiInstance) {
    thienNguyenApiInstance = new ThienNguyenAPI();
  }
  return thienNguyenApiInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetThienNguyenAPI(): void {
  thienNguyenApiInstance = null;
}
