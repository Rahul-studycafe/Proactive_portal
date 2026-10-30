"use client";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "../lib/store";
import { ThemeProvider } from "../contexts/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider store={store}>
        {children}
      </ReduxProvider>
    </ThemeProvider>
  );
}

