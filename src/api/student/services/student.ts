import { Core, Data, Schema } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    async getDashboard({
      userDocumentId,
      courseDocumentId,
    }: {
      userDocumentId: string;
      courseDocumentId: string;
    }) {
      const userWithOrder = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: userDocumentId,
          populate: {
            orders: {
              filters: {
                course: {
                  documentId: {
                    $eq: courseDocumentId,
                  },
                },
              },
            },
          },
        });

      return {
        nextWorkshop: await strapi
          .service("api::workshop.workshop")
          .getStudentsNextWorkshop(userDocumentId),
        nextPayment: await strapi
          .service("api::order.payments")
          .getNextPayment({
            orderDocumentId: userWithOrder.orders[0].documentId,
            limited: true,
          }),
      };
    },
  };
};
