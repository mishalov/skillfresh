import { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async publicCourse(documentId) {
    const course = await strapi.documents("api::course.course").findOne({
      documentId,
      fields: ["name", "dateStart", "durationMonths"],
      populate: ["templateCourse", "monthPrice", "fullPrice"],
    });

    return {
      ...course,
      templateCourse: {
        documentId: course.templateCourse.documentId,
      },
    };
  },

  async withTemplate(courseDocumentId) {
    const course = await strapi
      .service("api::course.get")
      .publicCourse(courseDocumentId);

    const availableCourses = await strapi
      .service("api::template-course.template-course")
      .getAvailableCourses(course.templateCourse.documentId);

    return {
      course,
      availableCourses,
    };
  },

  async courses(userDocumentId, role: "teacher" | "student" | "admin") {
    const populate = [];

    if (role === "teacher" || role === "admin") {
      populate.push("coursesAsTeacher");
    }

    if (role === "student") {
      populate.push("coursesAsStudent");
    }

    const user = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: userDocumentId,
        fields: [],
        populate,
      });

    return user.coursesAsTeacher || user.coursesAsStudent;
  },

  async defaultCourse(userDocumentId) {
    const courseFields = {
      fields: [
        "name",
        "dateStart",
        "durationMonths",
        "description",
        "discordLink",
      ],
      populate: {
        lessons: {
          fields: ["name", "duration", "description", "notionLink", "slug"],
          populate: {
            chapter: {
              fields: ["name", "description"],
              populate: ["cover"],
            },
          },
        },
        workshops: {
          fields: ["date", "description"],
        },
        cover: {
          fields: "*",
        },
      },
    } as any;

    const user = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: userDocumentId,
        fields: [],
        populate: {
          coursesAsStudent: courseFields,
          defaultCourse: courseFields,
        },
      });

    return user.defaultCourse || user.coursesAsStudent[0];
  },
});
