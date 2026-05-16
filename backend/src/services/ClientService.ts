import Client from "../model/Client"
import User from "../model/User"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { type ClientResponse } from "../mappers/client.mapper"
import { type ClientVehicleResponse } from "../mappers/clientVehicle.mapper"
import { type PaginatedClientListResult } from "../types/clients/paginationClientList"
import { ClientEditDTO } from "../dtos/ClientEditDTO"
import { type ClientRow } from "../types/clients/client"


class ClientService {
    async register(data: {
        username: string
        email: string
        cpf: string
        phone: string
        user_id: number
    }): Promise<ServiceResult<{ id: number; username: string }, UserErrorCode>> {
        try {
            const emailExists = await Client.emailExists(data.email)
            if (emailExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.EMAIL_ALREADY_EXISTS,
                        message: "Email já existe",
                    },
                }
            }

            const emailUserExists = await User.emailExists(data.email)
            if(emailUserExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.EMAIL_ALREADY_EXISTS,
                        message: "Email já criado",
                    }
                }
            }

            const cpfExists = await Client.cpfExists(data.cpf)
            if (cpfExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.CPF_ALREADY_EXISTS,
                        message: "CPF já existe",
                    },
                }
            }

            const phoneExists = await Client.phoneExists(data.phone)
            if (phoneExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.PHONE_ALREADY_EXISTS,
                        message: "Telefone já existe",
                    },
                }
            }

            const success = await Client.save(data)
            if (!success) {
                return {
                    status: false,
                    error: {
                    code: UserErrorCode.USER_CREATE_FAILED,
                    message: "Erro ao cadastrar usuário",
                    },
                }
            }

            return { status: true, data: {
                id: success,
                username: data.username
            }}
        } catch (error) {
            console.error("ClientService.register error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_CREATE_FAILED,
                    message: "Erro ao cadastrar usuário",
                },
            }
        }
    } 

    async findClientsByIdUser(user_id: string): Promise<ServiceResult<ClientResponse[], UserErrorCode>> {
        try {
            const clients = await Client.getClientsByUser(user_id)
            if (clients.length === 0) {
                return {
                    status: false,
                    error: {
                    code: UserErrorCode.USER_NOT_FOUND,
                    message: "Clientes não encontrados",
                    },
                }
            }


            return {status: true, data: clients}

        } catch(error) {
            console.error("ClientService.findClientsByIdUser error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro interno ao buscar clientes",
                },
            }
        }
    }

    async findClientsAndVehicle(user_id: string): Promise<ServiceResult<ClientVehicleResponse[], UserErrorCode>> {
        try {
            const clients = await Client.clientAndVehicle(user_id)
            if(clients.length === 0) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Clientes não encontrados"
                    }
                }
            }

            return { status: true, data: clients}
        } catch(error) {
            console.error("ClientService.findClientsAndVehicle error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro interno ao buscar clientes"
                }
            }
        }
    }

    async listClients(user_id: string, page: number, limit: number): Promise<ServiceResult<PaginatedClientListResult | null, UserErrorCode>> {
        try {
            const clients = await Client.list(user_id, page, limit)
            if(clients?.total === 0) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "clientes não encontrados"
                    }
                }
            }

            return { status: true, data: clients}
        } catch(error) {
            console.error("ClientService.listClients error: ", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro interno ao buscar lista de clientes"
                }
            }
        }
    }


    async removeClient(client_id: string): Promise<ServiceResult<{client_id: string }, UserErrorCode>> {
        try {
            const clientExist = await Client.findById(client_id)
            if(!clientExist) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado"
                    }
                }
            }
            const result = await Client.delete(client_id)
            if(!result) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_DELETE_FAILED,
                        message: "Erro ao deletar usuário"
                    }
                }
            }
            return { status: true, data: {client_id}}
        } catch(error) {
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_DELETE_FAILED,
                    message: "Erro interno ao remover usuário"
                }
            }
        }
    }


    async edit(client_id: string, data: ClientEditDTO): Promise<ServiceResult<{ client_id: string }, UserErrorCode>> {
        try {
            const clientExist = await Client.findById(client_id)
            if(!clientExist) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Cliente não encontrado"
                    }
                }
            }

            const emailUserExists = await Client.emailExists(data.email, client_id)
            if(emailUserExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.EMAIL_ALREADY_EXISTS,
                        message: "Email já criado",
                    }
                }
            }

            const cpfExists = await Client.cpfExists(data.cpf, client_id)
            if (cpfExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.CPF_ALREADY_EXISTS,
                        message: "CPF já existe",
                    },
                }
            }

            const phoneExists = await Client.phoneExists(data.phone, client_id)
            if (phoneExists) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.PHONE_ALREADY_EXISTS,
                        message: "Telefone já existe",
                    },
                }
            }


            await Client.update(client_id, data)

            return {
                status: true,
                data: { client_id},
            }

        } catch(error) {
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED, 
                    message: "Erro interno ao editar usuário"
                }
            }
        }
    }

    async findById(id: string): Promise<ServiceResult<ClientRow, UserErrorCode>> {
        try {
            const user = await Client.findById(id)
            if (!user) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado",
                    },
                }
            }

            return {
                status: true,
                data: user
            }
        } catch (error) {
            console.error("ClientService.findById error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro interno ao buscar usuário",
                },
            }
        }
    }
}

export default new ClientService()
