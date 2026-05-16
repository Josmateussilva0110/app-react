import swaggerJsdoc, { Options } from "swagger-jsdoc"

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Estacionamento",
      version: "1.0.0",
      description: "Documentação da API",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
  },
  apis: ["src/routes/*.ts", "src/docs/*.ts"],
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
