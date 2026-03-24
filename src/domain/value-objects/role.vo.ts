/**
 * UserRole Value Object
 * Represents the role of a user in the system
 */

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  MENTEE = 'MENTEE',
}

export class UserRole {
  private readonly _value: UserRoleEnum;

  constructor(role: UserRoleEnum) {
    this.validate(role);
    this._value = role;
  }

  get value(): UserRoleEnum {
    return this._value;
  }

  private validate(role: UserRoleEnum): void {
    if (!Object.values(UserRoleEnum).includes(role)) {
      throw new Error(`Invalid user role: ${role}`);
    }
  }

  /**
   * Check if this role is Admin
   */
  isAdmin(): boolean {
    return this._value === UserRoleEnum.ADMIN;
  }

  /**
   * Check if this role is Mentor
   */
  isMentor(): boolean {
    return this._value === UserRoleEnum.MENTOR;
  }

  /**
   * Check if this role is Mentee
   */
  isMentee(): boolean {
    return this._value === UserRoleEnum.MENTEE;
  }

  /**
   * Check if this role has at least the same privileges as another role
   */
  hasAtLeastPrivilegesOf(other: UserRole): boolean {
    const privilegeOrder = {
      [UserRoleEnum.MENTEE]: 1,
      [UserRoleEnum.MENTOR]: 2,
      [UserRoleEnum.ADMIN]: 3,
    };
    return privilegeOrder[this._value] >= privilegeOrder[other.value];
  }

  /**
   * Create default role (Mentee)
   */
  static createDefault(): UserRole {
    return new UserRole(UserRoleEnum.MENTEE);
  }

  /**
   * Create from string
   */
  static fromString(roleString: string): UserRole {
    const role = Object.values(UserRoleEnum).find(
      (r) => r.toLowerCase() === roleString.toLowerCase()
    );
    if (!role) {
      throw new Error(`Invalid user role string: ${roleString}`);
    }
    return new UserRole(role);
  }

  equals(other: UserRole): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
