import { AppLayout } from "@/components/app-layout";
import { Clapperboard } from "lucide-react";

export default function CreatorStudioPage() {
  return (
    <AppLayout title="Creator Studio">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Clapperboard className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Creator Studio Coming Soon</h3>
        <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
          Analytics, content scheduling, and creator tools are on the way.
        </p>
      </div>
    </AppLayout>
  );
}
