import React from "react";
import { useLazyRef } from "~/hooks/use-lazy-ref";

type Value = number;

function resolveHookState<S, C extends S>(nextState: S, currentState?: C): S {
  if (nextState instanceof Function) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (nextState.length ? nextState(currentState) : nextState()) as S;
  }

  return nextState;
}

export function useCounter(
  initialValue: Value | (() => Value) = 0,
  options?: { min?: number; max?: number },
): [
  Value,
  {
    set: React.Dispatch<React.SetStateAction<Value>>;
    inc: (delta?: React.SetStateAction<Value>) => void;
    dec: (delta?: React.SetStateAction<Value>) => void;
    reset: (value: React.SetStateAction<Value>) => void;
  },
] {
  const initRef = useLazyRef(resolveHookState(initialValue));
  const { min, max } = options ?? {};

  if (typeof min === "number") {
    initRef.current = Math.max(initRef.current, min);
  }

  if (typeof max === "number") {
    initRef.current = Math.min(initRef.current, max);
  }

  const [state, setState] = React.useState(initRef.current);

  const actions = React.useMemo(() => {
    const set: React.Dispatch<React.SetStateAction<Value>> = (newState) => {
      const prevState = state;
      let rState = resolveHookState(newState, prevState) as Value;

      if (prevState !== rState) {
        if (typeof min === "number") {
          rState = Math.max(rState, min);
        }
        if (typeof max === "number") {
          rState = Math.min(rState, max);
        }

        if (prevState !== rState) {
          setState(rState);
        }
      }
    };

    return {
      set,
      inc: (delta: React.SetStateAction<Value> = 1) => {
        const prevState = state;
        const rDelta = delta instanceof Function ? delta(prevState) : delta;

        if (typeof rDelta !== "number") {
          console.error(
            "delta has to be a number or function returning a number, got " +
              typeof rDelta,
          );
        }

        set((num) => num + rDelta);
      },
      dec: (delta: React.SetStateAction<Value> = 1) => {
        const prevState = state;
        const rDelta = delta instanceof Function ? delta(prevState) : delta;

        if (typeof rDelta !== "number") {
          console.error(
            "delta has to be a number or function returning a number, got " +
              typeof rDelta,
          );
        }

        set((num: number) => num - rDelta);
      },
      reset: (value: React.SetStateAction<Value>) => {
        const prevState = state;
        const rValue =
          value instanceof Function ? value(prevState) : (value ?? initRef);

        if (typeof rValue !== "number") {
          console.error(
            "value has to be a number or function returning a number, got " +
              typeof rValue,
          );
        }

        initRef.current = rValue;
        set(rValue);
      },
    };
  }, [initRef, max, min, state]);

  return [state, actions];
}
