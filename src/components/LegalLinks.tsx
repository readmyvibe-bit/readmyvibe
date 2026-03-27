import Link from "next/link";

export default function LegalLinks() {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-[#5a9090]">
      <Link href="/terms-and-conditions" className="underline underline-offset-2">
        Terms
      </Link>
      <Link href="/privacy-policy" className="underline underline-offset-2">
        Privacy
      </Link>
      <Link href="/refund-policy" className="underline underline-offset-2">
        Refund Policy
      </Link>
    </div>
  );
}
