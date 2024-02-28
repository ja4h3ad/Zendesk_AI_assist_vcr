export default {
  plugins: [
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Access-Control-Request-Private-Network", "true");
          res.setHeader("Access-Control-Allow-Private-Network", "true");
          res.setHeader("Access-Control-Allow-Credentials", "true");

          next();
        });
      },
    },
  ],
  server: {
    headers: {
      "Access-Control-Allow-Private-Network": "true",
    },
    cors: {
      origin: "https://nexmo1700665158.zendesk.com/",
    },
  },
};
