import { initTRPC, TRPCError } from '@trpc/server'
import { db } from '../db/db';
import { auth } from '../lib/auth';
import { ZodError } from 'zod';
import superjson from "superjson";
import type { Context as HonoContext } from "hono";


export type CreateContextOptions = {
    hono: HonoContext;
};


export const createTRPCContext = async ({ hono }: CreateContextOptions) => {
    const session = await auth.api.getSession({
        headers: hono.req.raw.headers,
    });

    return {
        db,
        user: session?.user,
        session: session?.session,
    };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

export const createTRPCRouter = t.router;


/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */

export const publicProcedure = t.procedure


/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
    .use(({ ctx, next }) => {
        if (!ctx.session || !ctx.user) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return next({
            ctx: {
                // infers the `session` as non-nullable
                session: { ...ctx.session, user: ctx.user },
            },
        });
    });