'use client'

import React, { useState, useEffect } from 'react'
import Select from 'react-select'

interface EmployeeGroupFormData {
  name: string
  description: string
  departmentId: string
  memberIds: string[]
}

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface Department {
  id: string
  name: string
}

interface EmployeeGroupFormProps {
  initialData?: EmployeeGroupFormData
  onSubmit: (data: EmployeeGroupFormData) => void
  loading: boolean
}

export default function EmployeeGroupForm({ initialData, onSubmit, loading }: EmployeeGroupFormProps) {
  const [formData, setFormData] = useState<EmployeeGroupFormData>(
    initialData || {
      name: '',
      description: '',
      departmentId: '',
      memberIds: [],
    }
  )
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, deptsRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/departments'),
        ])
        if (!employeesRes.ok) {
          throw new Error(`Employees fetch failed: ${employeesRes.status} ${employeesRes.statusText}`)
        }
        if (!deptsRes.ok) {
          throw new Error(`Departments fetch failed: ${deptsRes.status} ${deptsRes.statusText}`)
        }
        const employeesData = await employeesRes.json()
        const deptsData = await deptsRes.json()
        setEmployees(employeesData)
        setDepartments(deptsData)
      } catch (error) {
        console.error('Error fetching employees or departments:', error)
      }
    }
    fetchData()
  }, [])

  const handleDepartmentSelect = (selected: { value: string; label: string } | null) => {
    setFormData({ ...formData, departmentId: selected ? selected.value : '' })
  }

  const handleMembersSelect = (selected: { value: string; label: string }[] | null) => {
    setFormData({ ...formData, memberIds: selected ? selected.map(s => s.value) : [] })
  }

  const employeeOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.firstName} ${employee.lastName}`,
  }))

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name,
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <Select
            options={departmentOptions}
            onChange={handleDepartmentSelect}
            placeholder="Select department..."
            value={departmentOptions.find(option => option.value === formData.departmentId) || null}
            isClearable
            className="mt-1"
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#d1d5db',
                padding: '0.25rem',
                '&:hover': { borderColor: '#d1d5db' },
                boxShadow: 'none',
                borderRadius: '0.375rem',
                '&:focus-within': {
                  borderColor: '#31BCFF',
                  boxShadow: '0 0 0 1px #31BCFF',
                },
              }),
              input: (base) => ({
                ...base,
                padding: 0,
                margin: 0,
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '0.375rem',
                marginTop: '0.25rem',
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected ? '#31BCFF' : isFocused ? '#f0f9ff' : 'white',
                color: isSelected ? 'white' : '#374151',
                padding: '0.5rem 0.75rem',
              }),
            }}
            noOptionsMessage={() => 'No departments available'}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            rows={4}
          />
        </div>



        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Members
          </label>
          <Select
            isMulti
            options={employeeOptions}
            onChange={handleMembersSelect}
            placeholder="Select members..."
            value={employeeOptions.filter(option => formData.memberIds.includes(option.value))}
            isClearable
            className="mt-1"
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#d1d5db',
                padding: '0.25rem',
                '&:hover': { borderColor: '#d1d5db' },
                boxShadow: 'none',
                borderRadius: '0.375rem',
                '&:focus-within': {
                  borderColor: '#31BCFF',
                  boxShadow: '0 0 0 1px #31BCFF',
                },
              }),
              input: (base) => ({
                ...base,
                padding: 0,
                margin: 0,
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '0.375rem',
                marginTop: '0.25rem',
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected ? '#31BCFF' : isFocused ? '#f0f9ff' : 'white',
                color: isSelected ? 'white' : '#374151',
                padding: '0.5rem 0.75rem',
              }),
            }}
            noOptionsMessage={() => 'No employees available'}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#31BCFF] border border-transparent rounded-md hover:bg-[#31BCFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
