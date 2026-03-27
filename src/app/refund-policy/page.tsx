import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-5 ring-1 ring-pink-100">
        <Link href="/" className="text-sm font-semibold text-pink-600">
          ← Back to Home
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Refund Policy</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated: March 2026</p>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <p className="font-semibold text-gray-900">All payments are final. No refunds will be provided.</p>
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
