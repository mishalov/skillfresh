export default ({ strapi }) => ({
  async getTeachers() {
    const teacherRole = await strapi("api::role.role").findOne({
      filters: {
        name: {
          $eq: "teacher",
        },
      },
    });

    console.log("teacherRole: ", teacherRole);

    return strapi.documents("api::user.user").find({
      filters: {
        role: {
          $eq: teacherRole.documentId,
        },
      },
    });
  },
});
