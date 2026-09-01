import { prisma } from "@/lib/prisma";
import {  NextResponse } from "next/server";
import crypto from "crypto";
import { transporter } from "@/lib/email";

export async function POST(request:Request){
    try{
        const {email} = await request.json();
        if(!email){
            return NextResponse.json({
                error:"Email is required"
            },{
                status:400
            })
        }
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        });

        if(!user){
            return NextResponse.json({
                message:"If an account exists with this email, a reset link has been sent."
            })
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
            where:{
                id:user.id
            },
            data:{
                resetToken:hashToken,
                resetTokenExpiry
            }
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`
        await transporter.sendMail({
    from: `"Partner Finance" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Reset your Partner Finance password",
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Reset your password</h2>

            <p>Hello ${user.name},</p>

            <p>
                We received a request to reset your Partner Finance
                account password.
            </p>

            <p>
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background: #111827;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                    "
                >
                    Reset Password
                </a>
            </p>

            <p>This link expires in 15 minutes.</p>

            <p>
                If you didn't request this password reset,
                you can safely ignore this email.
            </p>
        </div>
    `,
});
        return NextResponse.json({
            message:"Reset link has been sent to your email."
        })
    }
    catch(error){
        console.log(error);
        return NextResponse.json({
            error:"Failed to send reset link"
        },{
            status:500
        })
    }
}