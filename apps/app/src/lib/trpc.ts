import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/src";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";
import { inferRouterOutputs } from "@trpc/server";
import { inferRouterInputs } from "@trpc/server";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
    links: [
        loggerLink({
            enabled: (op) =>
                process.env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
            url: "http://localhost:8787/trpc",
            transformer: superjson,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            },
        }),
    ],
});


export const trpcQueryUtils = createTRPCQueryUtils({
    queryClient,
    client: trpcClient,
});

export type routerInput = inferRouterInputs<AppRouter>;
export type routerOutput = inferRouterOutputs<AppRouter>;
