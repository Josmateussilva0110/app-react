/**
 * @openapi
 * tags:
 *   - name: Clientes
 *     description: Rotas relacionadas aos clientes
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ClientErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Mensagem de erro"
 *
 *     ClientRegisterRequest:
 *       type: object
 *       required: [username, cpf, phone, email, user_id]
 *       properties:
 *         username:
 *           type: string
 *           example: "João Silva"
 *         cpf:
 *           type: string
 *           example: "12345678901"
 *         phone:
 *           type: string
 *           example: "11987654321"
 *         email:
 *           type: string
 *           example: "joao@email.com"
 *         user_id:
 *           type: integer
 *           example: 1
 *
 *     ClientResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         cpf:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         status:
 *           type: integer
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ClientDetail:
 *       type: object
 *       properties:
 *         client_id:
 *           type: integer
 *         username:
 *           type: string
 *         cpf:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         status:
 *           type: integer
 *         user_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     ClientVehicleResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         plate:
 *           type: string
 *         vehicle_id:
 *           type: integer
 *         vehicle:
 *           type: string
 *           description: "marca e cor do veículo"
 *         status:
 *           type: integer
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ClientListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         cpf:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         vehicleCount:
 *           type: integer
 *         registrationDate:
 *           type: string
 *           format: date-time
 *
 *     ClientIdResponse:
 *       type: object
 *       properties:
 *         clientId:
 *           type: integer
 */

/**
 * @openapi
 * /client/register:
 *   post:
 *     tags:
 *       - Clientes
 *     summary: Cadastrar novo cliente
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientRegisterRequest'
 *     responses:
 *       201:
 *         description: Cliente cadastrado com sucesso
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
 *                   example: "Cliente cadastrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "João Silva"
 *       400:
 *         description: Email, CPF ou telefone já existem / dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao cadastrar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 */

/**
 * @openapi
 * /clients/{user_id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar todos os clientes de um usuário
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
 *         description: Lista de clientes retornada com sucesso
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
 *                     $ref: '#/components/schemas/ClientResponse'
 *       404:
 *         description: Nenhum cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao buscar clientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 */

/**
 * @openapi
 * /clients/vehicle/{user_id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar clientes com seus veículos
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
 *         description: Lista de clientes com veículos retornada com sucesso
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
 *                     $ref: '#/components/schemas/ClientVehicleResponse'
 *       404:
 *         description: Nenhum cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao buscar clientes com veículos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 */

/**
 * @openapi
 * /clients/pagination/{user_id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar clientes paginados de um usuário
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *         description: Lista paginada de clientes retornada com sucesso
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
 *                         $ref: '#/components/schemas/ClientListItem'
 *                     total:
 *                       type: integer
 *                       example: 25
 *       404:
 *         description: Nenhum cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao buscar lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 */

/**
 * @openapi
 * /client/{id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Buscar detalhes de um cliente
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
 *         description: Detalhes do cliente retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClientDetail'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao buscar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *
 *   put:
 *     tags:
 *       - Clientes
 *     summary: Atualizar cliente
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
 *             $ref: '#/components/schemas/ClientRegisterRequest'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
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
 *                   example: "Cliente atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     ClientId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Email, CPF ou telefone já existem / dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao atualizar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *
 *   delete:
 *     tags:
 *       - Clientes
 *     summary: Remover cliente
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
 *         description: Cliente removido com sucesso
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
 *                   example: "Cliente removido com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientId:
 *                       type: integer
 *                       example: 1
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 *       500:
 *         description: Erro interno ao remover cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientErrorResponse'
 */
export {}
