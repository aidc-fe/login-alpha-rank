class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 客户端错误 4xx
class ClientError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}

// 未授权错误 401
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// 资源未找到 404
class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

// 服务端错误 500
class ServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500, false);
  }
}

export { AppError, ClientError, UnauthorizedError, NotFoundError, ServerError };

export const ERROR_CONFIG = {
  OAUTH: {},
  SIGNIN: {
    code: "SIGNIN_ERROR",
    message: "Incorrect email or password. Please try again.",
  },
  AUTH: {
    NEED_EMAIL: {
      code: "AUTH_NEED_EMAIL",
      message: "please enter email address.",
    },
    NEED_BUSINESS_DOMAIN_ID: {
      code: "AUTH_NEED_BUSINESS_DOMAIN_ID",
      message: "businessDomainId is required.",
    },
    USER_EXIST: {
      code: "AUTH_USER_EXIST",
      message: "User already exist, please sign in.",
    },
    USER_NOT_EXIST: {
      code: "AUTH_USER_NOT_EXIST",
      message: "User does not exist, please sign up.",
    },
    TURNSTILE_VERIFY_FAIL: {
      code: "AUTH_TURNSTILE_VERIFY_FAIL",
      message: "Captcha verification failed, please try again.",
    },
  },
  SHOPLAZZA: {
    HMAC: {
      code: "SHOPLAZZA_HMAC",
      message: "Shoplazza Hmac validate error",
    },
  },
  PASSWORD: {
    ERROR: { code: "PASSWORD_ERROR", message: "Enter a valid password." },
    SAME_AS_OLD: {
      code: "PASSWORD_SAME_AS_OLD",
      message: "password cannot be the same as the old one.",
    },
  },
  DATABASE: {
    VERIFICATION_TOKEN: {
      GENERATE_FAIL: {
        code: "EMAIL_TOKEN_GENERATE_FAIL",
        message: "email send failed, please try again",
      },
      TOKEN_NOT_EXIST: {
        code: "TOKEN_NOT_EXIST",
        message: "wrong link, please try again",
      },
      TOKEN_HAS_EXPIRED: {
        code: "TOKEN_HAS_EXPIRED",
        message: "link expired, please try again",
      },
      TOKEN_HAS_USED: {
        code: "TOKEN_HAS_USED",
        message: "link was used, please try again",
      },
    },
  },
  SERVER: {
    ERROR_500: {
      code: "Internal Server Error",
      message: "Internal Server Error",
    },
  },
};
