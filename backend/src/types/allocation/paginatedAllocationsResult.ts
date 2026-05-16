import { AllocationDetail } from "./allocationDetail" 

export interface PaginatedAllocationsResult {
  rows: AllocationDetail[]
  total: number
}
