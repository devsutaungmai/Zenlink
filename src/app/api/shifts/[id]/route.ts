import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { ShiftType, WageType } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = context.params
    const shift = await prisma.shift.findFirst({
      where: { 
        id,
        employee: {
          user: {
            businessId: currentUser.businessId
          }
        }
      },
      include: {
        employee: true,
        employeeGroup: true
      }
    })
    
    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(shift)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shift' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const rawData = await request.json()

    const data = {
      date: rawData.date ? new Date(rawData.date) : undefined,
      startTime: rawData.startTime,
      endTime: rawData.endTime,
      employeeId: rawData.employeeId || null,
      employeeGroupId: rawData.employeeGroupId || null,
      shiftType: rawData.shiftType as ShiftType,
      breakStart: rawData.breakStart || null,
      breakEnd: rawData.breakEnd || null,
      wage: rawData.wage !== undefined ? parseFloat(rawData.wage) : undefined,
      wageType: rawData.wageType as WageType,
      note: rawData.note !== undefined ? rawData.note : null,
      approved: rawData.approved !== undefined ? Boolean(rawData.approved) : undefined
    }
    
    const shift = await prisma.shift.update({
      where: { id },
      data,
      include: {
        employee: true,
        employeeGroup: true
      }
    })
    
    return NextResponse.json(shift)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update shift' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    await prisma.shift.delete({
      where: { id }
    })
    return NextResponse.json(
      { message: 'Shift deleted successfully' }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete shift' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const shift = await prisma.shift.update({
      where: { id },
      data: { approved: true },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Failed to approve shift:', error)
    return NextResponse.json(
      { error: 'Failed to approve shift' },
      { status: 500 }
    )
  }
}
