import { ValidateErrorType } from "@/index"

export class Serializer {
  toInternalValue(data: unknown): unknown {
    return data
  }

  toRepresentation(data: unknown): unknown {
    return data
  }

  /**
   * Runs the validators for the given value and returns any validation errors found.
   */
  runValidators(value: unknown): ValidateErrorType | undefined {
    return
  }
}
