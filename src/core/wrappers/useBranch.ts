import defu from "defu"
import cloneDeep from "lodash/cloneDeep.js"

/**
 * The `ModelBranch` class represents a branch of data in a model.
 * It provides methods for managing the state of the model, including backup, restore, copy, and merge operations.
 */
export class Branch<T extends object> {
  $lastSnapshot?: T
  $master?: Branch<T>

  constructor(public $model: T) {
    this.$snapshot()
  }

  /**
   * Creates a snapshot of the current state of the model.
   */
  $snapshot() {
    return (this.$lastSnapshot = cloneDeep(this.$model))
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
    Object.assign(this.$model, cloneDeep(model))
  }

  /**
   * Creates a copy of this branch, including its default data and master branch.
   */
  $copy() {
    const newBranch = useBranch<T>(cloneDeep(this.$model))
    newBranch.$master = this.$master
    return newBranch
  }

  /**
   * Creates a new branch based on this branch.
   */
  $newBranch() {
    const newBranch = useBranch<T>(cloneDeep(this.$model))
    newBranch.$master = this
    return newBranch
  }
  /**
   * Merges this branch with another branch.
   */
  $merge(other: Branch<T>, opts?: { chain?: boolean }) {
    this.$resetFrom(other.$model)
    if (opts?.chain) this.$apply(opts)
  }

  /**
   * Applies the changes in this branch to the master branch.
   */
  $apply(opts?: { chain?: boolean }) {
    this.$master?.$merge(this, defu({ chain: true }, opts))
  }
}

export type ProxyBranch<T extends object> = T & Branch<T>

/**
 * Creates a new branch based on the given model.
 */
export function useBranch<T extends object>(model: T) {
  return new Proxy(new Branch(model), {
    get(target, prop: keyof Branch<T>) {
      if (prop in target.$model) return (target.$model as Record<string | symbol, unknown>)[prop]
      else return target[prop]
    },
    set(target, prop: keyof Branch<T>, value) {
      if (prop in target.$model) (target.$model as Record<string | symbol, unknown>)[prop] = value
      else target[prop] = value
      return true
    }
  }) as ProxyBranch<T>
}
