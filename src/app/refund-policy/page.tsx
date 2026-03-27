import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="rvm-card mx-auto max-w-md rounded-2xl p-5">
        <Link href="/" className="text-sm font-semibold text-[#007a70]">
          ← Back to Home
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[#0a3030]">Refund Policy</h1>
        <p className="mt-1 text-sm text-[#6aabab]">Last updated: March 2026</p>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#0a3030]">
          <p className="font-semibold text-[#0a3030]">All payments are final. No refunds will be provided.</p>
          <p>
            ReadMyVibe delivers digital AI-generated content instantly after payment verification. Because this is an
            immediately consumed digital product, cancellations and refunds are not applicable.
          </p>
          <p>
            Please review tool details, pricing, and free preview carefully before unlocking paid content.
          </p>
          <p>
            If payment is deducted but content is not unlocked due to a technical issue, contact support with transaction
            details for resolution assistance.
          </p>
        </div>
      </div>
    </main>
  );
}
