import { dateField, intField, Model, ModelSet, strField } from "@/index"
import dayjs from "dayjs"

export class User extends Model {
  @intField({ readonly: true }) id!: number
  @strField name!: string
  @strField email!: string
  @intField age: number = 999
  @dateField created_at!: dayjs.Dayjs
  @strField address!: string | null

  whoAmI() {
    return `I'm ${this.name}`
  }
}

export class UserSet extends ModelSet.fromModel(User) {}

export const datetimePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}([+-]\d{2}:\d{2}|Z)/
export const datePattern = /\d{4}-\d{2}-\d{2}/
