import React from "react"

interface ShiftGridCardProps {
  shift: Shift
  employeeId: string
  onApprove: (shiftId: string) => void
  onEdit: (shift: Shift) => void
  onDragStart: (e: React.DragEvent, shift: Shift, employeeId: string) => void
  onDragEnd: (e: React.DragEvent) => void
}

export default function ShiftGridCard({
  shift,
  employeeId,
  onApprove,
  onEdit,
  onDragStart,
  onDragEnd,
}: ShiftGridCardProps) {
  return (
    <div
      className={`relative rounded-lg border shadow-md bg-white px-3 py-2 text-sm transition group cursor-grab
        ${shift.approved
          ? "border-green-300 bg-green-50 text-green-900"
          : "border-gray-300 bg-gray-50 text-gray-900"}
        hover:shadow-lg`}
      draggable
      onDragStart={e => onDragStart(e, shift, employeeId)}
      onDragEnd={onDragEnd}
      onClick={() => window.location.href = `/dashboard/shifts/${shift.id}/edit`}
      style={{ fontSize: '12px', lineHeight: '16px', minWidth: 0 }}
    >
      {/* Shift Details */}
      <div className="font-semibold truncate">
        {shift.startTime.substring(0, 5)} - {shift.endTime ? shift.endTime.substring(0, 5) : 'Active'}
      </div>
      {shift.employeeGroup && (
        <div className="text-xs mt-1 opacity-75 truncate">{shift.employeeGroup.name}</div>
      )}
      <div className="text-xs mt-1">
        {shift.approved ? (
          <span className="inline-flex items-center gap-1 text-green-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-yellow-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Pending
          </span>
        )}
      </div>

      {/* Mini Actions - vertical stack */}
      <div className="absolute top-1 right-1 flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition">
        {!shift.approved && (
          <button
            onClick={e => {
              e.stopPropagation();
              onApprove(shift.id);
            }}
            className="text-green-600 hover:text-green-800"
            title="Approve Shift"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </button>
        )}
        <button
          onClick={e => {
            e.stopPropagation();
            onEdit(shift);
          }}
          className="text-blue-600 hover:text-blue-800"
          title="Edit Shift"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 3.487a2.25 2.25 0 113.182 3.182L6.75 19.964l-4.5.75.75-4.5 13.862-13.727z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}