import Stripe from "stripe";

export const stripeApi = new Stripe(process.env.STRIPE_KEY);

export const createStripeFullPriceProduct = async (
  courseTemplateName: string
) => {
  const product = await stripeApi.products.create({
    name: `${courseTemplateName} FullPrice`,
    expand: ["default_price"],
    active: true,
  });

  return product;
};

export const createStripeSubscriptionProduct = async (
  courseTemplateName: string
) => {
  const product = await stripeApi.products.create({
    active: true,
    name: `${courseTemplateName} MonthlyPayment`,
    expand: ["default_price"],
  });

  return product;
};

export const createMonthPriceStripe = async ({ monthPrice, productId }) => {
  if (!productId) {
    throw new Error(
      "createMonthPriceStripe: Product id is required to create a price"
    );
  }

  const price = await stripeApi.prices.create({
    active: true,
    unit_amount: monthPrice.amount * 100,
    currency: monthPrice.currency,
    product: productId,
    transfer_lookup_key: true,
    recurring: {
      interval: "month",
    },
  });

  return price;
};

export const createFullPriceStripe = async ({ fullPrice, productId }) => {
  if (!productId) {
    throw new Error(
      "createFullPriceStripe: Product id is required to create a price"
    );
  }

  const price = await stripeApi.prices.create({
    active: true,
    unit_amount: fullPrice.amount * 100,
    currency: fullPrice.currency,
    product: productId,
  });

  return price;
};

// export const syncStripeMonthPrice = async ({
//   monthPrice,
//   courseTemplateDocumentId,
//   stripeProductIdMonthly,
//   stripePriceIdMonthly,
// }) => {
//   let priceMonthlyInStripe =
//     await stripeApi.prices.retrieve(stripePriceIdMonthly);

//   if (monthPrice) {
//     if (monthPrice.amount * 100 !== priceMonthlyInStripe?.unit_amount) {
//       if (priceMonthlyInStripe) {
//         await stripeApi.prices.update(priceMonthlyInStripe.id, {
//           metadata: {
//             templateCourseDocumentId: courseTemplateDocumentId,
//             outdated: new Date().toISOString(),
//           },
//         });
//       }

//       priceMonthlyInStripe = (
//         await createMonthPriceStripe({
//           monthPrice,
//           productId: stripeProductIdMonthly,
//         })
//       ).price;
//     }
//   } else {
//     if (priceMonthlyInStripe) {
//       await outdatePrice(priceMonthlyInStripe.id, courseTemplateDocumentId);
//     }
//   }
// };

// export const syncStripeFullPrice = async ({
//   fullPrice,
//   courseTemplateDocumentId,
//   stripePriceIdFull,
// }) => {
//   const stripeFullPrice = await stripeApi.prices.retrieve(stripePriceIdFull);

//   if (stripeFullPrice.unit_amount !== fullPrice.amount * 100) {
//     await createFullPriceStripe({
//       fullPrice,
//       productId: stripeFullPrice.product,
//     });

//     await outdatePrice(stripeFullPrice.id, courseTemplateDocumentId);
//   }
// };
