export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("TEST_DATABASE_HOST", "localhost"),
      port: env.int("TEST_DATABASE_PORT", 5432),
      database: env("TEST_DATABASE_NAME", "strapi-test"),
      user: env("TEST_DATABASE_USERNAME", "strapi-test"),
      password: env("TEST_DATABASE_PASSWORD", "strapi-test"),
      ssl: env.bool("TEST_DATABASE_SSL", false),
    },
  },
});
