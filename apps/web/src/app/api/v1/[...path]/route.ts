import { NextRequest, NextResponse } from "next/server";

/** Server-side only: Express API base URL (e.g. https://order-stock-server.vercel.app). */
const backendBase = process.env.API_PROXY_TARGET?.replace(/\/$/, "");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const hopByHop = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!backendBase) {
    return NextResponse.json(
      { message: "API proxy is not configured. Set API_PROXY_TARGET on the server (e.g. your Express deployment URL)." },
      { status: 503 }
    );
  }

  const { path } = await ctx.params;
  const pathStr = path.join("/");
  const url = new URL(req.url);
  const targetUrl = `${backendBase}/api/v1/${pathStr}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (hopByHop.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    body = await req.arrayBuffer();
  }

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
    redirect: "manual",
  });

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  });

  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    out.headers.set(key, value);
  });

  return out;
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
