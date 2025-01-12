import React from "react";
import { useControllableState } from "~/hooks/use-controllable-state";
import { useLazyRef } from "~/hooks/use-lazy-ref";

type Value = number;

export type UseCounterProps = {
  defaultValue?: Value | (() => Value);
  max?: number;
  min?: number;
  onValueChange?: (state: Value) => void;
  shouldUpdate?: (prev: Value, next: Value) => boolean;
  value?: Value;
};

export type UseCounterReturn = [
  Value,
  {
    dec: (delta?: React.SetStateAction<Value>) => void;
    inc: (delta?: React.SetStateAction<Value>) => void;
    reset: (value: React.SetStateAction<Value>) => void;
    set: React.Dispatch<React.SetStateAction<Value>>;
  },
];

export function useCounter(props: UseCounterProps): UseCounterReturn {
  const {
    min,
    max,
    defaultValue = 0,
    onValueChange,
    shouldUpdate,
    value,
  } = props ?? {};

  const defaultValueRef = useLazyRef(() => {
    const setter = defaultValue as () => Value;
    return defaultValue instanceof Function ? setter() : defaultValue;
  });

  if (typeof min === "number") {
    defaultValueRef.current = Math.max(defaultValueRef.current, min);
  }

  if (typeof max === "number") {
    defaultValueRef.current = Math.min(defaultValueRef.current, max);
  }

  const [state, setState] = useControllableState({
    defaultProp: defaultValueRef.current,
    onChange: onValueChange,
    prop: value,
    shouldUpdate,
  });

  const actions = React.useMemo(() => {
    const set = (next: React.SetStateAction<Value>) => {
      const prevState = state;
      const setter = next as (prevState?: Value) => Value;
      let nextValue = next instanceof Function ? setter(prevState) : next;

      if (prevState !== nextValue) {
        if (typeof min === "number") {
          nextValue = Math.max(nextValue, min);
        }
        if (typeof max === "number") {
          nextValue = Math.min(nextValue, max);
        }

        if (prevState !== nextValue) {
          setState(nextValue);
        }
      }
    };

    return {
      set,
      inc: (delta: React.SetStateAction<Value> = 1) => {
        const prevState = state;
        const rDelta = delta instanceof Function ? delta(prevState) : delta;

        if (typeof rDelta !== "number") {
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
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
          value instanceof Function
            ? value(prevState)
            : (value ?? defaultValueRef);

        if (typeof rValue !== "number") {
          // eslint-disable-next-line no-console
          console.error(
            "value has to be a number or function returning a number, got " +
              typeof rValue,
          );
        }

        defaultValueRef.current = rValue;
        set(rValue);
      },
    };
  }, [defaultValueRef, max, min, setState, state]);

  return [state, actions];
}
