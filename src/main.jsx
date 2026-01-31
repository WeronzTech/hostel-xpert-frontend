import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import {Suspense} from "react";
import {store} from "./redux/store.js";
import {Provider} from "react-redux";
import LoadingSpinner from "./ui/loadingSpinner/LoadingSpinner.jsx";
import {NotificationProvider} from "./ui/NotificationContext.jsx";
import App from "./App.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {SocketProvider} from "./context/SocketContext.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <App />
          </Suspense>
        </NotificationProvider>
      </QueryClientProvider>
    </SocketProvider>
  </Provider>
  // </StrictMode>
);
