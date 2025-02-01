export default {
  async index(ctx) {
    const {
      name,
      email,
      whatsapp,
      phone,
      text,
      source,
      contactType,
      telegram,
    } = ctx.request.body;

    const result = await strapi
      .service("api::lead.lead")
      .createFromContactForm({
        data: {
          name,
          email,
          whatsapp,
          telegram,
          phone,
          text,
          source,
          state: "new",
          contactType,
        },
      });

    return {
      status: result.id ? "success" : "error",
    };
  },
};
