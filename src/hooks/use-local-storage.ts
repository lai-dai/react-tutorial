import React from "react";
import { useCallbackRef } from "~/hooks/use-callback-ref";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const isBrowser = typeof window !== "undefined";

type Version = string | number;

type ClientState<T> = {
  data: T;
  timestamp: number;
  version: Version;
};

type ParserOptions<T> =
  | {
      raw?: true;
    }
  | {
      raw: false;
      serializer: (value: ClientState<T>) => string;
      deserializer: (value: string) => ClientState<T>;
    };

export type UseLocalStorageProps<T> = ParserOptions<T> & {
  initialValue?: T;
  key: string;
  maxAge?: number;
  version?: Version;
};

export type UseLocalStorageReturn<T> = [
  T | undefined,
  React.Dispatch<React.SetStateAction<T>>,
  () => void,
];

export function useLocalStorage<T>(
  props: UseLocalStorageProps<T>,
): UseLocalStorageReturn<T> {
  const { initialValue, key, maxAge = 0, version = 0, ...options } = props;

  const formatValue = React.useCallback(
    (next: T) =>
      ({
        data: next,
        timestamp: Date.now(),
        version,
      }) as ClientState<T>,
    [version],
  );

  const parseValue = React.useCallback(
    (clientState: ClientState<T>) => {
      if (typeof clientState?.timestamp !== "number") {
        return clientState?.data ?? initialValue;
      }
      const expired =
        maxAge !== 0 && Date.now() - clientState.timestamp > maxAge;

      if (expired || clientState?.version !== version) {
        localStorage.removeItem(key);

        return initialValue;
      }
      return clientState?.data ?? initialValue;
    },
    [initialValue, key, maxAge, version],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deserializer: (value: string) => ClientState<T> = useCallbackRef(
    typeof options?.raw === "boolean"
      ? options.raw === false
        ? options?.deserializer
        : (value: string) => value
      : JSON.parse,
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const initializer = React.useRef((key: string) => {
    try {
      const serializer =
        typeof options?.raw === "boolean"
          ? options.raw === false
            ? options.serializer
            : String
          : JSON.stringify;

      const persistedClient = localStorage.getItem(key);
      if (persistedClient !== null) {
        return parseValue(deserializer(persistedClient));
      }
      if (initialValue) {
        localStorage.setItem(key, serializer(formatValue(initialValue)));
      }
      return initialValue;
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw. JSON.parse and JSON.stringify
      // can throw, too.
      return initialValue;
    }
  });

  const [state, setState] = React.useState(() => initializer.current(key));

  React.useLayoutEffect(() => setState(initializer.current(key)), [key]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const set = React.useCallback(
    (next: React.SetStateAction<T>) => {
      try {
        const prevState = state;
        const setter = next as (prevState?: T) => T;
        const nextValue = next instanceof Function ? setter(prevState) : next;

        if (nextValue === undefined) {
          return;
        }
        let value: string;

        if (options)
          if (options.raw)
            if (typeof nextValue === "string") value = nextValue;
            else value = JSON.stringify(formatValue(nextValue));
          else if (options.raw === false && options.serializer)
            value = options.serializer(formatValue(nextValue));
          else value = JSON.stringify(formatValue(nextValue));
        else value = JSON.stringify(formatValue(nextValue));

        localStorage.setItem(key, value);
        setState(parseValue(deserializer(value)));
      } catch {
        // If user is in private mode or has storage restriction
        // localStorage can throw. Also JSON.stringify can throw.
      }
    },
    [deserializer, formatValue, key, options, parseValue, state],
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const remove = React.useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(undefined);
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw.
    }
  }, [key]);

  if (!isBrowser) {
    return [initialValue as T, noop, noop];
  }

  if (!key) {
    throw new Error("useLocalStorage key may not be falsy");
  }

  return [state, set, remove];
}
