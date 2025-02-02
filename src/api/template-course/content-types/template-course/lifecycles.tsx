import { Core } from "@strapi/strapi";
import {
  createStripeFullPriceProduct,
  createStripeSubscriptionProduct,
} from "../../../../services/StripeApi";

export default {
  async afterCreate(event) {
    const { result } = event;

    const { name, monthPrice, fullPrice } = result;

    const fullPriceStripeData = await createStripeFullPriceProduct(name);
    console.log("fullPriceStripeData: ", fullPriceStripeData);

    let monthlyStripeData;

    if (monthPrice) {
      monthlyStripeData = await createStripeSubscriptionProduct(name);
    }

    await strapi.documents("api::template-course.template-course").update({
      documentId: result.documentId,
      data: {
        stripeProductData: {
          stripeProductIdFull: fullPriceStripeData.id,
          stripeProductIdMonthly: monthlyStripeData?.id,
        },
      },
    });
  },
};
