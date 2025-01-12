import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parse, stringify } from "qs";
import React from "react";
import { useCallbackRef } from "~/hooks/use-callback-ref";

export const PARAM_RESET = undefined;

export type UseUrlParamsReturn<T> = [
  <R>(name: keyof T, defaultValue: R) => R,
  (value: unknown, name?: keyof T) => void,
  () => void,
];

export function useUrlParams<
  T extends Record<string, unknown>,
>(): UseUrlParamsReturn<T> {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getter = React.useCallback(
    <R>(name: keyof T, defaultValue: R) => {
      if (typeof name === "string" || typeof name === "number") {
        const get = (key: keyof T) => {
          const prevParamsStr = searchParams.toString();

          if (prevParamsStr) {
            const prevParams = parse(prevParamsStr) as T;
            return prevParams[key] || defaultValue;
          }

          return defaultValue;
        };

        const newValue = get(name);

        if (typeof defaultValue === "number") {
          return Number(newValue) as R;
        }

        return newValue as R;
      }
      return defaultValue;
    },
    [searchParams],
  );

  const setter = useCallbackRef((nextValue: unknown, name?: keyof T) => {
    let newParams;
    let newParamsStr;
    const prevParamsStr = searchParams.toString();
    const prevParams = parse(prevParamsStr);

    if (name) {
      newParams = {
        ...prevParams,
        [name]: nextValue,
      };
    } else if (nextValue instanceof Object) {
      newParams = {
        ...prevParams,
        ...nextValue,
      };
    }

    if (newParams) {
      newParamsStr = stringify(newParams, {
        encodeValuesOnly: true, // prettify URL
      });
    }

    if (newParamsStr) {
      router.push(`?${newParamsStr}`);
    }
  });

  const reset = useCallbackRef(() => {
    router.push(pathname);
  });

  return [getter, setter, reset] as UseUrlParamsReturn<T>;
}
