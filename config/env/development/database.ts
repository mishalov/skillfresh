export default ({ env }) => ({
	connection: {
		client: 'postgres',
		connection: {
		host: env('DATABASE_HOST', 'localhost'),
			port: env.int('DATABASE_PORT', 5432),
			database: env('DATABASE_NAME', 'strapi-test'),
			user: env('DATABASE_USERNAME', 'strapi-test'),
			password: env('DATABASE_PASSWORD', 'strapi-test'),
			ssl: env.bool('DATABASE_SSL', false)
		}
	}
});
