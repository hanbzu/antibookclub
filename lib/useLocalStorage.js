import React from "react";

export default function useLocalStorage(initialState) {
  const [state, setState] = React.useState(
    process.browser &&
      JSON.parse(
        localStorage.getItem("antibookclub-v1") || JSON.stringify(initialState)
      )
  );

  return [
    state,
    (f) => {
      const newState = { ...state, ...f(state) };
      setState(newState);
      localStorage.setItem("antibookclub-v1", JSON.stringify(newState));
    },
  ];
}
