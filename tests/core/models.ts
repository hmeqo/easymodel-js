import { Model, ModelSet, dateTimeField, integerField, stringField } from "@/index"

export class User extends Model {
  @integerField({ readonly: true }) id!: number
  @stringField name!: string
  @stringField({ validators: [(v) => /^\S+@\S+\.\S+$/.test(v) || "Invalid email"] }) email!: string
  @integerField age: number = 999
  @dateTimeField created_at!: Date
}

export class UserSet extends ModelSet.fromModel(User) {}
