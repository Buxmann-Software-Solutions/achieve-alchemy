import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono'
import { appRouter } from './api/root';
import { auth } from './lib/auth';
import { cors } from 'hono/cors';
import { createTRPCContext } from './api/trpc';

// const API_KEY = 'creem_test_78Latcv3exP5O3fCVUPiYX';
// const BASE_CREEM_URL = 'https://test-api.creem.io/v1';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>();

export type AppRouter = typeof appRouter

app.use(
  "/*",
  cors({
    origin: ["http://localhost:1420", "http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, hono) => {
      return createTRPCContext({ hono });
    },
  }),
);

export default {
  port: 8787,
  fetch: app.fetch,
};

// app.post("/checkout", async (c) => {
//   const response = await generateCheckoutSession()

//   return c.json({
//     ...response,
//     checkoutUrl: response.checkout_url
//   })
// })

// app.post('/licenses/activate', async (c) => {
//   const { key, instanceName } = await c.req.json()

//   console.log('key', key)
//   console.log('instanceName', instanceName)

//   try {
//     const response = await activateLicense({ key, instanceName })

//     console.log('response', response)

//     return c.json({
//       isActivated: true,
//       instanceId: response.instance[0].id
//     })
//   } catch (error) {
//     return c.json({
//       isActivated: false,
//       instanceId: null,
//     })
//   }
// })

// app.post('/licenses/validate', async (c) => {
//   const { license_key, instance_id } = await c.req.json()
//   const response = await validateLicense({ licenseKey: license_key, instanceId: instance_id })

//   return c.json(response)
// })

// app.post('/licenses/deactivate', async (c) => {
//   const { license_key, instance_id } = await c.req.json()
//   const response = await deactivateLicense({ licenseKey: license_key, instanceId: instance_id })

//   return c.json(response)
// })



// interface CheckoutResponse {
//   id: string;
//   object: string;
//   product: string;
//   units: null;
//   status: string;
//   checkout_url: string;
//   mode: string;
// }

// const generateCheckoutSession = async (): Promise<CheckoutResponse> => {
//   const response = await fetch(`${BASE_CREEM_URL}/checkouts`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': API_KEY
//     },
//     body: JSON.stringify({
//       product_id: 'prod_71cfe1oECmM4zirDqTRdM4',
//       discount_code: 'FREEBIE'
//     })
//   });

//   return await response.json();
// }

// interface ActivateLicenseResponse {
//   id: string;
//   mode: string;
//   object: string;
//   status: string;
//   key: string;
//   activation: number;
//   activation_limit: number;
//   expires_at: string;
//   created_at: string;
//   instance: {
//     id: string;
//     mode: string;
//     object: string;
//     name: string;
//     status: string;
//     created_at: string;
//   }[];
// }

// const activateLicense = async (args: { key: string, instanceName: string }): Promise<ActivateLicenseResponse> => {
//   const response = await fetch(`${BASE_CREEM_URL}/licenses/activate`, {
//     method: 'POST',
//     headers: {
//       'accept': 'application/json',
//       'x-api-key': API_KEY,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       key: args.key,
//       instance_name: args.instanceName
//     })
//   });

//   return await response.json();
// }

// const validateLicense = async (args: { licenseKey: string, instanceId: string }) => {
//   return await fetch(`${BASE_CREEM_URL}/licenses/validate`, {
//     method: 'POST',
//     headers: {
//       'accept': 'application/json',
//       'x-api-key': API_KEY,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       key: args.licenseKey,
//       instance_id: args.instanceId
//     })
//   });
// }

// const deactivateLicense = async (args: { licenseKey: string, instanceId: string }) => {
//   return await fetch(`${BASE_CREEM_URL}/licenses/deactivate`, {
//     method: 'POST',
//     headers: {
//       'accept': 'application/json',
//       'x-api-key': API_KEY,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       key: args.licenseKey,
//       instance_id: args.instanceId
//     })
//   });
// }
