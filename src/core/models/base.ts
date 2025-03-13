import { NotImplementedError, assert_ok } from "@/errors"
import { Field, Serializer, ValidateErrorType } from "@/index"
import { assign } from "@/utils"

export type ModelType<T = any, Base extends typeof BaseModel = typeof BaseModel> = Omit<Base, "init"> & {
  new (): T
  init: ((data?: any) => T) & Base["init"]
} & Serializer

export type ModelInst<T extends ModelType> = T extends ModelType<infer Type> ? Type : never

export class BaseModel {
  /**
   * An object containing any validation errors found.
   */
  errors?: any

  /**
   * Creates a new instance of the class using the provided data.
   */
  static init(data?: any): any {
    throw new NotImplementedError()
  }

  static toInternalValue(data: any): any {
    throw new NotImplementedError()
  }

  static toRepresentation(data: any): any {
    throw new NotImplementedError()
  }

  /**
   * Runs the validators for each field in the model and returns any errors found.
   */
  static runValidators(value: any): any {
    throw new NotImplementedError()
  }

  toRepresentation() {
    return (this.constructor as typeof BaseModel).toRepresentation(this)
  }

  /**
   * Runs the validators for the current model instance and returns any validation errors found.
   */
  runValidators(): ValidateErrorType | undefined {
    return (this.constructor as typeof BaseModel).runValidators(this)
  }

  /**
   * Validates the current instance whether the instance is valid or not.
   */
  validate(): boolean {
    this.errors = this.runValidators()
    return !Object.keys(this.errors ?? {}).length
  }
}

export type UnwrapFields<T> = { [K in keyof T]: T[K] extends Field<infer Type> ? Type : T[K] }

export type ModelFields<T> = Omit<
  Pick<T, { [K in keyof T]: T[K] extends () => any ? never : K }[keyof T]>,
  keyof BaseModel
>

export type ModelData<T extends Model> = Partial<ModelFields<T>> & Record<string, any>

/**
 * Base class for all models.
 */
export class Model extends BaseModel {
  static fields: Record<string, Field> = {}

  declare errors?: Record<string, any>

  static override init<T extends Model>(this: new () => T, data?: ModelData<T>) {
    const inst = new this()
    for (const [name, field] of Object.entries((this as unknown as typeof Model).fields)) {
      if ((inst as any)[name] === undefined) (inst as any)[name] = field.default
    }
    if (data) assign(inst, (this as unknown as typeof Model).toInternalValue(data))
    return inst
  }

  static override toInternalValue(data: any): any {
    const obj: Record<string, any> = {}
    for (const [name, field] of Object.entries(this.fields)) {
      field.setInternalValueToObj(obj, name, data)
    }
    return obj
  }

  static override toRepresentation(data: any) {
    const obj: Record<string, any> = {}
    for (const [name, field] of Object.entries(this.fields)) {
      field.setRepresentationToObj(obj, name, data)
    }
    return obj
  }

  static override runValidators(value: any) {
    const errors: Record<string, any> = {}
    for (const [name, field] of Object.entries(this.fields)) {
      let error
      if ((error = field.runValidators(value[name])) !== undefined) {
        errors[name] = error
      }
    }
    if (!Object.keys(errors).length) return
    return errors
  }

  static exclude<ThisT, KeyT extends keyof ThisT = keyof ThisT>(
    this: new () => ThisT,
    ...fields: KeyT[]
  ): ModelType<Omit<ThisT, KeyT>, typeof Model> {
    const ModelClass = this as unknown as typeof Model
    return class extends ModelClass {
      static fields = Object.fromEntries(Object.entries(ModelClass.fields).filter(([k]) => !fields.includes(k as KeyT)))
    } as any
  }

  static include<ThisT, Fields extends Record<string, Field>>(
    this: new () => ThisT,
    fields: Fields
  ): ModelType<Omit<ThisT, keyof Fields> & UnwrapFields<Fields>, typeof Model> {
    const ModelClass = this as unknown as typeof Model
    return class extends ModelClass {
      static fields = { ...ModelClass.fields, ...fields }
    } as any
  }

  override toRepresentation() {
    return (this.constructor as typeof Model).toRepresentation(this)
  }

  override runValidators() {
    return (this.constructor as typeof Model).runValidators(this)
  }

  override validate(): boolean {
    this.errors = this.runValidators()
    return !Object.keys(this.errors ?? {}).length
  }
}

/**
 * Base class for all model sets.
 */
export class ModelSet<T extends BaseModel = BaseModel> extends Array<T> implements BaseModel {
  declare static model: ModelType
  declare errors?: ValidateErrorType[]

  static init<T extends ModelSet>(this: new () => T, data?: any[]) {
    const inst = new this()
    if (data) inst.push(...((this as unknown as typeof ModelSet).toInternalValue(data) as T[]))
    return inst
  }

  static toInternalValue(data: any[]): any[] {
    assert_ok(Array.isArray(data), `Param data must be an array: ${data}`)
    return data.map((x) => (x instanceof this.model ? x : this.model.init(x)))
  }

  static toRepresentation<T extends BaseModel>(data: ModelSet<T>) {
    return data.map((x) => x.toRepresentation())
  }

  static runValidators(value: ModelSet) {
    const errors = value.map((x) => x.runValidators()).filter((x) => x !== undefined) as ValidateErrorType[]
    if (!Object.keys(errors).length) return
    return errors
  }

  toRepresentation() {
    return (this.constructor as typeof ModelSet).toRepresentation(this)
  }

  runValidators() {
    return (this.constructor as typeof ModelSet).runValidators(this)
  }

  validate(): boolean {
    this.errors = this.runValidators()
    return !Object.keys(this.errors ?? {}).length
  }

  /**
   * Bind this model set to a model.
   * @function
   */
  static get bind() {
    return (target: ModelType) => {
      this.model = target
    }
  }

  static fromModel<T extends BaseModel>(model: new () => T) {
    return class extends ModelSet<T> {
      static model = model as ModelType
    }
  }
}
