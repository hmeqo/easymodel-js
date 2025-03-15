import { Field } from "../fields"

export type Validator<VT = any, FT = Field> = (value: VT, field: FT) => true | ValidateErrorType

export type ValidateErrorType = string | string[] | Record<string, any>
