import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const nameQuery = searchParams.get('name')?.trim()

    const where = nameQuery
      ? {
          OR: [
            {
              firstName: {
                contains: nameQuery,
                mode: 'insensitive'
              }
            },
            {
              lastName: {
                contains: nameQuery,
                mode: 'insensitive'
              }
            }
          ]
        }
      : {}

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    console.log('Name query:', nameQuery)
    console.log('Users fetched:', users)
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
