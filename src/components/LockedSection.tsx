import { Lock } from "lucide-react";

export default function LockedSection() {
  return (
    <div className="rvm-card relative overflow-hidden rounded-2xl p-4">
      <div className="select-none blur-sm">
        <p className="text-base text-[#5a9090]">
          2. Locked insight...
          {"\n\n"}3. Hidden traits...
          {"\n\n"}4. Your superpower...
          {"\n\n"}5. Final reveal...
        </p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#e8faf6cc] backdrop-blur-sm">
        <Lock className="h-8 w-8 text-[#007a70]" />
        <p className="mt-2 text-base font-semibold text-[#007a70]">Unlock full reading</p>
      </div>
    </div>
  );
}
