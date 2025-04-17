'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import EmployeeGroupForm from '@/components/EmployeeGroupForm'

interface EmployeeGroupFormData {
  name: string
  description: string
  departmentId: string
  memberIds: string[]
}

export default function EditEmployeeGroupPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [initialData, setInitialData] = useState<EmployeeGroupFormData | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/employee-groups/${id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch employee group')
        }
        const data = await res.json()
        setInitialData({
          name: data.name || '',
          description: data.description || '',
          departmentId: data.department?.id || '',
          memberIds: data.members?.map((m: any) => m.id) || [],
        })
      } catch (error) {
        console.error('Error fetching employee group:', error)
        alert('Failed to load employee group data')
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [id])

  const handleSubmit = async (formData: EmployeeGroupFormData) => {
    setSubmitLoading(true)
    try {
      const res = await fetch(`/api/employee-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to update employee group')
      }
      alert('Employee group updated successfully')
      router.push('/dashboard/employee-groups')
      router.refresh()
    } catch (error) {
      console.error('Error updating employee group:', error)
      alert('Failed to update employee group')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>
  }

  if (!initialData) {
    return <div className="max-w-4xl mx-auto p-6">Employee group not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Employee Group</h1>
      <EmployeeGroupForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  )
}
