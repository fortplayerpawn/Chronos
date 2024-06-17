import { config } from "..";

interface ErrorData {
  errorCode: number;
  errorMessage: string;
  messageVars?: string[];
  numericErrorCode: number;
  originatingService: string;
  intent: string;
  createdAt: string;
  // severity: ErrorSeverity;
}

export default class errors {
  private static errors: ErrorData[] = [];

  static createError(code: number, route: string, message: string, timestamp: string): ErrorData {
    const sanitizedRoute = route.replace(`http://127.0.0.1:${config.port}/fortnite`, "");

    const errorData: ErrorData = {
      errorCode: code,
      errorMessage: message,
      messageVars: [sanitizedRoute],
      numericErrorCode: code,
      originatingService: "Chronos",
      intent: "prod-live",
      createdAt: timestamp,
    };
    this.errors.push(errorData);

    return errorData;
  }

  static getErrors(): ErrorData[] {
    return this.errors;
  }

  static clearErrors(): void {
    this.errors = [];
  }
}
