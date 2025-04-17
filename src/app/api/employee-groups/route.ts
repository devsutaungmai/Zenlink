import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.employeeGroup.findMany({
      include: {
        department: {
          select: { name: true },
        },
        members: {
          select: { id: true },
        },
      },
    })
    return NextResponse.json(groups, { status: 200 })
  } catch (error) {
    console.error('Error fetching employee groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee groups' },
      { status: 500 }
    )
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, description, departmentId, memberIds } = data

    const group = await prisma.employeeGroup.create({
      data: {
        name: name.trim(),
        description: description && typeof description === 'string' ? description : null,
        department: departmentId ? { connect: { id: departmentId } } : undefined,
        members: memberIds && memberIds.length > 0
          ? { connect: memberIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        department: {
          select: { name: true },
        },
        members: {
          select: { id: true },
        },
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    console.error('Error creating employee group:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create employee group' },
      { status: 500 }
    )
  }
}
