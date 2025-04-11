
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "@/pages/Index";
import MedicinePage from "@/pages/MedicinePage";
import PharmacyPage from "@/pages/PharmacyPage";
import DiaryPage from "@/pages/DiaryPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="medicine" element={<MedicinePage />} />
                <Route path="medicine/search" element={<MedicinePage />} />
                <Route path="pharmacy" element={<PharmacyPage />} />
                <Route path="login" element={<LoginPage />} />

              
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="diary" element={<DiaryPage />} />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
