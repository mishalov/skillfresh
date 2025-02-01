import emailService from "../../../services/Email";

export default {
  async createUserPassword(ctx) {
    const { userDocumentId, tempPassword, password } = ctx.request.body;
    const user = await strapi
      .service("api::user.user")
      .createUserPassword({ userDocumentId, tempPassword, password });

    if (user.confirmed) {
      emailService.passwordCreated(user);
    }
    return {
      email: user.email,
      success: Boolean(user.confirmed && !user.tempPassword && user.password),
    };
  },
};
