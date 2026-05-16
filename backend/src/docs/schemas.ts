/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Mateus
 *         email:
 *           type: string
 *           example: mateus@gmail.com
 *         password:
 *           type: string
 *           example: 123456
 *
 *     Vehicle:
 *       type: object
 *       required:
 *         - plate
 *         - vehicleType
 *         - color
 *         - userId
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         plate:
 *           type: string
 *           example: ABC1D23
 *         vehicleType:
 *           type: number
 *           example: 1
 *         color:
 *           type: string
 *           example: Branco
 *         userId:
 *           type: integer
 *           example: 1
 *     
 *    
 */
export {}
