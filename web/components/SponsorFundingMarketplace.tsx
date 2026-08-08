"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Megaphone,
  Phone,
  WalletCards,
} from "lucide-react";

type FundingOpportunity = {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  date: string;
  category: string;
  notes: string | null;
  budgetedCents: number;
  fundedCents: number;
  remainingCents: number;
};

type FundingResponse = {
  opportunities: FundingOpportunity[];
  demo?: boolean;
};

function formatKes(cents: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100));
}

function formatDate(value: string) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function SponsorFundingMarketplace() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amountKes, setAmountKes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFunding() {
      try {
        const response = await fetch("/api/sponsor/funding", {
          cache: "no-store",
        });
        const data = (await response.json()) as FundingResponse & {
          error?: string;
        };
        if (!response.ok)
          throw new Error(data.error ?? "Unable to load funding categories.");
        if (!active) return;
        setOpportunities(data.opportunities ?? []);
        const first = data.opportunities?.[0];
        if (first) {
          setSelectedId(first.id);
          setAmountKes(
            String(Math.max(1, Math.round(first.remainingCents / 100))),
          );
        }
      } catch (loadError) {
        if (active) setError((loadError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFunding();

    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () =>
      opportunities.find((opportunity) => opportunity.id === selectedId) ??
      opportunities[0],
    [opportunities, selectedId],
  );

  function pickOpportunity(opportunity: FundingOpportunity) {
    setSelectedId(opportunity.id);
    setAmountKes(
      String(Math.max(1, Math.round(opportunity.remainingCents / 100))),
    );
    setMessage("");
    setError("");
  }

  async function submitFunding() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/sponsor/funding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetId: selected.id,
          amountCents: Math.round(Number(amountKes) * 100),
          phoneNumber,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        customerMessage?: string;
      };
      if (!response.ok)
        throw new Error(data.error ?? "Unable to start sponsor payment.");
      setMessage(
        data.customerMessage ??
          "Check your phone to complete the sponsor payment.",
      );
    } catch (fundingError) {
      setError((fundingError as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="sponsor-funding-panel">
      <div className="sponsor-funding-head">
        <div>
          <span>Sponsor Funding Marketplace</span>
          <h2>Adopt a budget category</h2>
          <p>
            Choose what to fund, then complete payment by M-Pesa through Tokea.
          </p>
        </div>
        <WalletCards aria-hidden="true" />
      </div>

      {loading ? (
        <div className="sponsor-loading">
          <Loader2 className="spin" aria-hidden="true" />
          Loading sponsor categories...
        </div>
      ) : (
        <div className="sponsor-funding-grid">
          <div className="sponsor-opportunity-list">
            {opportunities.map((opportunity) => {
              const fundedPercent =
                opportunity.budgetedCents > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (opportunity.fundedCents / opportunity.budgetedCents) *
                          100,
                      ),
                    )
                  : 0;

              return (
                <button
                  className={opportunity.id === selected?.id ? "active" : ""}
                  key={opportunity.id}
                  type="button"
                  onClick={() => pickOpportunity(opportunity)}
                >
                  <strong>{opportunity.category}</strong>
                  <span>{opportunity.eventTitle}</span>
                  <small>
                    {formatDate(opportunity.date)} · {opportunity.venue}
                  </small>
                  <i>
                    <b style={{ width: `${fundedPercent}%` }} />
                  </i>
                  <em>{formatKes(opportunity.remainingCents)} remaining</em>
                </button>
              );
            })}
          </div>

          <form
            className="sponsor-funding-form"
            onSubmit={(event) => {
              event.preventDefault();
              submitFunding();
            }}
          >
            {selected ? (
              <>
                <div className="funding-selected-card">
                  <Megaphone aria-hidden="true" />
                  <div>
                    <span>{selected.eventTitle}</span>
                    <h3>{selected.category}</h3>
                    <p>
                      {selected.notes ||
                        "Sponsor this category for visibility and event impact."}
                    </p>
                  </div>
                </div>

                <div className="funding-stats">
                  <div>
                    <span>Budget</span>
                    <strong>{formatKes(selected.budgetedCents)}</strong>
                  </div>
                  <div>
                    <span>Funded</span>
                    <strong>{formatKes(selected.fundedCents)}</strong>
                  </div>
                  <div>
                    <span>Open</span>
                    <strong>{formatKes(selected.remainingCents)}</strong>
                  </div>
                </div>

                <label>
                  M-Pesa phone number
                  <div className="sponsor-input-icon">
                    <Phone aria-hidden="true" />
                    <input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="07..."
                      required
                    />
                  </div>
                </label>

                <label>
                  Amount (KES)
                  <input
                    min="100"
                    type="number"
                    value={amountKes}
                    onChange={(event) => setAmountKes(event.target.value)}
                    required
                  />
                </label>

                {message ? (
                  <div className="funding-message success">
                    <CheckCircle2 aria-hidden="true" />
                    {message}
                  </div>
                ) : null}
                {error ? <div className="funding-message">{error}</div> : null}

                <button
                  className="button primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="spin" aria-hidden="true" />
                  ) : null}
                  Fund via M-Pesa
                </button>
              </>
            ) : (
              <div className="sponsor-loading">
                No fundable budget categories yet.
              </div>
            )}
          </form>
        </div>
      )}
    </section>
  );
}
