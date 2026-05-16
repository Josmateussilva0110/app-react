export interface ServiceResult<T = void, E extends string = string> {
  status: boolean
  data?: T
  error?: {
    code: E
    message?: string
  }
}
