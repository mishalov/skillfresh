const setOrderNumber = async (event) => {
  const lastDocument = (
    await strapi.documents("api::order.order").findMany({
      filters: {
        orderNumber: {
          $ne: null,
        },
      },
      sort: "orderNumber:desc",
      limit: 1,
    })
  )?.[0];

  event.params.data.orderNumber = lastDocument?.orderNumber + 1 || 1;
};

export default {
  async beforeCreate(event) {
    await setOrderNumber(event);
  },
};
