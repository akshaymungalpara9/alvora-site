/** Alvora combines the public manufacturing site with protected buyer and admin routes. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MarketLanding from "./pages/MarketLanding";

const AdminBuyers = lazy(() => import("./pages/AdminBuyers"));
const AdminOperations = lazy(() => import("./pages/AdminOperations"));
const AdminProductionBriefs = lazy(() => import("./pages/AdminProductionBriefs"));
const BuyerAvailability = lazy(() => import("./pages/BuyerAvailability"));

function RouteLoadingFallback() {
  return <main className="route-loading" role="status" aria-live="polite"><p>Loading secure workspace…</p></main>;
}

function Router() {
  return <Suspense fallback={<RouteLoadingFallback />}><Switch><Route path="/" component={Home} /><Route path="/fr">{() => <MarketLanding variant="fr" />}</Route><Route path="/it">{() => <MarketLanding variant="it" />}</Route><Route path="/us">{() => <MarketLanding variant="us" />}</Route><Route path="/availability" component={BuyerAvailability} /><Route path="/admin" component={AdminOperations} /><Route path="/admin/buyers" component={AdminBuyers} /><Route path="/admin/briefs" component={AdminProductionBriefs} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
