import { getConstructor } from "@/utils"
import cloneDeep from "lodash/cloneDeep.js"
import { BaseModel, Model, ModelSet } from "./base"

export function cloneModel<T>(model: T): T {
  const newObj = cloneDeep(model) as BaseModel
  if (newObj.errors) delete newObj.errors
  return newObj as T
}

export function modelToRaw<T = any>(model: BaseModel): T {
  if (model instanceof ModelSet) {
    return model.map((x) => modelToRaw(x)) as T
  }
  const rawObj: Record<string, unknown> = {}
  for (const k in getConstructor<typeof Model>(model).fields) {
    const value = model[k as keyof typeof model]
    if (value !== undefined && value !== null && getConstructor(value).fields) rawObj[k] = modelToRaw(value)
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
