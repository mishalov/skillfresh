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
  };
};
