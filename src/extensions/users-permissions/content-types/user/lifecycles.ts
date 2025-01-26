export default {
  async afterCreate(event) {
    const { result } = event;
    console.log("result: ", result);

    // const { name, monthPrice, fullPrice } = result;

    // const fullPriceStripeData = await createStripeFullPriceProduct(name);

    // let monthlyStripeData;

    // if (monthPrice) {
    //   monthlyStripeData = await createStripeSubscriptionProduct(name);
    // }

    // await strapi.documents("api::template-course.template-course").update({
    //   documentId: result.documentId,
    //   data: {
    //     stripeProductData: {
    //       stripeProductIdFull: fullPriceStripeData.id,
    //       stripeProductIdMonthly: monthlyStripeData.id,
    //     },
    //   },
    // });
  },
};
