module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8082),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '58f118afe4aabd9ad7d04cbc02baba0f'),
    },
  },
});
