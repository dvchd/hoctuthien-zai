/**
 * VietQR Service
 * Generates QR codes and deep links for bank transfers
 */

/**
 * VietQR Configuration
 */
export interface IVietQRConfig {
  bankCode: string;
  accountNo: string;
  accountName: string;
}

/**
 * QR Code Generation Options
 */
export interface IQRCodeOptions {
  accountNo: string;
  accountName: string;
  amount: number;
  content: string;
  bankCode?: string;
}

/**
 * Deep Link Generation Options
 */
export interface IDeepLinkOptions extends IQRCodeOptions {
  appId?: string; // Optional app ID for specific bank apps
}

/**
 * VietQR Service
 * Handles QR code and deep link generation for bank transfers
 */
export class VietQRService {
  // Bank codes mapping
  private static readonly BANK_CODES: Record<string, string> = {
    MBBANK: 'mbbank',
    MB: 'mbbank',
    VIETCOMBANK: 'vietcombank',
    VCB: 'vietcombank',
    BIDV: 'bidv',
    VIETINBANK: 'vietinbank',
    TCB: 'techcombank',
    TECHCOMBANK: 'techcombank',
    AGRIBANK: 'agribank',
    VPB: 'vpbank',
    VPBANK: 'vpbank',
    TPB: 'tpbank',
    TPBANK: 'tpbank',
    SACOMBANK: 'sacombank',
    STB: 'sacombank',
    ACB: 'acb',
    HDBANK: 'hdbank',
    HDB: 'hdbank',
    MSB: 'msb',
    MASTERCARD: 'msb',
    SHB: 'shb',
    OCB: 'ocb',
    LIETIEU: 'lienvietpostbank',
    LPB: 'lienvietpostbank',
    VIB: 'vib',
    NCB: 'ncb',
    BAB: 'bacabank',
    BACA: 'bacabank',
    KIENLUC: 'kienlongbank',
    KLB: 'kienlongbank',
    SAIGON: 'saigonbank',
    SGB: 'saigonbank',
    ANBINH: 'abbank',
    ABB: 'abbank',
    PVCOM: 'pvcombank',
    PV: 'pvcombank',
    VIETA: 'vietabank',
    VAB: 'vietabank',
    CBBANK: 'cbbank',
    CB: 'cbbank',
    NAMABANK: 'namabank',
    NAB: 'namabank',
    PGBANK: 'pgbank',
    PG: 'pgbank',
    GP: 'gpbank',
    GPB: 'gpbank',
    QUANDO: 'mbbank',
    DB: 'dongabank',
    DONGA: 'dongabank',
  };

  // VietQR base URL
  private static readonly VIET_QR_IMAGE_URL = 'https://img.vietqr.io/image';
  private static readonly VIET_QR_API_URL = 'https://api.vietqr.io';

  /**
   * Get bank code from bank name or code
   * @param bank Bank name or code
   * @returns Normalized bank code
   */
  static getBankCode(bank: string): string {
    const normalizedBank = bank.toUpperCase().replace(/\s+/g, '');
    return this.BANK_CODES[normalizedBank] || bank.toLowerCase();
  }

  /**
   * Generate QR code image URL
   * @param options QR code options
   * @returns URL to QR code image
   */
  static generateQRCodeUrl(options: IQRCodeOptions): string {
    const {
      accountNo,
      accountName,
      amount,
      content,
      bankCode = 'mbbank',
    } = options;

    const normalizedBank = this.getBankCode(bankCode);
    const encodedAccountName = encodeURIComponent(accountName);
    const encodedContent = encodeURIComponent(content);

    // VietQR format for QR code image
    // Format: https://img.vietqr.io/image/{bank}-{accountNo}-qr_only.png?amount={amount}&addInfo={content}&accountName={accountName}
    const url = `${this.VIET_QR_IMAGE_URL}/${normalizedBank}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;

    return url;
  }

  /**
   * Generate QR code with template
   * @param options QR code options
   * @param template Template name (e.g., 'qr_only', 'compact', 'print')
   * @returns URL to QR code image
   */
  static generateQRCodeWithTemplate(
    options: IQRCodeOptions,
    template: 'qr_only' | 'compact' | 'print' = 'qr_only'
  ): string {
    const {
      accountNo,
      accountName,
      amount,
      content,
      bankCode = 'mbbank',
    } = options;

    const normalizedBank = this.getBankCode(bankCode);
    const encodedAccountName = encodeURIComponent(accountName);
    const encodedContent = encodeURIComponent(content);

    const url = `${this.VIET_QR_IMAGE_URL}/${normalizedBank}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;

    return url;
  }

