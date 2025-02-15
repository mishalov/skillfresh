import { Core } from "@strapi/strapi";
import { randomUUID } from "crypto";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async fromOrder(order) {
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
        populate: ["coursesAsStudent", "orders"],
      })
    )?.[0];

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
            orders: [order.documentId],
            role: role.documentId,
          },
        });
    } else {
      student = await strapi
        .documents("plugin::users-permissions.user")
        .update({
          documentId: student.documentId,
          data: {
            role: role.documentId,
            orders: [
              ...student.orders?.map(({ documentId }) => documentId),
              order.documentId,
            ],
            coursesAsStudent: [
              ...student.coursesAsStudent?.map(({ documentId }) => documentId),
              documentId,
            ],
          },
        });
    }

    await strapi.documents("api::lead.lead").update({
      documentId: leadDocumentId,
      data: {
        state: "Success",
      },
    });

    return student;
  },
});
