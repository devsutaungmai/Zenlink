import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

interface Props {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    })
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employee' }, 
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    const {
      firstName,
      lastName,
      birthday,
      sex,
      socialSecurityNo,
      address,
      mobile,
      employeeNo,
      bankAccount,
      hoursPerMonth,
      dateOfHire,
      isTeamLeader,
      userId,
      departmentId,
    } = body

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        birthday: new Date(birthday),
        sex,
        socialSecurityNo,
        address,
        mobile,
        employeeNo,
        bankAccount,
        hoursPerMonth: parseFloat(hoursPerMonth),
        dateOfHire: new Date(dateOfHire),
        isTeamLeader: !!isTeamLeader,
        userId,
        departmentId,
      },
    })

    console.log('Employee updated:', employee)
    return NextResponse.json({ message: 'Employee updated successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating employee:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    await prisma.employee.delete({
      where: { id: params.id }
    })
    return NextResponse.json(
      { message: 'employee deleted successfully' }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete employee' }, 
      { status: 500 }
    )
  }
}
