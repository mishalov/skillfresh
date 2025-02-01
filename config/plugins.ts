import validatePassword from "../src/utils/validatePassword";

export default () => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: process.env.SENDGRID_API_KEY,
      },
      settings: {
        defaultFrom: "info@skillfresh.cz",
        defaultReplyTo: "support@skillfresh.cz",
      },
    },
  },
  "users-permissions": {
    config: {
      validationRules: {
        validatePassword,
      },
    },
  },
});
