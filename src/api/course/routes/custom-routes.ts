export default {
  routes: [
    {
      method: "GET",
      path: "/course-public/:documentId",
      handler: "course.publicCourse",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/payment-page-data/:courseDocumentId",
      handler: "course.paymentPageData",
      config: {
        auth: false,
      },
    },
  ],
};
