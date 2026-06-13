"use client";
import { useState } from "react";

interface PricingButtonProps {
  planSlug: string;
  popular?: boolean;
  cta: string;
}

export function PricingButton({ planSlug, popular, cta }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-body font-semibold transition-all mb-6 disabled:opacity-60 ${
        popular
          ? "bg-diamond-gold text-white hover:bg-diamond-gold-dark shadow-sm"
          : "border border-diamond-border text-diamond-text hover:border-diamond-gold hover:text-diamond-gold bg-white"
      }`}
    >
      {loading ? "Redirection..." : cta}
    </button>
  );
}
