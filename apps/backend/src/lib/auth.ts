import { betterAuth } from "better-auth";
import { db } from "../db/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:1420", "http://localhost:5173"],
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                console.log('sendVerificationOTP', email, otp, type)
            },
        })
    ]
});