import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import ShiftForm from "../ShiftForm"
import { Employee, EmployeeGroup } from '@prisma/client'

interface ShiftFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: any
  employees: Employee[]
  employeeGroups: EmployeeGroup[]
  onSubmit: (formData: any) => void
  viewType: 'week' | 'day'
  loading: boolean
}

export default function ShiftFormModal({
  isOpen,
  onClose,
  initialData,
  employees,
  employeeGroups,
  onSubmit,
  viewType,
  loading
}: ShiftFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Shift' : 'Create New Shift'}
          </DialogTitle>
        </DialogHeader>
        <ShiftForm
          initialData={initialData}
          employees={employees.map(({ id, firstName, lastName, employeeNo }) => ({
            id,
            firstName,
            lastName,
            employeeNo: employeeNo === null ? undefined : employeeNo,
          }))}
          employeeGroups={employeeGroups}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
          showEmployee={true}
          showStartTime={viewType === 'week'}
          showDate={true}
        />
      </DialogContent>
    </Dialog>
  )
}