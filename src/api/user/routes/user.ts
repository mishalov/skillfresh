export default {
  routes: [
    {
      method: "POST",
      path: "/create-password",
      handler: "user.createUserPassword",
      config: {
        auth: false,
      },
    },
  ],
};
