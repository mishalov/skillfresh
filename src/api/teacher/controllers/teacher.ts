export default {
  async getTeachers(ctx) {
    return strapi.service("api::teacher.teacher").getTeachers();
  },
};
