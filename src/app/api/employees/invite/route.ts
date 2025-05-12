import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, employeeId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Update employee email if employeeId is provided
    if (employeeId) {
      try {
        await prisma.employee.update({
          where: { id: employeeId },
          data: { email },
        });
        
        console.log(`Updated email for employee ${employeeId} to ${email}`);
      } catch (error) {
        console.error('Error updating employee email:', error);
        // Continue with sending email even if update fails
      }
    }

    // Create a Nodemailer transporter using Mailtrap
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const registrationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employee/make-password?email=${encodeURIComponent(email)}${employeeId ? `&employeeId=${employeeId}` : ''}`;

    // Send email
    const info = await transporter.sendMail({
      from: '"Zen Link" <noreply@zenlink.com>',
      to: email,
      subject: "You're invited to join Zen Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #31BCFF; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Zen Link</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
            <h2>You've been invited!</h2>
            <p>You have been invited to join Zen Link. Please click the button below to set up your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationLink}" 
                 style="background-color: #31BCFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Create Your Password
              </a>
            </div>
            <p>This invite will expire in 7 days.</p>
            <p>If you did not expect this invitation, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 10px; color: #666; font-size: 12px;">
            <p>© 2023 Zen Link. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent: %s', info.messageId);
    
    return NextResponse.json({ 
      message: 'Invite sent successfully',
      messageId: info.messageId
    });
  } catch (error: any) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invite', details: error.message },
      { status: 500 }
    );
  }
}