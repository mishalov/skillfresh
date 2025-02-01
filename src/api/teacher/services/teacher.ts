export default ({ strapi }) => ({
  async getTeachers({
    teacherDocumentIds,
  }: { teacherDocumentIds?: string[] } = {}) {
    const [teacherRole] = await strapi
      .documents("plugin::users-permissions.role")
      .findMany({
        filters: {
          name: {
            $eq: "Teacher",
          },
        },
        limit: 1,
      });

    if (teacherDocumentIds) {
      return strapi.documents("plugin::users-permissions.user").findMany({
        filters: {
          role: {
            documentId: {
              $eq: teacherRole.documentId,
            },
          },
          documentId: {
            $in: teacherDocumentIds,
          },
        },
      });
    }

    return strapi.documents("plugin::users-permissions.user").findMany({
      filters: {
        role: {
          documentId: {
            $eq: teacherRole.documentId,
          },
        },
      },
    });
  },
});
