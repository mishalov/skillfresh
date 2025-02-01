/**
 * workshop service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::workshop.workshop",
  ({ strapi }) => ({
    async createWorkshops({
      teacherDocumentIds,
      dates,
      courseDocumentId,
    }: {
      teacherDocumentIds: string[];
      dates: string[];
      courseDocumentId: string;
    }) {
      const teachers = await strapi
        .service("api::teacher.teacher")
        .getTeachers({
          teacherDocumentIds,
        });

      return Promise.all(
        dates.map(async (date) => {
          const workshop = await strapi
            .documents("api::workshop.workshop")
            .create({
              data: {
                date: new Date(date),
                course: courseDocumentId,
                teachers,
              },
            });

          return workshop;
        })
      );
    },
    async getStudentsNextWorkshop(user) {
      const workshop = (
        await strapi.documents("api::workshop.workshop").findMany({
          fields: ["date"],
          filters: {
            date: {
              $gte: new Date(),
            },
            students: {
              documentId: {
                $eq: user.documentId,
              },
            },
          },
          select: ["documentId"],
          limit: 1,
          populate: {
            teacher: {
              fields: ["firstName", "lastName"],
            },
          },
        })
      )[0];

      return workshop;
    },
    async myWorkshops() {
      // const workshops = await strapi.query("api::workshop.workshop").findMany({
      //   filters: {
      //     teachers: {
      //       documentId: {
      //         $in: user.teachers.map((teacher: any) => teacher.documentId),
      //       },
      //     },
      //     date: {
      //       $gte: new Date(),
      //     },
      //   },
      //   select: ["documentId"],
      // });
      // return Promise.all(
      //   workshops.map((workshop) =>
      //     strapi
      //       .service("api::workshop.workshop")
      //       .getPublicWorkshop(workshop.documentId)
      //   )
      // );
    },
  })
);
