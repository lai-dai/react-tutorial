"use client";

import React from "react";
import {
  useControllableState,
  type UseControllableStateProps,
} from "~/hooks/use-controllable-state";

export default function ControllableStatePage() {
  const [value, setValue] = React.useState("abs");

  return (
    <div>
      <button onClick={() => setValue(`${Date.now()}`)}>control</button>
      <p>my input</p>
      <MyInput defaultProp={"abs"} prop={value} onChange={setValue} />
    </div>
  );
}

function MyInput(props: UseControllableStateProps<string>) {
  const [value, setValue] = useControllableState(props);
  return (
    <input
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    />
  );
}
