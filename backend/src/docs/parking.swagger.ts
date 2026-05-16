/**
 * @openapi
 * tags:
 *   - name: Estacionamentos
 *     description: Rotas relacionadas aos estacionamentos
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ParkingErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Mensagem de erro"
 *
 *     OpeningHours:
 *       type: object
 *       properties:
 *         start:
 *           type: string
 *           example: "08:00"
 *         end:
 *           type: string
 *           example: "18:00"
 *
 *     AddressRequest:
 *       type: object
 *       required: [street, number, district, city, state, zipCode]
 *       properties:
 *         street:
 *           type: string
 *           example: "Rua Principal"
 *         number:
 *           type: string
 *           example: "123"
 *         district:
 *           type: string
 *           example: "Centro"
 *         city:
 *           type: string
 *           example: "São Paulo"
 *         state:
 *           type: string
 *           example: "SP"
 *         zipCode:
 *           type: string
 *           example: "01234567"
 *         complement:
 *           type: string
 *           example: "Apto 101"
 *
 *     ContactsRequest:
 *       type: object
 *       required: [phone, whatsapp, email, openingHours]
 *       properties:
 *         phone:
 *           type: string
 *           example: "1133334444"
 *         whatsapp:
 *           type: string
 *           example: "11987654321"
 *         email:
 *           type: string
 *           example: "contato@estacionamento.com"
 *         openingHours:
 *           $ref: '#/components/schemas/OpeningHours'
 *
 *     OperationsRequest:
 *       type: object
 *       required: [totalSpots, carSpots, hasCameras, hasWashing, areaType]
 *       properties:
 *         totalSpots:
 *           type: integer
 *           example: 100
 *         carSpots:
 *           type: integer
 *           example: 80
 *         motoSpots:
 *           type: integer
 *           example: 10
 *         truckSpots:
 *           type: integer
 *           example: 5
 *         pcdSpots:
 *           type: integer
 *           example: 3
 *         elderlySpots:
 *           type: integer
 *           example: 2
 *         hasCameras:
 *           type: boolean
 *           example: true
 *         hasWashing:
 *           type: boolean
 *           example: true
 *         areaType:
 *           type: string
 *           example: "open"
 *
 *     PricesRequest:
 *       type: object
 *       required: [priceHour, priceExtraHour]
 *       properties:
 *         priceHour:
 *           type: number
 *           example: 15.50
 *         priceExtraHour:
 *           type: number
 *           example: 10.00
 *         dailyRate:
 *           type: number
 *           example: 50.00
 *         monthlyRate:
 *           type: number
 *           example: 400.00
 *         carPrice:
 *           type: number
 *           example: 15.50
 *         motoPrice:
 *           type: number
 *           example: 8.00
 *         truckPrice:
 *           type: number
 *           example: 25.00
 *         nightRate:
 *           type: number
 *           example: 30.00
 *         nightPeriod:
 *           $ref: '#/components/schemas/OpeningHours'
 *
 *     ParkingRegisterRequest:
 *       type: object
 *       required: [parkingName, managerName, address, contacts, operations, prices]
 *       properties:
 *         parkingName:
 *           type: string
 *           example: "Estacionamento Centro"
 *         managerName:
 *           type: string
 *           example: "João Silva"
 *         address:
 *           $ref: '#/components/schemas/AddressRequest'
 *         contacts:
 *           $ref: '#/components/schemas/ContactsRequest'
 *         operations:
 *           $ref: '#/components/schemas/OperationsRequest'
 *         prices:
 *           $ref: '#/components/schemas/PricesRequest'
 *
 *     ParkingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         parkingName:
 *           type: string
 *         managerName:
 *           type: string
 *         createdBy:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ParkingDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         parkingName:
 *           type: string
 *         managerName:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             number:
 *               type: string
 *             district:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *         contacts:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             openingHours:
 *               $ref: '#/components/schemas/OpeningHours'
 *         operations:
 *           type: object
 *           properties:
 *             totalSpots:
 *               type: integer
 *             carSpots:
 *               type: integer
 *             motoSpots:
 *               type: integer
 *             hasCameras:
 *               type: boolean
 *             hasWashing:
 *               type: boolean
 *         prices:
 *           type: object
 *           properties:
 *             priceHour:
 *               type: number
 *
 *     ParkingIdResponse:
 *       type: object
 *       properties:
 *         parkingId:
 *           type: integer
 */

/**
 * @openapi
 * /parking/register:
 *   post:
 *     tags:
 *       - Estacionamentos
 *     summary: Cadastrar novo estacionamento
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParkingRegisterRequest'
 *     responses:
 *       201:
 *         description: Estacionamento cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estacionamento cadastrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     parkingId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Email já existe ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       500:
 *         description: Erro interno ao cadastrar estacionamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 */

/**
 * @openapi
 * /parking/list/{id}:
 *   get:
 *     tags:
 *       - Estacionamentos
 *     summary: Listar estacionamentos paginados do usuário
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista paginada de estacionamentos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rows:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ParkingDetails'
 *                     total:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: Nenhum estacionamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       500:
 *         description: Erro interno ao buscar estacionamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 */

/**
 * @openapi
 * /parking/{id}:
 *   get:
 *     tags:
 *       - Estacionamentos
 *     summary: Buscar detalhes de um estacionamento
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Detalhes do estacionamento retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ParkingDetails'
 *       404:
 *         description: Estacionamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       500:
 *         description: Erro interno ao buscar estacionamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *
 *   put:
 *     tags:
 *       - Estacionamentos
 *     summary: Atualizar estacionamento
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParkingRegisterRequest'
 *     responses:
 *       201:
 *         description: Estacionamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estacionamento editado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     parkingId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Email já existe ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       404:
 *         description: Estacionamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       500:
 *         description: Erro interno ao atualizar estacionamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *
 *   delete:
 *     tags:
 *       - Estacionamentos
 *     summary: Remover estacionamento
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Estacionamento removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estacionamento removido com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     parkingId:
 *                       type: integer
 *                       example: 1
 *       404:
 *         description: Estacionamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       500:
 *         description: Erro interno ao remover estacionamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 */

/**
 * @openapi
 * /parking/names/{user_id}:
 *   get:
 *     tags:
 *       - Estacionamentos
 *     summary: Listar nomes dos estacionamentos do usuário
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Lista de nomes dos estacionamentos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParkingResponse'
 *       404:
 *         description: Nenhum estacionamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 *       500:
 *         description: Erro interno ao buscar estacionamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingErrorResponse'
 */
export {}
