import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Diabetes from "./pages/Diabetes";
import HeartDisease from "./pages/HeartDisease";
import Parkinsons from "./pages/Parkinsons";
import Cancer from "./pages/Cancer";
import Kidney from "./pages/Kidney";
import Chat from "./pages/Chat";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import FloatingChatbot from "./components/FloatingChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/diabetes" element={<Diabetes />} />
              <Route path="/heart" element={<HeartDisease />} />
              <Route path="/parkinsons" element={<Parkinsons />} />
              <Route path="/cancer" element={<Cancer />} />
              <Route path="/kidney" element={<Kidney />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/team" element={<Team />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <FloatingChatbot />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;