import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { history } from "@/lib/db/schema/core";
import { eq } from "drizzle-orm";
import google from "@googleapis/safebrowsing";
import {
  dnsPhishingCheck,
  extractDomain,
  getVerdict,
} from "../dns-lookup/child-fn";
import {
  AiVerdict,
  AiVerdictSchema,
  ApiErrorResponse,
  DnsResult,
  FinalResponse,
  RequestBody,
  SafeBrowsingMatch,
  SafeBrowsingResult,
} from "./types";

const safebrowsing = google.safebrowsing("v4");
const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

async function runSafeBrowsing(url: string): Promise<SafeBrowsingResult> {
  try {
    const res = await safebrowsing.threatMatches.find({
      key: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
      requestBody: {
        client: { clientId: "phishing-detector", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      },
    });
    return {
      isSafe: !res.data.matches,
      matches: (res.data.matches as SafeBrowsingMatch[]) ?? [],
    };
  } catch {
    return { isSafe: true, matches: [] };
  }
}

async function runAiVerdict(
  domain: string,
  dnsResult: DnsResult,
  ruleBasedVerdict: string,
  safeBrowsing: SafeBrowsingResult,
): Promise<AiVerdict> {
  const { object } = await generateObject({
    model: gemini("gemini-2.5-flash"),
    schema: AiVerdictSchema,
    prompt: `You are a cybersecurity expert specializing in phishing detection. Analyze the following data about a domain and provide a final verdict.

Domain: ${domain}

DNS Analysis:
- IPs: ${dnsResult.ips.join(", ") || "none"}
- TTL: ${dnsResult.ttl}s
- Record count: ${dnsResult.record_count}
- Flux score: ${dnsResult.flux_score} (0=stable, 1=highly suspicious fast-flux)
- DNSSEC valid: ${dnsResult.dnssec_valid}
- Domain age: ${dnsResult.age_days ?? "unknown"} days

VirusTotal:
- Malicious engines: ${dnsResult.vt_malicious ?? "N/A"}
- Suspicious engines: ${dnsResult.vt_suspicious ?? "N/A"}
- Reputation score: ${dnsResult.vt_reputation ?? "N/A"} (higher = more trusted)

Google Safe Browsing:
- Is safe: ${safeBrowsing.isSafe}
- Threat matches: ${safeBrowsing.matches.length === 0 ? "none" : JSON.stringify(safeBrowsing.matches)}

Rule-based verdict: ${ruleBasedVerdict}

Provide a final verdict (SAFE, SUSPICIOUS, or PHISHING), a confidence score 0–1, key reasons for your decision, and a short user-facing recommendation.`,
  });

  return object;
}

async function handleRequest(
  raw: string,
  userId: string,
  historyId?: string,
): Promise<NextResponse<FinalResponse | ApiErrorResponse>> {
  const domain = extractDomain(raw.trim());

  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 422 });
  }

  const [dnsSettled, safeBrowsingSettled] = await Promise.allSettled([
    dnsPhishingCheck(domain),
    runSafeBrowsing(`https://${domain}`),
  ]);

  if (dnsSettled.status === "rejected") {
    return NextResponse.json({ error: "DNS lookup failed" }, { status: 500 });
  }

  const dns = dnsSettled.value;
  const safeBrowsing =
    safeBrowsingSettled.status === "fulfilled"
      ? safeBrowsingSettled.value
      : { isSafe: true, matches: [] };

  const ruleBasedVerdict = getVerdict(dns);
  const aiVerdict = await runAiVerdict(
    domain,
    dns,
    ruleBasedVerdict,
    safeBrowsing,
  );

  const dnsJson = JSON.stringify(dns);
  const safeBrowsingJson = JSON.stringify(safeBrowsing);
  const aiVerdictJson = JSON.stringify(aiVerdict);

  if (historyId) {
    await db
      .update(history)
      .set({
        dnsLookupResult: dnsJson,
        googleSafeBrowsingResult: safeBrowsingJson,
        finalAiVerdict: aiVerdictJson,
      })
      .where(eq(history.id, historyId));
  } else {
    await db.insert(history).values({
      userId,
      llmPrediction: ruleBasedVerdict,
      dnsLookupResult: dnsJson,
      googleSafeBrowsingResult: safeBrowsingJson,
      finalAiVerdict: aiVerdictJson,
      attachmentCount: 0,
    });
  }

  return NextResponse.json({
    domain,
    ruleBasedVerdict,
    aiVerdict,
    result: dns,
    safeBrowsing,
  });
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<FinalResponse | ApiErrorResponse>> {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("domain");
  const userId = searchParams.get("userId");
  const historyId = searchParams.get("historyId") ?? undefined;

  if (!raw || raw.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query param: domain" },
      { status: 400 },
    );
  }
  if (!userId || userId.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query param: userId" },
      { status: 400 },
    );
  }

  return handleRequest(raw, userId, historyId);
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<FinalResponse | ApiErrorResponse>> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { domain, userId, historyId } = body as RequestBody;

  if (typeof domain !== "string" || domain.trim() === "") {
    return NextResponse.json(
      { error: "domain must be a non-empty string" },
      { status: 400 },
    );
  }
  if (typeof userId !== "string" || userId.trim() === "") {
    return NextResponse.json(
      { error: "userId must be a non-empty string" },
      { status: 400 },
    );
  }

  return handleRequest(domain, userId, historyId);
}
