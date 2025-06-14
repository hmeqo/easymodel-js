import { getConstructor } from "@/utils"
import { BaseModel, Model } from "./base"

export function modelToRaw<T = any>(model: BaseModel | BaseModel[]): T {
  if ("map" in model) {
    return model.map((x) => modelToRaw(x)) as T
  }
  const rawObj: Record<string, unknown> = {}
  for (const k in getConstructor<typeof Model>(model).fields) {
    const value = model[k as keyof typeof model] as unknown
    if (value !== undefined && value !== null && getConstructor(value).fields)
      rawObj[k] = modelToRaw(value as BaseModel)
    else rawObj[k] = value
  }
  return rawObj as T
}

export function assignModel<T extends BaseModel>(model: T, data: any) {
  Object.assign(model, getConstructor<typeof BaseModel>(model).toInternalValue(data))
}

export function isModel(value: any): value is BaseModel {
  return !!value.toRepresentation
}
