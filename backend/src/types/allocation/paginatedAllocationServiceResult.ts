import { AllocationDetailDTO } from "../../dtos/AllocationDetailDTO" 

export interface PaginatedAllocationsServiceResult {
  rows: AllocationDetailDTO[]
  total: number
}
