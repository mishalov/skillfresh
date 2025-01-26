import { randomUUID } from "crypto";

export default ({ strapi }) => {
  return {
    async getDashboard({ user, courseDocumentId }) {
      return {
        nextWorkshop: await strapi
          .service("api::workshop.workshop")
          .getStudentsNextWorkshop(user),
        nextPayment: await strapi
          .service("api::payment.payment")
          .getNextPayment({ courseDocumentId, limited: true }),
      };
    },
    async createStudentFromOrder(order) {
      const {
        email,
        firstName,
        lastName,
        lead: { documentId: leadDocumentId },
        course: { documentId },
      } = order;

      let student = (
        await strapi.documents("plugin::users-permissions.user").findMany({
          filters: {
            email: {
              $eq: email,
            },
          },
          limit: 1,
          populate: ["coursesAsStudent"],
        })
      )?.[0];

      if (!student) {
        student = await strapi
          .documents("plugin::users-permissions.user")
          .create({
            data: {
              email,
              firstName,
              lastName,
              username: email,
              tempPassword: randomUUID(),
              fromLead: leadDocumentId,
              coursesAsStudent: [documentId],
              provider: "local",
            },
          });
      } else {
        student = await strapi
          .documents("plugin::users-permissions.user")
          .update({
            documentId: student.documentId,
            data: {
              coursesAsStudent: [
                ...student.coursesAsStudent?.map(
                  ({ documentId }) => documentId
                ),
                documentId,
              ],
            },
          });
      }

      const [role] = await strapi
        .documents("plugin::users-permissions.role")
        .findMany({
          filters: {
            name: {
              $eq: "Student",
            },
          },
          limit: 1,
        });

      await strapi.documents("plugin::users-permissions.user").update({
        documentId: student.documentId,
        data: {
          role: role.documentId,
        },
      });

      await strapi.documents("api::order.order").update({
        documentId: order.documentId,
        data: {
          student: student.documentId,
        },
      });

      await strapi.documents("api::lead.lead").update({
        documentId: leadDocumentId,
        data: {
          state: "success",
        },
      });

      return student;
    },
  };
};
