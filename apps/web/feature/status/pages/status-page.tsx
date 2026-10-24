import { CircleAlert, CircleCheck, CircleHelp, type LucideIcon } from "lucide-react";

import type { ServiceState } from "@/core/models/health";
import { getSystemHealth } from "@/core/services/health.service";

type State = ServiceState | "unknown";

const STATE_STYLE: Record<State, { icon: LucideIcon; label: string; className: string }> = {
  up: { icon: CircleCheck, label: "Operational", className: "text-emerald-600" },
  down: { icon: CircleAlert, label: "Unreachable", className: "text-red-600" },
  unknown: { icon: CircleHelp, label: "Unknown", className: "text-slate-400" },
};

/** Developer page: confirms the web app can reach apps/api and its database. */
export default async function StatusPage() {
  const health = await getSystemHealth();
  const rows: { name: string; description: string; state: State }[] = [
    { name: "Web app", description: "apps/web (Next.js)", state: "up" },
    { name: "API", description: "apps/api (NestJS) · GET /health", state: health.api },
    { name: "Database", description: "PostgreSQL, checked by the API", state: health.database },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">System status</h1>
        <p className="mt-1 text-slate-600">
          Environment:{" "}
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800">
            {health.environment}
          </span>{" "}
          · Checked on every page load.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-200">
          {rows.map(({ name, description, state }) => {
            const { icon: Icon, label, className } = STATE_STYLE[state];
            return (
              <li key={name} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-slate-500">{description}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${className}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
