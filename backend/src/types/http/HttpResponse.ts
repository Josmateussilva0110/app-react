export interface HttpResponse<T = unknown> {
  status: boolean
  message: string
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
}
