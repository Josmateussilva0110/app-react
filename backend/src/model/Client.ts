import Model from "./Model"
import db from "../database/connection/connection"
import { PgRawResult } from "../types/database/BdResult"
import { type ClientRow } from "../types/clients/client"
import { type ClientAndVehicleRow } from "../types/clients/clientAndVehicle"
import { type ClientResponse } from "../mappers/client.mapper"
import { type ClientVehicleResponse } from "../mappers/clientVehicle.mapper"
import { mapClientRowList } from "../mappers/client.mapper"
import { mapClientVehicleRowList } from "../mappers/clientVehicle.mapper"
import { type ClientList } from "../types/clients/clientList"
import { type PaginatedClientListResult } from "../types/clients/paginationClientList"
import { ClientListDTO } from "../dtos/ClientListDTO"


class Client extends Model<ClientRow> {
    constructor() {
        super("clients")
    }

    async emailExists(email: string, ignoreClientId?: string): Promise<boolean> {
        try {
            const query = db(this.tableName)
                .select("id")
                .where("email", email)

            if (ignoreClientId) {
                query.andWhere("id", "!=", ignoreClientId)
            }

            const result = await query.first()
            return !!result
        } catch (err) {
            console.error(
                `Erro ao verificar e-mail na tabela ${this.tableName}:`,
                err
            )
            return false
        }
    }


    async cpfExists(cpf: string, ignoreClientId?: string): Promise<boolean> {
        try {
            const query = db(this.tableName)
                .select("id")
                .where("cpf", cpf)

            if (ignoreClientId) {
                query.andWhere("id", "!=", ignoreClientId)
            }

            const result = await query.first()
            return !!result
        } catch (err) {
            console.error(
                `Erro ao verificar cpf na tabela ${this.tableName}:`,
                err
            )
            return false
        }
    }

    async phoneExists(phone: string, ignoreClientId?: string): Promise<boolean> {
        try {
            const query = db(this.tableName)
                .select("id")
                .where("phone", phone)

            if (ignoreClientId) {
                query.andWhere("id", "!=", ignoreClientId)
            }

            const result = await query.first()
            return !!result
        } catch (err) {
            console.error(
                `Erro ao verificar telefone na tabela ${this.tableName}:`,
                err
            )
            return false
        }
    }

    async getClientsByUser(user_id: string): Promise<ClientResponse[]> {
        try {
            const result = await db.raw<PgRawResult<ClientRow>>(
            `
            select 
                c.id as client_id, 
                c.username,
                c.cpf,
                c.phone,
                c.email,
                c.status,
                c.updated_at
            from clients c
            where c.user_id = ?
            `,
            [user_id]
            )

            if (!result.rows.length) {
            return []
            }

            return mapClientRowList(result.rows)

        } catch (err) {
            console.error(
            `Erro ao buscar clientes da tabela: ${this.tableName}`,
            err
            )
            return []
        }
    }

    async clientAndVehicle(user_id: string): Promise<ClientVehicleResponse[]> {
        try {
            const result = await db.raw<PgRawResult<ClientAndVehicleRow>>(
                `
                    select 
                        c.id as client_id,
                        c.username,
                        c.phone,
                        c.status as clientStatus,
                        c.updated_at,
                        v.id as vehicle_id,
                        v.plate,
                        v.brand,
                        v.color
                    from clients c
                    inner join vehicles v 
                        on v.client_id = c.id
                    where c.user_id = ?
                    and not exists (
                        select 1
                        from allocations a
                        where a.vehicle_id = v.id
                    )
                    order by c.updated_at desc
                `
                ,[user_id]
            )
            if(!result.rows.length) {
                return []
            }

            return mapClientVehicleRowList(result.rows)
        } catch(err) {
            console.error(
            `Erro ao buscar veiculo de cliente da tabela: ${this.tableName}`, err)
            return []
        }
    }

    async list(id: string, page: number, limit: number): Promise<PaginatedClientListResult | null> {
        const offset = (page - 1) * limit
        try {
            const result = await db.raw<PgRawResult<ClientList>>(
                `   
                select
                    q.client_id,
                    q.username,
                    q.email,
                    q.phone,
                    q.cpf,
                    q.created_at,
                    q.vehicle_count,
                    count(*) over() as total
                from (
                    select
                        c.id as client_id,
                        c.username,
                        c.email,
                        c.phone,
                        c.cpf,
                        c.created_at,
                        count(v.id) as vehicle_count
                    from clients c
                    left join vehicles v
                        on v.client_id = c.id
                    where c.user_id = ?
                    group by
                        c.id,
                        c.username,
                        c.email,
                        c.phone,
                        c.cpf,
                        c.created_at
                ) q
                order by q.created_at desc
                limit ?
                offset ?

                `
                ,[id, limit, offset]
            )

            const rows = result.rows

            if(!rows.length) {
                return { rows: [], total: 0}
            }

            const total = Number(rows[0].total)

            const mapped: ClientListDTO[] = rows.map((row) => ({
                id: row.client_id,
                username: row.username,
                cpf: row.cpf,
                email: row.email,
                phone: row.phone,
                vehicleCount: row.vehicle_count,
                registrationDate: row.created_at
            }))

            return { rows: mapped, total: total}

        } catch(err) {
            console.error(`Erro ao buscar lista de clientes: ", ${this.tableName}`,
        err)
            return null
        }
    }

}


export default new Client()
