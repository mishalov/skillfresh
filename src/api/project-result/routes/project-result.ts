export default {
  routes: [
    {
      method: "GET",
      path: "/project-result/:documentId",
      handler: "project-result.getSingle",
    },
    {
      method: "PATCH",
      path: "/project-result/:documentId/review",
      handler: "project-result.updateReview",
    },
  ],
};
