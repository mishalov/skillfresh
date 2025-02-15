import { Core, Data, Schema } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    async assignProject({
      studentDocumentId,
      projectDocumentId,
    }: {
      studentDocumentId: string;
      projectDocumentId: string;
    }) {
      const student = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: studentDocumentId,
          populate: ["projectResults"],
        });

      if (!student) {
        throw new Error("Student not found");
      }

      const project = await strapi.documents("api::project.project").findOne({
        documentId: projectDocumentId,
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const projectResult = await strapi
        .documents("api::project-result.project-result")
        .create({
          data: {
            project,
            student,
            state: "In Progress",
            revealed: true,
          },
        });

      return strapi.documents("plugin::users-permissions.user").update({
        documentId: studentDocumentId,
        data: {
          projectResults: [...student.projectResults, projectResult],
        },
        populate: {
          projectResults: {
            populate: ["project"],
          },
        },
      });
    },
  };
};
