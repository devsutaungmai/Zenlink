import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        department: { select: { name: true } },
      },
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()

        // Manual checks for required relationships
        // can be deleted when proper validation is implemented.
        if (!data.userId || !data.departmentId) {
            return NextResponse.json({ error: 'User ID and Department ID are required' }, { status: 400 });
        }

        const employee = await prisma.employee.create({
            data: {
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                birthday: new Date(data.birthday),
                sex: data.sex,
                socialSecurityNo: data.socialSecurityNo,
                address: data.address,
                mobile: data.mobile,
                employeeNo: data.employeeNo,
                bankAccount: data.bankAccount,
                hoursPerMonth: parseFloat(data.hoursPerMonth),
                dateOfHire: new Date(data.dateOfHire),
                isTeamLeader: data.isTeamLeader || false,
                departmentId: data.departmentId,
            },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
                department: { select: { name: true } },
            },
        });
        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    } 
}
