import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        employees: true,
        projects: true,
      }
    })
    
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const department = await prisma.department.update({
      where: { id: params.id },
      data
    })
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.department.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}