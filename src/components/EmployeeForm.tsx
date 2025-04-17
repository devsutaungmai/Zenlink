import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import Select from 'react-select'

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

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Department {
  id: string
  name: string
}

interface EmployeeFormProps {
  initialData?: EmployeeFormData
  onSubmit: (data: EmployeeFormData) => void
  loading: boolean
}

export default function EmployeeForm({ initialData, onSubmit, loading }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || {
      firstName: '',
      lastName: '',
      birthday: '',
      sex: 'MALE',
      socialSecurityNo: '',
      address: '',
      mobile: '',
      employeeNo: '',
      bankAccount: '',
      hoursPerMonth: 0,
      dateOfHire: '',
      isTeamLeader: false,
      userId: '',
      departmentId: '',
    }
  )
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/departments'),
        ])
        if (!usersRes.ok) {
          throw new Error(`Users fetch failed: ${usersRes.status} ${usersRes.statusText}`)
        }
        if (!deptsRes.ok) {
          throw new Error(`Departments fetch failed: ${deptsRes.status} ${deptsRes.statusText}`)
        }
        const usersData = await usersRes.json()
        const deptsData = await deptsRes.json()
        setUsers(usersData)
        setFilteredUsers(usersData)
        setDepartments(deptsData)
      } catch (error) {
        console.error('Error fetching users or departments:', error)
      }
    }
    fetchData()
  }, [])

  const filterUsers = useCallback(
    debounce((search: string) => {
      if (search.trim() === '') {
        setFilteredUsers(users)
      } else {
        const filtered = users.filter(user =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        )
        setFilteredUsers(filtered)
        console.log('Filtered users:', filtered)
      }
    }, 300),
    [users]
  )

  const handleUserSelect = (selected: { value: string; label: string } | null) => {
    setFormData({ ...formData, userId: selected ? selected.value : '' })
  }

  const handleDepartmentSelect = (selected: { value: string; label: string } | null) => {
    setFormData({ ...formData, departmentId: selected ? selected.value : '' })
  }

  const userOptions = filteredUsers.map(user => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} (${user.email})`
  }))

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      hoursPerMonth: parseFloat(formData.hoursPerMonth.toString()),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birthday <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sex <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.sex}
            onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Social Security No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.socialSecurityNo}
            onChange={(e) => setFormData({ ...formData, socialSecurityNo: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mobile <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employee No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.employeeNo}
            onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bank Account <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hours Per Month <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.hoursPerMonth}
            onChange={(e) => setFormData({ ...formData, hoursPerMonth: parseFloat(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Hire <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfHire}
            onChange={(e) => setFormData({ ...formData, dateOfHire: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Team Leader
          </label>
          <input
            type="checkbox"
            checked={formData.isTeamLeader}
            onChange={(e) => setFormData({ ...formData, isTeamLeader: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#31BCFF] focus:ring-[#31BCFF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            User <span className="text-red-500">*</span>
          </label>
          <Select
            options={userOptions}
            onInputChange={(input) => filterUsers(input)}
            onChange={handleUserSelect}
            placeholder="Search users by name or email..."
            value={userOptions.find(option => option.value === formData.userId) || null}
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
                  boxShadow: '0 0 0 1px #31BCFF'
                }
              }),
              input: (base) => ({
                ...base,
                padding: 0,
                margin: 0
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '0.375rem',
                marginTop: '0.25rem'
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected
                  ? '#31BCFF'
                  : isFocused
                  ? '#f0f9ff'
                  : 'white',
                color: isSelected ? 'white' : '#374151',
                padding: '0.5rem 0.75rem'
              })
            }}
            noOptionsMessage={() => userOptions.length === 0 ? 'No users available' : `No users found`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department <span className="text-red-500">*</span>
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
                  boxShadow: '0 0 0 1px #31BCFF'
                }
              }),
              input: (base) => ({
                ...base,
                padding: 0,
                margin: 0
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '0.375rem',
                marginTop: '0.25rem'
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected
                  ? '#31BCFF'
                  : isFocused
                  ? '#f0f9ff'
                  : 'white',
                color: isSelected ? 'white' : '#374151',
                padding: '0.5rem 0.75rem'
              })
            }}
            noOptionsMessage={() => 'No departments available'}
            required
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
