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
  ],
};
