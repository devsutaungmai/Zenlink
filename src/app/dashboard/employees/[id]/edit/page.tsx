'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import EmployeeForm from '@/components/EmployeeForm'

interface EmployeeFormData {
  firstName: string
  lastName: string
  birthday: string
  sex: 'MALE' | 'FEMALE' | 'OTHER'
  socialSecurityNo: string
  address: string
  mobile: string
  employeeNo: string
  bankAccount: string
  hoursPerMonth: number
  dateOfHire: string
  isTeamLeader: boolean
  userId: string
  departmentId: string
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [initialData, setInitialData] = useState<EmployeeFormData | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch employee')
        }
        const data = await res.json()
        setInitialData({
          ...data,
          birthday: data.birthday.split('T')[0], 
          dateOfHire: data.dateOfHire.split('T')[0], 
        })
      } catch (error) {
        console.error('Error fetching employee:', error)
        alert('Failed to load employee data')
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [id])

  const handleSubmit = async (formData: EmployeeFormData) => {
    setSubmitLoading(true)
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      alert('Employee updated successfully')
      router.push('/dashboard/employees')
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Failed to update employee')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>
  }

  if (!initialData) {
    return <div className="max-w-4xl mx-auto p-6">Employee not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      <EmployeeForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  )
}
