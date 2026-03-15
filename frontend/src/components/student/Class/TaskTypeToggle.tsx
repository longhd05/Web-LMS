type TaskType = 'READING' | 'INTEGRATION'

interface TaskTypeToggleProps {
  taskType: TaskType
  onChange: (taskType: TaskType) => void
}

export default function TaskTypeToggle({ taskType, onChange }: TaskTypeToggleProps) {
  return (
    <div className="mx-auto mb-6 flex w-full max-w-[380px] overflow-hidden rounded-full border-2 border-[#8be9a0] bg-[#f5fffd]">
      <button
        onClick={() => onChange('READING')}
        className={`w-1/2 py-2 text-xl font-extrabold ${
          taskType === 'READING'
            ? 'rounded-full border border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white'
            : 'text-[#1f3f8f]'
        }`}
      >
        Đọc hiểu
      </button>
      <button
        onClick={() => onChange('INTEGRATION')}
        className={`w-1/2 py-2 text-xl font-extrabold ${
          taskType === 'INTEGRATION'
            ? 'rounded-full border border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white'
            : 'text-[#1f3f8f]'
        }`}
      >
        Tích hợp
      </button>
    </div>
  )
}
