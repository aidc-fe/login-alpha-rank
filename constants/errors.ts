export const ERROR_CONFIG = {
  AUTH: {
    NEED_EMAIL: { code: "AUTH_NEED_EMAIL", message: "email required." },
    USER_EXIST: {
      code: "AUTH_USER_EXIST",
      message: "user already exit,please sign in.",
    },
    USER_NOT_EXIST: {
      code: "AUTH_USER_NOT_EXIST",
      message: "user not exist, please sign up.",
    },
  },
  PASSWORD: {
    ERROR: { code: "PASSWORD_ERROR", message: "" },
    SAME_AS_OLD: "PASSWORD_SAME_AS_OLD",
  },
  DATABASE: {
    VERIFICATION_TOKEN: {
      GENERATE_FAIL: {
        code: "EMAIL_TOKEN_GENERATE_FAIL",
        message: "email token generate fail",
      },
      TOKEN_NOT_EXIST: {
        code: "TOKEN_NOT_EXIST",
        message: "token not exist, please retry",
      },
      TOKEN_HAS_EXPIRED: {
        code: "TOKEN_HAS_EXPIRED",
        message: "token not expired, please resent",
      },
      TOKEN_HAS_USED: {
        code: "TOKEN_HAS_USED",
        message: "token not used, please resent",
      },
    },
  },
};
