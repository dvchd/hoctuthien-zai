/**
 * Domain Errors
 * Custom error classes for domain-level validation and business rules
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier '${identifier}' not found`);
    this.name = 'EntityNotFoundError';
  }
}

export class EntityAlreadyExistsError extends DomainError {
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} with ${field} '${value}' already exists`);
    this.name = 'EntityAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor(message: string = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class OptimisticConcurrencyError extends DomainError {
  constructor(entityName: string, id: string) {
    super(
      `Optimistic concurrency conflict for ${entityName} with id '${id}'. The entity has been modified by another transaction.`
    );
    this.name = 'OptimisticConcurrencyError';
  }
}

export class EntityDeletedError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id '${id}' has been deleted`);
    this.name = 'EntityDeletedError';
  }
}
