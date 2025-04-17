import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma.employeeGroup) {
      console.error('Prisma employeeGroup model is undefined')
      return NextResponse.json(
        { error: 'EmployeeGroup model not found in Prisma client' },
        { status: 500 }
      )
    }

    const group = await prisma.employeeGroup.findUnique({
      where: { id: params.id },
      include: {
        department: { select: { id: true, name: true } },
        members: { select: { id: true } },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Employee group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(group, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching employee group:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch employee group' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma.employeeGroup) {
      console.error('Prisma employeeGroup model is undefined')
      return NextResponse.json(
        { error: 'EmployeeGroup model not found in Prisma client' },
        { status: 500 }
      )
    }

    const data = await request.json()
    console.log('Received data:', data)
    const { name, description, departmentId, memberIds } = data

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.log('Validation failed: Name is required')
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate departmentId if provided
    if (departmentId) {
      if (typeof departmentId !== 'string') {
        console.log('Validation failed: Invalid departmentId type:', departmentId)
        return NextResponse.json(
          { error: 'Department ID must be a string' },
          { status: 400 }
        )
      }
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      })
      if (!department) {
        console.log('Validation failed: Department not found for ID:', departmentId)
        return NextResponse.json(
          { error: 'Invalid department ID' },
          { status: 400 }
        )
      }
    }

    // Validate memberIds if provided
    if (memberIds) {
      if (!Array.isArray(memberIds) || memberIds.some(id => typeof id !== 'string')) {
        console.log('Validation failed: Invalid memberIds format:', memberIds)
        return NextResponse.json(
          { error: 'Member IDs must be an array of strings' },
          { status: 400 }
        )
      }
      if (memberIds.length > 0) {
        const employees = await prisma.employee.findMany({
          where: { id: { in: memberIds } },
        })
        if (employees.length !== memberIds.length) {
          console.log('Validation failed: Invalid employee IDs:', memberIds, 'Found:', employees.map(e => e.id))
          return NextResponse.json(
            { error: 'One or more invalid employee IDs' },
            { status: 400 }
          )
        }
      }
    }

    console.log('Updating group with data:', { name, description, departmentId, memberIds })
    const group = await prisma.employeeGroup.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description && typeof description === 'string' ? description : null,
        department: departmentId ? { connect: { id: departmentId } } : { disconnect: true },
        members: memberIds
          ? { set: memberIds.map((id: string) => ({ id })) }
          : { set: [] },
      },
      include: {
        department: { select: { id: true, name: true } },
        members: { select: { id: true } },
      },
    })

    console.log('Group updated:', group)
    return NextResponse.json(group, { status: 200 })
  } catch (error: any) {
    console.error('Error updating employee group:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    })
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee group not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update employee group' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma.employeeGroup) {
      console.error('Prisma employeeGroup model is undefined')
      return NextResponse.json(
        { error: 'EmployeeGroup model not found in Prisma client' },
        { status: 500 }
      )
    }

    console.log('Deleting group with ID:', params.id)
    await prisma.employeeGroup.delete({
      where: { id: params.id },
    })

    console.log('Group deleted:', params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error('Error deleting employee group:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    })
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee group not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete employee group' },
      { status: 500 }
    )
  }
}
