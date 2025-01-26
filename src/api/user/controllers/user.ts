export default {
  async createUserPassword(ctx) {
    const { userDocumentId, tempPassword, password } = ctx.request.body;
    const user = await strapi
      .service("api::user.user")
      .createUserPassword({ userDocumentId, tempPassword, password });

    return {
      success: Boolean(user.confirmed && !user.tempPassword && user.password),
    };
  },
};