  /**
   * Generate deep link for banking apps
   * This creates a link that opens banking apps with pre-filled transfer info
   * @param options Deep link options
   * @returns Deep link URL
   */
  static generateDeepLink(options: IDeepLinkOptions): string {
    const {
      accountNo,
      accountName,
      amount,
      content,
      bankCode = 'mbbank',
    } = options;

    const normalizedBank = this.getBankCode(bankCode);
    const encodedAccountName = encodeURIComponent(accountName);
    const encodedContent = encodeURIComponent(content);

    // Deep link format varies by bank, but VietQR provides a standard format
    // Format: https://api.vietqr.io/{bank}/{accountNo}?amount={amount}&addInfo={content}&accountName={accountName}
    const url = `${this.VIET_QR_API_URL}/${normalizedBank}/${accountNo}?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;

    return url;
  }

  /**
   * Generate MB Bank Quick Link
   * Specialized deep link for MB Bank app
   * @param options QR code options
   * @returns MB Bank deep link
   */
  static generateMBBankDeepLink(options: Omit<IQRCodeOptions, 'bankCode'>): string {
    const { accountNo, accountName, amount, content } = options;

    const encodedAccountName = encodeURIComponent(accountName);
    const encodedContent = encodeURIComponent(content);

    // MB Bank specific deep link format
    // Format: mbbank://app/payment?accountNo={accountNo}&accountName={accountName}&amount={amount}&content={content}
    return `mbbank://app/payment?accountNo=${accountNo}&accountName=${encodedAccountName}&amount=${amount}&content=${encodedContent}`;
  }

  /**
   * Generate all QR code URLs for an account
   * @param options QR code options
   * @returns Object with all QR code URLs
   */
  static generateAllQRCodes(options: IQRCodeOptions): {
    qrOnly: string;
    compact: string;
    print: string;
  } {
    return {
      qrOnly: this.generateQRCodeWithTemplate(options, 'qr_only'),
      compact: this.generateQRCodeWithTemplate(options, 'compact'),
      print: this.generateQRCodeWithTemplate(options, 'print'),
    };
  }

  /**
   * Generate VietQR string (raw QR data)
   * This can be used to generate custom QR codes
   * @param options QR code options
   * @returns VietQR string
   */
  static generateVietQRString(options: IQRCodeOptions): string {
    const {
      accountNo,
      accountName,
      amount,
      content,
      bankCode = 'mbbank',
    } = options;

    const normalizedBank = this.getBankCode(bankCode);

    // VietQR follows EMV QR Code specification
    // This is a simplified version - full implementation would follow EMV spec
    const qrData = {
      bin: normalizedBank,
      accountNo,
      accountName,
      amount: amount.toString(),
      addInfo: content,
    };

    // Return as JSON string for easier parsing
    return JSON.stringify(qrData);
  }

  /**
   * Validate account number format
   * @param accountNo Account number to validate
   * @returns True if valid
   */
  static validateAccountNo(accountNo: string): boolean {
    // Account number should be numeric and 6-19 digits
    const accountNoRegex = /^\d{6,19}$/;
    return accountNoRegex.test(accountNo);
  }

  /**
   * Validate amount
   * @param amount Amount to validate
   * @returns True if valid
   */
  static validateAmount(amount: number): boolean {
    // Amount should be positive and reasonable (max 1 billion VND per transaction)
    return amount > 0 && amount <= 1000000000;
  }
}

/**
 * Create VietQR options for activation payment
 * @param accountNo Charity account number
 * @param accountName Account holder name
 * @param paymentCode Payment code for verification
 * @param amount Activation amount (default: 10000 VND)
 * @returns QR code options
 */
export function createActivationQROptions(
  accountNo: string,
  accountName: string,
  paymentCode: string,
  amount: number = 10000
): IQRCodeOptions {
  return {
    accountNo,
    accountName,
    amount,
    content: `KICH HOAT ${paymentCode}`,
    bankCode: 'mbbank',
  };
}

/**
 * Create VietQR options for session payment
 * @param accountNo Charity account number
 * @param accountName Account holder name
 * @param paymentCode Payment code for verification
 * @param amount Session amount in VND
 * @returns QR code options
 */
export function createSessionPaymentQROptions(
  accountNo: string,
  accountName: string,
  paymentCode: string,
  amount: number
): IQRCodeOptions {
  return {
    accountNo,
    accountName,
    amount,
    content: `HOC PHI ${paymentCode}`,
    bankCode: 'mbbank',
  };
}
