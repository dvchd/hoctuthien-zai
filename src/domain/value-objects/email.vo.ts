/**
 * Email Value Object
 * Represents a validated email address
 */

export class Email {
  private readonly _value: string;

  constructor(email: string) {
    this.validate(email);
    this._value = email.toLowerCase().trim();
  }

  get value(): string {
    return this._value;
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }

  /**
   * Get domain part of email
   */
  getDomain(): string {
    return this._value.split('@')[1];
  }

  /**
   * Get local part of email
   */
  getLocalPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
