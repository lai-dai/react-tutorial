"use client";

import React from "react";
import { useRenderCount } from "~/hooks/use-render-count";
import { useUrlState } from "~/hooks/use-url-state";

export default function UrlParamsPage() {
  const count = useRenderCount();
  const [filters, setFilters] = useUrlState({
    title: "test"
  })

  return (
    <div>
      <p>count: {count}</p>
      <div>filters: {JSON.stringify(filters, null, 2)}</div>

      <div className="*:border *:p-2">
        <button
          onClick={() => {
            setFilters({
              title: `${Date.now()}`,
            });
          }}
        >
          set Filters
        </button>
      </div>
    </div>
  );
}
