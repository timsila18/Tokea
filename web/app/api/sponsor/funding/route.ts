import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSignedInUser } from "@/lib/authz";
import { startStkPush } from "@/lib/mpesa/daraja";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const fundingSchema = z.object({
  budgetId: z.string().uuid(),
  amountCents: z.number().int().min(10000).max(500000000),
  phoneNumber: z.string().min(9).max(20),
  sponsorName: z.string().trim().min(2).max(120).optional(),
});

async function getUserRole(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role;
}

function requireSponsorRole(role?: string) {
  return role === "sponsor" || role === "super_admin";
}

export async function GET(request: Request) {
  const auth = await requireSignedInUser(request);
  if ("error" in auth) return auth.error;

  const role = await getUserRole(auth.user.id);
  if (!requireSponsorRole(role)) {
    return NextResponse.json(
      { error: "Sponsor access required" },
      { status: 403 },
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: budgets, error: budgetsError } = await admin
    .from("event_budgets")
    .select(
      "id, event_id, category, budgeted_cents, actual_cents, notes, events(id, title, venue, location_name, city, starts_at, status)",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  if (budgetsError) {
    return NextResponse.json({ error: budgetsError.message }, { status: 400 });
  }

  const budgetRows = (budgets ?? []).filter(
    (row: any) => row.events && row.budgeted_cents > 0,
  );
  const budgetIds = budgetRows.map((row: any) => row.id);
  const fundedByBudget = new Map<string, number>();

  if (budgetIds.length) {
    const { data: transactions } = await admin
      .from("mpesa_transactions")
      .select("source_id, amount_cents, status")
      .eq("purpose", "sponsorship")
      .eq("source_table", "event_budgets")
      .in("source_id", budgetIds);

    for (const transaction of transactions ?? []) {
      if (
        !transaction.source_id ||
        ["failed", "cancelled", "expired"].includes(transaction.status)
      )
        continue;
      fundedByBudget.set(
        transaction.source_id,
        (fundedByBudget.get(transaction.source_id) ?? 0) +
          Number(transaction.amount_cents ?? 0),
      );
    }
  }

  const opportunities = budgetRows
    .map((row: any) => {
      const event = row.events;
      const fundedCents = Math.max(
        Number(row.actual_cents ?? 0),
        fundedByBudget.get(row.id) ?? 0,
      );
      const remainingCents = Math.max(
        Number(row.budgeted_cents ?? 0) - fundedCents,
        0,
      );

      return {
        id: row.id,
        eventId: row.event_id,
        eventTitle: event.title,
        venue:
          event.venue ||
          event.location_name ||
          event.city ||
          "Venue to be confirmed",
        date: event.starts_at,
        category: row.category,
        notes: row.notes,
        budgetedCents: Number(row.budgeted_cents ?? 0),
        fundedCents,
        remainingCents,
      };
    })
    .filter((row) => row.remainingCents > 0);

  return NextResponse.json({
    opportunities,
  });
}

export async function POST(request: Request) {
  const auth = await requireSignedInUser(request);
  if ("error" in auth) return auth.error;

  const role = await getUserRole(auth.user.id);
  if (!requireSponsorRole(role)) {
    return NextResponse.json(
      { error: "Sponsor access required" },
      { status: 403 },
    );
  }

  const parsed = fundingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid sponsor funding payload" },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const admin = createSupabaseAdminClient();
  const { data: budget, error: budgetError } = await admin
    .from("event_budgets")
    .select(
      "id, event_id, category, budgeted_cents, actual_cents, notes, events(id, title)",
    )
    .eq("id", payload.budgetId)
    .maybeSingle();

  if (budgetError || !budget) {
    return NextResponse.json(
      { error: budgetError?.message ?? "Budget category not found" },
      { status: 404 },
    );
  }

  const eventTitle = (budget.events as any)?.title ?? "Tokea event";
  const category = String(budget.category);
  const { data: existingSponsor } = await admin
    .from("sponsors")
    .select("id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  let sponsorId = existingSponsor?.id;
  if (!sponsorId) {
    const fallbackName =
      payload.sponsorName || auth.user.email?.split("@")[0] || "Tokea Sponsor";
    const { data: sponsor, error: sponsorError } = await admin
      .from("sponsors")
      .insert({
        profile_id: auth.user.id,
        company_name: fallbackName,
        description: "Sponsor profile created from budget adoption.",
        brand_goals: ["event funding"],
      })
      .select("id")
      .single();

    if (sponsorError || !sponsor) {
      return NextResponse.json(
        { error: sponsorError?.message ?? "Unable to create sponsor profile" },
        { status: 400 },
      );
    }
    sponsorId = sponsor.id;
  }

  const { data: existingApplication } = await admin
    .from("sponsor_applications")
    .select("id, proposed_amount_cents, deliverables")
    .eq("sponsor_id", sponsorId)
    .eq("event_id", budget.event_id)
    .maybeSingle();
  const deliverables = Array.isArray(existingApplication?.deliverables)
    ? existingApplication.deliverables
    : [];
  const adoptedCategories = new Set(
    deliverables
      .map((item: any) => item?.category)
      .filter((item: unknown): item is string => typeof item === "string"),
  );
  adoptedCategories.add(category);

  const { error: applicationError } = await admin
    .from("sponsor_applications")
    .upsert(
      {
        sponsor_id: sponsorId,
        event_id: budget.event_id,
        status: "submitted",
        proposal: `Adopted ${Array.from(adoptedCategories).join(", ")} funding for ${eventTitle}.`,
        proposed_amount_cents:
          Number(existingApplication?.proposed_amount_cents ?? 0) +
          payload.amountCents,
        deliverables: [
          ...deliverables,
          {
            type: "budget_adoption",
            budgetId: budget.id,
            category,
            amountCents: payload.amountCents,
            paybillChannel: "mpesa_stk",
          },
        ],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sponsor_id,event_id" },
    );

  if (applicationError) {
    return NextResponse.json(
      { error: applicationError.message },
      { status: 400 },
    );
  }

  const accountReference = `TOKEA-${
    category
      .replace(/[^A-Z0-9]/gi, "")
      .slice(0, 6)
      .toUpperCase() || "SPONSOR"
  }`;
  const description = `Tokea sponsor ${category}`;
  const { data: transaction, error: transactionError } = await admin
    .from("mpesa_transactions")
    .insert({
      profile_id: auth.user.id,
      purpose: "sponsorship",
      source_table: "event_budgets",
      source_id: budget.id,
      amount_cents: payload.amountCents,
      currency: "KES",
      phone_number: payload.phoneNumber,
      account_reference: accountReference,
      description,
      status: "pending",
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    return NextResponse.json(
      {
        error: transactionError?.message ?? "Unable to create sponsor payment",
      },
      { status: 400 },
    );
  }

  try {
    const stk = await startStkPush({
      amountCents: payload.amountCents,
      phoneNumber: payload.phoneNumber,
      accountReference,
      description,
    });

    await admin
      .from("mpesa_transactions")
      .update({
        merchant_request_id: stk.merchantRequestId,
        checkout_request_id: stk.checkoutRequestId,
        provider_payload: stk.response,
      })
      .eq("id", transaction.id);

    return NextResponse.json({
      ok: true,
      transactionId: transaction.id,
      checkoutRequestId: stk.checkoutRequestId,
      customerMessage:
        stk.response.CustomerMessage ??
        "Check your phone to complete the sponsor payment.",
    });
  } catch (error) {
    await admin
      .from("mpesa_transactions")
      .update({
        status: "failed",
        result_description: (error as Error).message,
      })
      .eq("id", transaction.id);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 502 },
    );
  }
}
