import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./core/lib/auth/init.js";
import { cors } from "hono/cors";
import "dotenv/config";
import { analysisRoutes } from "./analysis/analysis.route.js";
import { menuRoutes } from "./organization/menu/menu.route.js";
import { stripeRoutes } from "./stripe/stripe.route.js";
import { parseFile, uploadFile, type UploadInput } from "./core/aws/s3.js";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .basePath("/api")
  .use(
    cors({
      origin: ["http://localhost:3001", "https:// .ai", "https://app. .ai"],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: [
        "POST",
        "GET",
        "OPTIONS",
        "DELETE",
        "PUT",
        "PATCH",
        "HEAD",
        "CONNECT",
        "TRACE",
      ],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use("*", async (c, next) => {
    if (c.req.path === "/api/webhook/stripe") {
      await next();
      return;
    }
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    c.set("user", session?.user ?? null);
    c.set("session", session?.session ?? null);
    await next();
  })
  .get("/", (c) => {
    return c.text("Ok!");
  })
  .on(["POST", "GET"], "/auth/*", async (c) => {
    if (c.req.path == "/api/auth/organization/create") {
      const body = await c.req.parseBody();
      const { name, slug, metadata, image, userId } = body;
      let imageUrl = "";
      if (image) {
        const parsedImage = await parseFile(image as File);
        const uploadedImage = await uploadFile(parsedImage as UploadInput);
        imageUrl = uploadedImage.url;
      }
      const data = await auth.api.createOrganization({
        body: {
          name: name as string,
          slug: slug as string,
          metadata: JSON.parse(metadata as string),
          userId: userId as string,
          logo: imageUrl,
        },
        headers: c.req.raw.headers,
      });
      return c.json(data);
    }
    return auth.handler(c.req.raw);
  })
  .route("/analysis", analysisRoutes)
  .route("/menu", menuRoutes)
  .route("/stripe", stripeRoutes)
  .onError((err, c) => {
    if (err instanceof Error) {
      if (err.message === "ORG_NOT_FOUND")
        return c.json({ message: "Organization not found" }, 404);
      if (err.message === "INVALID_PERIOD")
        return c.json({ message: "Invalid period format" }, 400);
      if (err.message.endsWith("_NOT_FOUND"))
        return c.json({ message: err.message }, 404);
      if (err.message === "ORG_EMAIL_NOT_FOUND")
        return c.json({ message: "Organization email not found" }, 404);
      if (err.message === "MISSING_STRIPE_SIGNATURE")
        return c.json({ message: "Missing Stripe signature" }, 400);
    }
    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  });

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export type AppRouter = typeof app;
