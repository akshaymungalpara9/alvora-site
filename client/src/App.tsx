/** Alvora combines the public manufacturing site with protected buyer and admin routes. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminBuyers from "./pages/AdminBuyers";
import AdminProductionBriefs from "./pages/AdminProductionBriefs";
import BuyerAvailability from "./pages/BuyerAvailability";
import Home from "./pages/Home";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/availability" component={BuyerAvailability} /><Route path="/admin/buyers" component={AdminBuyers} /><Route path="/admin/briefs" component={AdminProductionBriefs} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
