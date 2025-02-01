export default {
  routes: [
    {
      method: "POST",
      path: "/start-course/:templateCourseDocumentId",
      handler: "template-course.startCourse",
    },
    {
      method: "GET",
      path: "/available-courses/:courseTemplateDocumentId",
      handler: "template-course.availableCourses",
      config: {
        auth: false,
      },
    },
  ],
};
