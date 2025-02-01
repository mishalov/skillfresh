export default {
  routes: [
    {
      method: "POST",
      path: "/contact-form",
      handler: "contact-form.index",
      config: {
        auth: false,
      },
    },
  ],
};
