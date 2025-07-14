
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import CreateMeal from "./pages/CreateMeal";
import WeeklyMenu from "./pages/WeeklyMenu";
import CreateWorkoutPlan from "./pages/CreateWorkoutPlan";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import DetailedReports from "./pages/DetailedReports";
import BodyMeasurements from "./pages/BodyMeasurements";
import ProgressPhotos from "./pages/ProgressPhotos";
import NotFound from "./pages/NotFound";
import './i18n';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-meal" element={<CreateMeal />} />
          <Route path="/weekly-menu" element={<WeeklyMenu />} />
          <Route path="/create-workout-plan" element={<CreateWorkoutPlan />} />
          <Route path="/exercise-library" element={<ExerciseLibrary />} />
          <Route path="/detailed-reports" element={<DetailedReports />} />
          <Route path="/body-measurements" element={<BodyMeasurements />} />
          <Route path="/progress-photos" element={<ProgressPhotos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
