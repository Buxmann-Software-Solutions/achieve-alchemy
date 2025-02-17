import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "http://localhost:8787",
    plugins: [
        emailOTPClient()
    ]
})

export const { signIn, signUp, useSession, signOut, getSession } = authClient;