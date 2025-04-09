import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

interface Props {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        employees: true,
        _count: {
          select: { employees: true }
        }
      }
    })
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch department' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const data = await request.json()
    const department = await prisma.department.update({
      where: { id: params.id },
      data,
      include: {
        _count: {
          select: { employees: true }
        }
      }
    })
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update department' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    await prisma.department.delete({
      where: { id: params.id }
    })
    return NextResponse.json(
      { message: 'Department deleted successfully' }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete department' }, 
      { status: 500 }
    )
  }
}