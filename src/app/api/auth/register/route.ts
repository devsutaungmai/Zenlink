import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { user, business } = await req.json()
 
    if (!user?.email || !user?.password || !business?.businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { email: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    // Use transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      const newBusiness = await tx.business.create({
        data: {
          name: business.businessName,
          address: business.address,
          type: business.typeOfBusiness,
          employeesCount: business.employeesQty,
        },
      })

      const newUser = await tx.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'ADMIN',
          businessId: newBusiness.id,
        },
      })

      return { newUser, newBusiness }
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: result.newUser.id,
        email: result.newUser.email,
        firstName: result.newUser.firstName,
        lastName: result.newUser.lastName,
        role: result.newUser.role
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}