/**
 * @openapi
 * tags:
 *   - name: Veículos
 *     description: Rotas relacionadas aos veículos
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Mensagem de erro"
 *
 *     VehicleIdResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             vehicleId:
 *               type: string
 *               example: "uuid-do-veiculo"
 *
 *     VehicleListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         clientId:
 *           type: string
 *         clientName:
 *           type: string
 *         plate:
 *           type: string
 *         vehicleType:
 *           type: string
 *           example: "carro"
 *         brand:
 *           type: string
 *         color:
 *           type: string
 *         isAllocated:
 *           type: boolean
 *         registrationDate:
 *           type: string
 *           format: date-time
 *
 *     VehicleDetail:
 *       type: object
 *       properties:
 *         vehicleId:
 *           type: string
 *         clientId:
 *           type: string
 *         clientName:
 *           type: string
 *         cpf:
 *           type: string
 *         plate:
 *           type: string
 *         vehicleType:
 *           type: integer
 *           example: 1
 *         brand:
 *           type: string
 *         color:
 *           type: string
 */

/**
 * @openapi
 * /vehicle/register:
 *   post:
 *     tags:
 *       - Veículos
 *     summary: Cadastrar veículo
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plate, brand, color, vehicle_type, client_id]
 *             properties:
 *               plate:
 *                 type: string
 *                 example: "ABC-1234"
 *               brand:
 *                 type: string
 *                 example: "Toyota"
 *               color:
 *                 type: string
 *                 example: "Preto"
 *               vehicle_type:
 *                 type: integer
 *                 example: 1
 *               client_id:
 *                 type: string
 *                 example: "uuid-do-cliente"
 *     responses:
 *       201:
 *         description: Veículo cadastrado com sucesso
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
 *                   example: "Veiculo cadastrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicleId:
 *                       type: integer
 *                       example: 42
 *       400:
 *         description: Dados inválidos ou placa já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /vehicles/pagination/{user_id}:
 *   get:
 *     tags:
 *       - Veículos
 *     summary: Listar veículos paginados de um usuário
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-do-usuario"
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
 *         description: Lista de veículos retornada com sucesso
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
 *                         $ref: '#/components/schemas/VehicleListItem'
 *                     total:
 *                       type: integer
 *                       example: 25
 *       404:
 *         description: Nenhum veículo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /vehicle/{id}:
 *   get:
 *     tags:
 *       - Veículos
 *     summary: Buscar detalhes de um veículo
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-do-veiculo"
 *     responses:
 *       200:
 *         description: Detalhes do veículo retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VehicleDetail'
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     tags:
 *       - Veículos
 *     summary: Atualizar veículo
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-do-veiculo"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleDetail'
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VehicleIdResponse'
 *             example:
 *               success: true
 *               message: "Veículo atualizado com sucesso"
 *               data:
 *                 vehicleId: "uuid-do-veiculo"
 *       400:
 *         description: Dados inválidos ou placa já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     tags:
 *       - Veículos
 *     summary: Remover veículo
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-do-veiculo"
 *     responses:
 *       200:
 *         description: Veículo removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VehicleIdResponse'
 *             example:
 *               success: true
 *               message: "Veículo removido com sucesso"
 *               data:
 *                 vehicleId: "uuid-do-veiculo"
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {}
