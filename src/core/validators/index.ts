import { Field } from "../fields"

export type Validator<VT = any, FT = Field> = (value: VT, field: FT) => true | ValidateErrorType

export type ValidateErrorType = string | string[] | Record<string, any>

export function getError(error: true | ValidateErrorType) {
  if (error !== true) return error
}

export function toValidateErrorType(error: ValidateErrorType | undefined) {
  if (error) return error
  return true
}
