export default {
  routes: [
    {
      method: "POST",
      path: "/start-course/:templateCourseDocumentId",
      handler: "template-course.startCourse",
    },
  ],
};
