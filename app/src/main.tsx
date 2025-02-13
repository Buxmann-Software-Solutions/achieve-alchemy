import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "@/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { PomodoroProvider } from "@/stores/PomodoroContext";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { ReactQueryProvider } from "./providers/react-query-provider";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ReactQueryProvider>
        <ThemeProvider>
          <PomodoroProvider>
            <RouterProvider router={router} />
          </PomodoroProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </StrictMode>
  );
}
