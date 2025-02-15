export default {
  async publicCourse(ctx) {
    const { documentId } = ctx.params;

    const course = await strapi
      .service("api::course.get")
      .publicCourse(documentId);

    return course;
  },

  async paymentPageData(ctx) {
    const { courseDocumentId } = ctx.params;

    return strapi.service("api::course.get").withTemplate(courseDocumentId);
  },

  async getCourses(ctx) {
    const user = ctx.state.user;

    const courses = await strapi
      .service("api::course.get")
      .courses(user.documentId, user.role.type.toLowerCase());

    return courses;
  },

  async defaultCourse(ctx) {
    const user = ctx.state.user;

    const course = await strapi
      .service("api::course.course")
      .getDefaultCourse(user.documentId);

    return course;
  },

  async getCourse(ctx) {
    const { documentId } = ctx.params;

    return strapi.service("api::course.get").course(documentId);
  },
};
