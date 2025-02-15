export default {
  async getDashboard(ctx) {
    const userDocumentId = ctx.state.user.documentId;
    const courseDocumentId = ctx.query.courseDocumentId;

    return strapi
      .service("api::student.student")
      .getDashboard({ userDocumentId, courseDocumentId });
  },
  async assignProject({
    params: { documentId },
    request: {
      body: { projectDocumentId },
    },
    state: { user },
  }) {
    const role = user.role.type.toLowerCase();
    if (role !== "teacher" && role !== "admin") {
      throw new Error("Only teachers and admins can assign projects");
    }

    return strapi
      .service("api::student.update")
      .assignProject({ studentDocumentId: documentId, projectDocumentId });
  },
};
