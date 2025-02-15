export default {
  async getDashboard(ctx) {
    const userDocumentId = ctx.state.user.documentId;
    const courseDocumentId = ctx.query.courseDocumentId;

    return strapi
      .service("api::student.student")
      .getDashboard({ userDocumentId, courseDocumentId });
  },
};
