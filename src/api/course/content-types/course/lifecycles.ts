export default {
  async beforeCreate({ params: { data } }) {
    data.slug = await strapi.plugins[
      "content-manager"
    ].services.uid.generateUIDField({
      contentTypeUID: "api::course.course",
      field: "slug",
      data,
    });
  },
};
