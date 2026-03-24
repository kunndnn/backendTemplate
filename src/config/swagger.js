import swaggerJSDoc from "swagger-jsdoc";
const url = `${process.env.BASE_URL}/api/v1` || "http://localhost:3000/api/v1"
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend Template API",
      version: "1.0.0",
      description: "API documentation for the Backend Template project",
    },
    servers: [
      {
        url ,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/**/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
