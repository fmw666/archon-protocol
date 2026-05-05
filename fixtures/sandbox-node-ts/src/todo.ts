export interface Todo {
  id: string
  title: string
  done: boolean
}

export function toggle(todo: Todo): Todo {
  return { ...todo, done: !todo.done }
}
