import { dateField, integerField, Model, ModelSet, stringField } from "@/index"
import dayjs from "dayjs"

export class User extends Model {
  @integerField({ readonly: true }) id!: number
  @stringField name!: string
  @stringField({ validators: [(v) => /^\S+@\S+\.\S+$/.test(v) || "Invalid email"] }) email!: string
  @integerField age: number = 999
  @dateField created_at!: dayjs.Dayjs

  whoAmI() {
    return `I'm ${this.name}`
  }
}

export class UserSet extends ModelSet.fromModel(User) {}

export const datetimePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}Z/
export const datePattern = /\d{4}-\d{2}-\d{2}/
