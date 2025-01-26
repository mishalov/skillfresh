import validatePassword from "../../../utils/validatePassword";

export default ({ strapi }) => ({
  async createUserPassword({ userDocumentId, tempPassword, password }) {
    if (!validatePassword(password)) {
      throw new Error("Password does not meet the requirements");
    }

    let user = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: userDocumentId,
      });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.tempPassword !== tempPassword) {
      throw new Error("Incorrect temporary password");
    }

    user = await strapi.documents("plugin::users-permissions.user").update({
      documentId: userDocumentId,
      data: {
        password,
        tempPassword: null,
        confirmed: true,
      },
    });

    return user;
  },
});
