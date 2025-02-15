export default {
  routes: [
    {
      method: "GET",
      path: "/student/dashboard",
      handler: "student.getDashboard",
    },
    {
      method: "POST",
      path: "/student/:documentId/assign-project",
      handler: "student.assignProject",
    },
  ],
};
