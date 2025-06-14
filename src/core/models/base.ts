import { NotImplementedError, assert_ok } from "@/errors"
import { Field } from "../fields"
import { Serializer } from "../serializers"
import { assignModel, isModel } from "./utils"

export type ModelType<T = any, Base extends typeof BaseModel = typeof BaseModel> = Omit<Base, "init"> & {
  new (): T
  init: Base["init"]
} & Serializer

export type ModelInst<T extends ModelType> = T extends ModelType<infer Type> ? Type : never

export class BaseModel {
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

  toRepresentation() {
    return (this.constructor as typeof BaseModel).toRepresentation(this)
  }

  static isModel(obj: any): obj is BaseModel {
    return isModel(obj)
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

  static override init<T extends Model, CT extends typeof Model = typeof Model>(
    this: CT & { new (): T },
    data?: ModelData<T>
  ) {
    const inst = new this()
    for (const [name, field] of Object.entries(this.fields)) {
      if ((inst as any)[name] === undefined) (inst as any)[name] = field.getDefault()
    }
    if (data) assignModel(inst, data)
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

  static exclude<ThisT, CT extends typeof Model, KeyT extends keyof ThisT = keyof ThisT>(
    this: CT & { new (): ThisT },
    ...fields: KeyT[]
  ): ModelType<ThisT, CT> {
    const oFields = this.fields
    class ExcludeModel extends (this as typeof Model) {
      static fields = Object.fromEntries(Object.entries(oFields).filter(([k]) => !fields.includes(k as KeyT)))
    }
    return ExcludeModel as any
  }

  static include<ThisT, CT extends typeof Model, Fields extends Record<string, Field>>(
    this: CT & { new (): ThisT },
    fields: Fields
  ): ModelType<Omit<ThisT, keyof Fields> & UnwrapFields<Fields>, CT> {
    const oFields = this.fields
    class IncludeModel extends (this as typeof Model) {
      static fields = { ...oFields, ...fields }
    }
    return IncludeModel as any
  }

  static pick<ThisT, CT extends typeof Model, KeyT extends keyof ThisT = keyof ThisT>(
    this: CT & { new (): ThisT },
    ...fields: KeyT[]
  ): ModelType<ThisT, CT> {
    const oFields = this.fields
    class PickModel extends (this as typeof Model) {
      static fields = Object.fromEntries(Object.entries(oFields).filter(([k]) => fields.includes(k as KeyT)))
    }
    return PickModel as any
  }

  override toRepresentation() {
    return (this.constructor as typeof Model).toRepresentation(this)
  }

  static isModel(obj: any): obj is Model {
    return isModel(obj)
  }
}

/**
 * Base class for all model sets.
 */
export class ModelSet<T extends BaseModel = BaseModel> extends Array<T> implements BaseModel {
  declare static model: ModelType

  static init<T extends ModelSet>(this: { new (): T }, data?: any[]) {
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

  toRepresentation() {
    return (this.constructor as typeof ModelSet).toRepresentation(this)
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

  static fromModel<T extends BaseModel>(model: { new (): T }) {
    return class extends ModelSet<T> {
      static override model = model as ModelType
    } as typeof ModelSet<T> & { model: ModelType }
  }

  static isModel(obj: any): obj is ModelSet {
    return isModel(obj)
  }
}
