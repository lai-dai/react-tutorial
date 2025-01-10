"use client";

import React from "react";
import { useCallbackRef } from "~/hooks/use-callback-ref";
import { useCounter } from "~/hooks/use-counter";
import { useRenderCount } from "~/hooks/use-render-count";

export default function Page() {
  const [delta, { inc: incDelta }] = useCounter(1);

  const [count, { inc }] = useCounter();

  const inc2 = React.useCallback(() => inc(delta), [delta, inc]);

  const inc3 = useCallbackRef(() => inc(delta));

  return (
    <div className="container mx-auto py-9">
      <p>Delta: {delta}</p>
      <div className="flex gap-3 *:border *:p-2">
        <button onClick={() => incDelta()}>inc Delta</button>
      </div>

      <div className="my-2 border-t"></div>

      <p>Count: {count}</p>
      <div className="flex gap-3 *:border *:p-2">
        <button onClick={() => inc()}>Inc</button>
        <button onClick={() => inc2()}>Inc sử dụng useCallback</button>
        <button onClick={() => inc3()}>Inc sử dụng useCallbackRef</button>
      </div>

      <NormalComponent title="sử dụng useCallback" fn={inc2} />

      <NormalComponent title="sử dụng useCallbackRef" fn={inc3} />

      <MemoComponent title="sử dụng useCallback" fn={inc2} />

      <MemoComponent title="sử dụng useCallbackRef" fn={inc3} />
    </div>
  );
}

function NormalComponent({ fn, title }: { fn?: () => void; title?: string }) {
  const renderCount = useRenderCount();

  return (
    <div>
      <p className="text-xl font-semibold text-red-500">
        Normal Component: {title}
      </p>

      <div>render count: {renderCount}</div>

      <div className="*:border *:p-2">
        <button onClick={fn}>Click</button>
      </div>
    </div>
  );
}

const MemoComponent = React.memo(
  ({ fn, title }: { fn?: () => void; title?: string }) => {
    const renderCount = useRenderCount();

    return (
      <div>
        <p className="text-xl font-semibold text-blue-500">
          Memo Component: {title}
        </p>
        <div>render count: {renderCount}</div>

        <div className="*:border *:p-2">
          <button onClick={fn}>Click</button>
        </div>
      </div>
    );
  },
);
MemoComponent.displayName = "MemoComponent";
