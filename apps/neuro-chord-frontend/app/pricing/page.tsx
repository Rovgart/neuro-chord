'use client';

import { useGetSubscriptionsQuery } from '@/services/api';
import { Button } from '@heroui/react';
import { Check, Infinity, Users, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/* =========================================================
   TYPES
   ========================================================= */

type BillingCycle = 'monthly' | 'yearly';

interface PlanFeature {
  label: string;
  included: boolean;
}
interface BackendSubscriptionPlan {
  id: string;
  planName: string;
  price: number;
  stripePriceId: string;
  currency: string;
  period: 'Monthly' | 'Yearly';
  isActive: boolean;
  tagline: string | null;
  badge: string | null;
  studentLimit: string | null;
  cta: string | null;
  highlight: boolean;
  features: PlanFeature[];
}

function BillingToggle({ value, onChange }: { value: BillingCycle; onChange: (v: BillingCycle) => void }) {
  return (
    <div
      className="inline-flex items-center p-1 rounded-xl gap-1"
      style={{ background: 'var(--color-surface-elevated)' }}
    >
      {(['monthly'] as BillingCycle[]).map((cycle) => (
        <button
          key={cycle}
          type="button"
          onClick={() => onChange(cycle)}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
          style={{
            background: value === cycle ? 'var(--card-bg)' : 'transparent',
            color: value === cycle ? 'var(--color-primary)' : 'var(--color-text-muted)',
            boxShadow: value === cycle ? 'var(--shadow-sm)' : 'none',
            border: value === cycle ? '1px solid var(--color-border)' : '1px solid transparent',
          }}
        >
          {cycle}
          {cycle === 'yearly' && (
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: 'oklch(from var(--teal-500) l c h / 0.15)',
                color: 'var(--teal-600)',
              }}
            >
              −20%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  billing,
  onSelect,
}: {
  plan: BackendSubscriptionPlan;
  billing: BillingCycle;
  onSelect: (dbPlanId: string, stripePriceId: string, planName: string) => void;
}) {
  const isHighlighted = plan.highlight;
  const isFree = plan.price === 0;

  const displayPrice = billing === 'yearly' && !isFree ? Math.round(plan.price / 12) : plan.price;

  return (
    <div
      className="relative flex flex-col rounded-2xl p-6 transition-all"
      style={{
        background: isHighlighted ? 'var(--color-primary)' : 'var(--card-bg)',
        border: isHighlighted ? '1px solid var(--color-primary)' : '1px solid var(--card-border)',
        boxShadow: isHighlighted ? 'var(--shadow-xl)' : 'var(--card-shadow)',
        color: isHighlighted ? 'var(--color-on-primary)' : 'var(--color-text)',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap"
          style={{
            background: isHighlighted ? 'var(--color-on-primary)' : 'var(--color-primary)',
            color: isHighlighted ? 'var(--color-primary)' : 'var(--color-on-primary)',
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 mb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: isHighlighted
                ? 'oklch(from var(--color-on-primary) l c h / 0.15)'
                : 'var(--color-primary-subtle)',
              color: isHighlighted ? 'var(--color-on-primary)' : 'var(--color-primary)',
            }}
          >
            {plan.planName.toLowerCase().includes('free') && <Zap size={15} strokeWidth={2.5} />}
            {plan.planName.toLowerCase().includes('pro') && <Users size={15} strokeWidth={2.5} />}
            {plan.planName.toLowerCase().includes('full') && <Infinity size={15} strokeWidth={2.5} />}
          </div>

          <h3
            className="text-base font-bold tracking-tight"
            style={{ color: isHighlighted ? 'var(--color-on-primary)' : 'var(--color-text)' }}
          >
            {plan.planName}
          </h3>
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{
            color: isHighlighted ? 'oklch(from var(--color-on-primary) l c h / 0.75)' : 'var(--color-text-muted)',
          }}
        >
          {plan.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-end gap-1 mb-1">
        <span
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: isHighlighted ? 'var(--color-on-primary)' : 'var(--color-text)' }}
        >
          {isFree ? 'Free' : `$${displayPrice}`}
        </span>
        {!isFree && (
          <span
            className="mb-1.5 text-sm"
            style={{
              color: isHighlighted ? 'oklch(from var(--color-on-primary) l c h / 0.6)' : 'var(--color-text-muted)',
            }}
          >
            / mo
          </span>
        )}
      </div>

      {billing === 'yearly' && !isFree && (
        <p
          className="text-xs mb-4"
          style={{
            color: isHighlighted ? 'oklch(from var(--color-on-primary) l c h / 0.65)' : 'var(--color-text-muted)',
          }}
        >
          Billed ${plan.price}/year
        </p>
      )}

      {/* Student limit pill */}
      {plan.studentLimit && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-5 self-start"
          style={{
            background: isHighlighted
              ? 'oklch(from var(--color-on-primary) l c h / 0.15)'
              : 'var(--color-surface-elevated)',
            color: isHighlighted ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
          }}
        >
          <Users size={10} strokeWidth={2.5} />
          {plan.studentLimit}
        </div>
      )}

      {/* Divider */}
      <div
        className="h-px w-full mb-5"
        style={{
          background: isHighlighted ? 'oklch(from var(--color-on-primary) l c h / 0.15)' : 'var(--color-border-subtle)',
        }}
      />

      {/* Features */}
      <div className="flex flex-col gap-3 flex-1 mb-6">
        {plan.features?.map((feature) => (
          <div key={feature.label} className="flex items-center gap-3">
            <div
              className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: feature.included
                  ? isHighlighted
                    ? 'oklch(from var(--color-on-primary) l c h / 0.2)'
                    : 'oklch(from var(--teal-500) l c h / 0.12)'
                  : isHighlighted
                    ? 'oklch(from var(--color-on-primary) l c h / 0.1)'
                    : 'var(--color-surface-elevated)',
                color: feature.included
                  ? isHighlighted
                    ? 'var(--color-on-primary)'
                    : 'var(--teal-500)'
                  : isHighlighted
                    ? 'oklch(from var(--color-on-primary) l c h / 0.4)'
                    : 'var(--color-text-placeholder)',
              }}
            >
              {feature.included ? <Check size={9} strokeWidth={3} /> : <X size={9} strokeWidth={3} />}
            </div>
            <span
              className="text-sm"
              style={{
                color: feature.included
                  ? isHighlighted
                    ? 'var(--color-on-primary)'
                    : 'var(--color-text)'
                  : isHighlighted
                    ? 'oklch(from var(--color-on-primary) l c h / 0.45)'
                    : 'var(--color-text-placeholder)',
                textDecoration: feature.included ? 'none' : 'line-through',
              }}
            >
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        onPress={() => onSelect(plan.id, plan.stripePriceId, plan.planName)}
        className="w-full h-11 text-sm font-bold transition-colors"
        style={{
          background: isHighlighted ? 'var(--color-on-primary)' : 'var(--button-bg)',
          color: isHighlighted ? 'var(--color-primary)' : 'var(--button-text)',
          borderRadius: 'var(--button-radius)',
          boxShadow: isHighlighted ? 'var(--shadow-md)' : 'var(--button-shadow)',
        }}
      >
        {plan.cta ?? 'Select Plan'}
      </Button>
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const router = useRouter();

  const { data: dbPlans, isLoading, isError } = useGetSubscriptionsQuery();

  const handleSelect = (dbPlanId: string, stripePriceId: string, planName: string) => {
    if (planName.toLowerCase().includes('free')) {
      router.push('/dashboard');
      return;
    }
    router.push(`/checkout?planId=${dbPlanId}&priceId=${stripePriceId}`);
  };

  const filteredPlans = dbPlans
    ? dbPlans.filter((plan: BackendSubscriptionPlan) => {
        if (plan.planName.toLowerCase().includes('free')) return true;

        const targetPeriod = billing === 'monthly' ? 'Monthly' : 'Yearly';
        return plan.period === targetPeriod;
      })
    : [];

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    const order = ['free', 'pro', 'full'];
    const nameA = a.planName.toLowerCase();
    const nameB = b.planName.toLowerCase();

    const indexA = order.findIndex((o) => nameA.includes(o));
    const indexB = order.findIndex((o) => nameB.includes(o));

    return indexA - indexB;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !dbPlans) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-red-600">Failed to load subscription plans</h2>
        <p className="text-gray-500 mt-1">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-20" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 text-center mb-12 max-w-xl">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
          }}
        >
          <Zap size={11} strokeWidth={2.5} />
          Simple, transparent pricing
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
          Choose your <span style={{ color: 'var(--color-primary)' }}>teaching plan</span>
        </h1>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Start free, scale when you are ready. All plans include access to the Neuro Chord platform with no hidden
          fees.
        </p>

        <BillingToggle value={billing} onChange={setBilling} />
      </div>

      {/* ── CARDS ────────────────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {sortedPlans.map((plan: BackendSubscriptionPlan) => (
          <PlanCard key={plan.id} plan={plan} billing={billing} onSelect={handleSelect} />
        ))}
      </div>

      {/* ── FOOTER NOTE ──────────────────────────────────── */}
      <p className="mt-12 text-xs text-center max-w-sm" style={{ color: 'var(--color-text-placeholder)' }}>
        All prices in USD. You can cancel or change your plan at any time. Yearly plans are billed as a single annual
        charge.
      </p>
    </div>
  );
}
