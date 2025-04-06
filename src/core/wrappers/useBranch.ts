import { BaseModel, cloneModel } from "@/index"
import { merge } from "lodash"

/**
 * The `ModelBranch` class represents a branch of data in a model.
 * It provides methods for managing the state of the model, including backup, restore, copy, and merge operations.
 */
export class ModelBranch<T extends BaseModel> {
  $lastSnapshot?: T
  $master?: ModelBranch<T>

  constructor(public $model: T) {
    this.$snapshot()
  }

  /**
   * Creates a snapshot of the current state of the model.
   */
  $snapshot() {
    return (this.$lastSnapshot = cloneModel(this.$model))
  }

  /**
   * Restores the model instance to the state of the snapshot.
   */
  $rollback() {
    if (!this.$lastSnapshot) return
    this.$resetFrom(this.$lastSnapshot)
  }

  /**
   * Resets the model instance using the provided data.
   */
  $resetFrom(model: T) {
    Object.assign(this.$model, cloneModel(model))
  }

  /**
   * Creates a copy of this branch, including its default data and master branch.
   */
  $copy() {
    const newBranch = useBranch<T>(cloneModel(this.$model))
    newBranch.$master = this.$master
    return newBranch
  }

  /**
   * Creates a new branch based on this branch.
   */
  $newBranch() {
    const newBranch = useBranch<T>(cloneModel(this.$model))
    newBranch.$master = this
    return newBranch
  }
  /**
   * Merges this branch with another branch.
   */
  $merge(other: ModelBranch<T>, opts?: { chain?: boolean }) {
    this.$resetFrom(other.$model)
    if (opts?.chain) this.$apply(opts)
  }

  /**
   * Applies the changes in this branch to the master branch.
   */
  $apply(opts?: { chain?: boolean }) {
    this.$master?.$merge(this, merge({ chain: true }, opts))
  }
}

export type Branch<T extends BaseModel> = T & ModelBranch<T>

/**
 * Creates a new branch based on the given model.
 */
export function useBranch<T extends BaseModel>(model: T): Branch<T> {
  return new Proxy(new ModelBranch(model), {
    get(target, prop: keyof ModelBranch<T>) {
      if (prop in target.$model) return (target.$model as Record<string | symbol, unknown>)[prop]
      else return target[prop]
    },
    set(target, prop: keyof ModelBranch<T>, value) {
      if (prop in target.$model) (target.$model as Record<string | symbol, unknown>)[prop] = value
      else target[prop] = value
      return true
    }
  }) as Branch<T>
}
