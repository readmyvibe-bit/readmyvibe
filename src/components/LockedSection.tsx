import { Lock } from "lucide-react";

export default function LockedSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-purple-100">
      <div className="select-none blur-sm">
        <p className="text-base text-gray-700">
          2. Locked insight...
          {"\n\n"}3. Hidden traits...
          {"\n\n"}4. Your superpower...
          {"\n\n"}5. Final reveal...
        </p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-100/80 backdrop-blur-sm">
        <Lock className="h-8 w-8 text-purple-700" />
        <p className="mt-2 text-base font-semibold text-purple-800">Unlock full reading</p>
      </div>
    </div>
  );
}
