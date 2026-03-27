import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-5 ring-1 ring-pink-100">
        <Link href="/" className="text-sm font-semibold text-pink-600">
          ← Back to Home
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated: March 2026</p>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            ReadMyVibe does not require account signup. We use a local anonymous session ID to track unlocked tools for your
            browser session.
          </p>
          <p>
            We store tool input, generation metadata, and payment status to provide service, maintain performance, and monitor
            usage.
          </p>
          <p>
            Payment processing is handled via Razorpay. We do not store your card or UPI credentials directly.
          </p>
          <p>
            We use Supabase and Vercel infrastructure to operate the service securely. Access to sensitive backend keys is
            restricted to server-side functions.
          </p>
          <p>
            We may use analytics to understand product performance and improve user experience.
          </p>
          <p>
            By using ReadMyVibe, you consent to this data usage for service operation.
          </p>
        </div>
      </div>
    </main>
  );
}
