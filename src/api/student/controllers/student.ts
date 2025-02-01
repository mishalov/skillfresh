export default {
  async getDashboard(ctx) {
    const user = ctx.state.user;
    const courseDocumentId = ctx.query.courseDocumentId;

    return strapi
      .service("api::student.student")
      .getDashboard({ user, courseDocumentId });
  },
};
