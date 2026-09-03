import type { Task } from "./types/task.type";

export function KanbanCard({ task }: { task: Task }) {
  return (
    <div className="bg-white p-2 m-2 rounded shadow schibsted-grotesk">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      {task.dueDate && <p>Due: {task.dueDate.toLocaleDateString()}</p>}
      {task.tag && <span className="bg-blue-200 p-1 rounded">{task.tag.name}</span>}
    </div>
  );
}