'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import ShiftExchangeInfo from '@/components/ShiftExchangeInfo'

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  shiftType: string
  wage: number
  wageType: string
  approved: boolean
  employee?: {
    firstName: string
    lastName: string
    department?: {
      name: string
    }
  }
  employeeGroup?: {
    name: string
  }
  shiftExchanges?: Array<{
    id: string
    status: string
    fromEmployee: {
      firstName: string
      lastName: string
      department: {
        name: string
      }
    }
    toEmployee: {
      firstName: string
      lastName: string
      department: {
        name: string
      }
    }
  }>
}

interface EmployeeOption {
  id: string
  firstName: string
  lastName: string
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  useEffect(() => {
    fetchShifts()
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shifts')
      const data = await res.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#31BCFF',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      })

      if (result.isConfirmed) {
        const res = await fetch(`/api/shifts/${id}`, {
          method: 'DELETE',
        })
        
        if (res.ok) {
          setShifts(shifts.filter(shift => shift.id !== id))
          
          await Swal.fire({
            title: 'Deleted!',
            text: 'Shift has been deleted.',
            icon: 'success',
            confirmButtonColor: '#31BCFF',
          })
        } else {
          throw new Error('Failed to delete shift')
        }
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete shift.',
        icon: 'error',
        confirmButtonColor: '#31BCFF',
      })
    }
  }

  const handleExchange = async (shift: Shift) => {
    // Build options for select input
    const optionsHtml = employees
      .map(emp => `<option value="${emp.id}">${emp.firstName} ${emp.lastName}</option>`)
      .join('')

    const { value: employeeId } = await Swal.fire({
      title: 'Exchange Shift',
      html: `
        <label for="employee-select" style="display:block;text-align:left;margin-bottom:8px;">Select the new employee</label>
        <select id="employee-select" class="swal2-input" style="width:100%">
          <option value="">Select employee</option>
          ${optionsHtml}
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const select = (document.getElementById('employee-select') as HTMLSelectElement)
        return select.value
      },
      showCancelButton: true,
      confirmButtonColor: '#31BCFF',
    })

    if (employeeId) {
      try {
        const res = await fetch(`/api/shifts/${shift.id}/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmployeeId: employeeId }),
        })
        
        if (res.ok) {
          await Swal.fire('Success', 'Shift exchanged successfully!', 'success')
          fetchShifts()
        } else {
          const errorData = await res.json()
          
          if (res.status === 409 && errorData.conflict) {
            await Swal.fire({
              title: 'Scheduling Conflict',
              html: `
                <div class="text-left">
                  <p>${errorData.error}</p>
                  <p class="mt-2"><strong>Conflicting shift time:</strong> ${errorData.conflict.time}</p>
                </div>
              `,
              icon: 'warning',
              confirmButtonColor: '#31BCFF'
            })
          } else {
            throw new Error(errorData.error || 'Failed to exchange shift')
          }
        }
      } catch (error) {
        console.error('Error exchanging shift:', error)
        await Swal.fire('Error', 'Failed to exchange shift.', 'error')
      }
    }
  }

  const handleViewHistory = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}/exchanges`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch exchange history')
      }
      
      const exchanges = await res.json()
      
      if (exchanges.length === 0) {
        await Swal.fire({
          title: 'No History',
          text: 'This shift has no exchange history.',
          icon: 'info',
          confirmButtonColor: '#31BCFF',
        })
        return
      }
      
      // Format the exchange history for display
      const historyHtml = exchanges.map((exchange: any) => `
        <div class="border-b pb-2 mb-2">
          <p><strong>From:</strong> ${exchange.fromEmployee.firstName} ${exchange.fromEmployee.lastName}</p>
          <p><strong>To:</strong> ${exchange.toEmployee.firstName} ${exchange.toEmployee.lastName}</p>
          <p><strong>Date:</strong> ${new Date(exchange.exchangedAt).toLocaleString()}</p>
        </div>
      `).join('')
      
      await Swal.fire({
        title: 'Shift Exchange History',
        html: `<div class="text-left">${historyHtml}</div>`,
        confirmButtonColor: '#31BCFF',
        width: 600,
      })
    } catch (error) {
      console.error('Error fetching exchange history:', error)
      await Swal.fire('Error', 'Failed to load exchange history.', 'error')
    }
  }

  const filteredShifts = shifts.filter(shift => 
    shift.employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.employeeGroup?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.shiftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.date.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-32">Loading...</div>
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Shifts</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all shifts in your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/shifts/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#31BCFF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#31BCFF]/90"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Shift
          </Link>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shifts..."
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Group</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredShifts.map((shift) => (
                    <React.Fragment key={shift.id}>
                      <tr>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {new Date(shift.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {shift.startTime} - {shift.endTime}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {shift.employee ? `${shift.employee.firstName} ${shift.employee.lastName}` : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {shift.employeeGroup?.name || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {shift.shiftType}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            shift.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {shift.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap pl-3 pr-4 sm:pr-6 flex items-center space-x-4">
                          <Link
                            href={`/dashboard/shifts/${shift.id}/edit`}
                            className="text-[#31BCFF] hover:text-[#31BCFF]/90"
                          >
                            <PencilIcon className="h-5 w-5 mt-3" />
                          </Link>
                          <button
                            onClick={() => handleDelete(shift.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5 mt-3" />
                          </button>
                          <button
                            onClick={() => handleExchange(shift)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Exchange Shift"
                          >
                            <ArrowsRightLeftIcon className="h-5 w-5 mt-3" />
                          </button>
                          <button
                            onClick={() => handleViewHistory(shift.id)}
                            className="text-amber-600 hover:text-amber-900"
                            title="View Exchange History"
                          >
                            <ClockIcon className="h-5 w-5 mt-3" />
                          </button>
                        </td>
                      </tr>
                      {/* Show exchange information in a separate row if shift is approved and has exchanges */}
                      {shift.approved && shift.shiftExchanges && shift.shiftExchanges.some(exchange => exchange.status === 'APPROVED') && (
                        <tr className="bg-blue-50">
                          <td colSpan={7} className="px-3 py-2">
                            <ShiftExchangeInfo shift={shift} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
