/** Domain validation error thrown when user input fails business rules. */
export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = 'ValidationError';
  }
}
