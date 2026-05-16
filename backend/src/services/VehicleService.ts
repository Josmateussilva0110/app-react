import Vehicle from "../model/Vehicle"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { VehicleErrorCode } from "../types/code/vehicleCode"
import { type PaginatedVehicleListResult } from "../types/vehicles/paginationVehicleList"
import { VehicleEditDTO } from "../dtos/VehicleEditDTO"


class ClientService {
    async registerVehicle(data: {
        plate: string
        brand: string
        color: string
        vehicle_type: number
        client_id: string
    }): Promise<ServiceResult<{ vehicleId: number }, VehicleErrorCode>> {
        try {
            const plateExists = await Vehicle.plateExists(data.plate)
            if (plateExists) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.PLATE_ALREADY_EXISTS,
                        message: "Essa placa já existe",
                    },
                }
            }

            const success = await Vehicle.save(data)
            if (!success) {
                return {
                    status: false,
                    error: {
                    code: VehicleErrorCode.VEHICLE_CREATE_FAILED,
                    message: "Erro ao cadastrar veiculo",
                    },
                }
            }

            return { status: true, data: {
                vehicleId: success
            }}
        } catch (error) {
            console.error("ClientService.registerVehicle error:", error)

            return {
                status: false,
                error: {
                    code: VehicleErrorCode.VEHICLE_CREATE_FAILED,
                    message: "Erro ao cadastrar veiculo",
                },
            }
        }
    } 


    async listVehicles(user_id: string, page: number, limit: number): Promise<ServiceResult<PaginatedVehicleListResult | null, VehicleErrorCode>> {
        try {
            const result = await Vehicle.listPagination(user_id, page, limit)
            if(result?.total === 0) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.VEHICLE_NOT_FOUND,
                        message: "Nenhum veículo encontrado"
                    }
                }
            }

            return { status: true, data: result }
        } catch(error) {
            console.error("ClientService.listVehicles: ", error)
            return {
                status: false,
                error: {
                    code: VehicleErrorCode.VEHICLE_FETCH_FAILED,
                    message: "Erro interno ao buscar veículos"
                }
            }
        }
    }

    async removeVehicle(vehicle_id: string): Promise<ServiceResult<{vehicle_id: string }, VehicleErrorCode>> {
        try {
            const vehicleExist = await Vehicle.findById(vehicle_id)
            if(!vehicleExist) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.VEHICLE_NOT_FOUND,
                        message: "Veículo não encontrado"
                    }
                }
            }
            const result = await Vehicle.delete(vehicle_id)
            if(!result) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.VEHICLE_DELETE_FAILED,
                        message: "Erro ao deletar veículo"
                    }
                }
            }
            return { status: true, data: {vehicle_id}}
        } catch(error) {
            return {
                status: false,
                error: {
                    code: VehicleErrorCode.VEHICLE_DELETE_FAILED,
                    message: "Erro interno ao remover veículo"
                }
            }
        }
    }


    async vehicleDetail(vehicle_id: string): Promise<ServiceResult<VehicleEditDTO, VehicleErrorCode>> {
        try {
            const vehicle = await Vehicle.vehicleDetail(vehicle_id)
            if(!vehicle) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.VEHICLE_NOT_FOUND,
                        message: "Veículo não encontrado",
                    },
                }
            }

            return { status: true, data: vehicle}
        } catch(error) {
            console.error("ClientService.vehicleDetail: ", error)
            return {
                status: false,
                error: {
                    code: VehicleErrorCode.VEHICLE_FETCH_FAILED,
                    message: "Erro interno ao buscar detalhes de veículo",
                }
            }
        }
    }

    async editVehicle(vehicle_id: string, data: VehicleEditDTO): Promise<ServiceResult<{ vehicle_id: string }, VehicleErrorCode>> {
        try {
            const vehicleExist = await Vehicle.findById(vehicle_id)
            if(!vehicleExist) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.VEHICLE_NOT_FOUND,
                        message: "Veículo não encontrado"
                    }
                }
            }

            const plateExists = await Vehicle.plateExists(data.plate, vehicle_id)
            if (plateExists) {
                return {
                    status: false,
                    error: {
                        code: VehicleErrorCode.PLATE_ALREADY_EXISTS,
                        message: "Essa placa já existe",
                    },
                }
            }


           await Vehicle.update(vehicle_id, data)

            return {
                status: true,
                data: { vehicle_id},
            }

        } catch(error) {
            return {
                status: false,
                error: {
                    code: VehicleErrorCode.VEHICLE_UPDATE_FAILED, 
                    message: "Erro interno ao editar veículo"
                }
            }
        }
    }
}

export default new ClientService()
