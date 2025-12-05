import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { getSubscriptionPlanName } from "@/lib/utils";

interface DashboardHeaderProps {
  user: User;
  userData: any;
}

export default function DashboardHeader({
  user,
  userData,
}: DashboardHeaderProps) {
  const plan = userData?.subscription_status || "free";
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = plan === "free" ? 5 : plan === "pro" ? 100 : 1000;
  const isPro = plan === "pro" || plan === "enterprise";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user.email}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>
              Plan:{" "}
              <span className="font-semibold text-gray-900">
                {getSubscriptionPlanName(plan)}
              </span>
            </span>
            <span className="text-gray-300">•</span>
            <span>
              Validaciones este mes:{" "}
              <span className="font-semibold text-gray-900">
                {queriesThisMonth}/{planLimit}
              </span>
            </span>
          </div>
        </div>
        {!isPro && (
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#10B981] hover:bg-[#059669] transition-colors"
          >
            Mejorar Plan
          </Link>
        )}
      </div>
    </div>
  );
}

