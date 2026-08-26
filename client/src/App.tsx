/** Alvora combines the public manufacturing site with protected buyer and admin routes. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import WhatsAppQuickContact from "@/components/WhatsAppQuickContact";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const AdminBuyers = lazy(() => import("./pages/AdminBuyers"));
const AdminAvailability = lazy(() => import("./pages/AdminAvailability"));
const AdminOperations = lazy(() => import("./pages/AdminOperations"));
const AdminProductionBriefs = lazy(() => import("./pages/AdminProductionBriefs"));
const BuyerAvailability = lazy(() => import("./pages/BuyerAvailability"));
const PublicAvailability = lazy(() => import("./pages/PublicAvailability"));
const MarketLanding = lazy(() => import("./pages/MarketLanding"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const Insights = lazy(() => import("./pages/Insights"));
const Refer = lazy(() => import("./pages/Refer"));

function RouteLoadingFallback() {
  return <main className="route-loading" role="status" aria-live="polite"><p>Loading Alvora…</p></main>;
}

function Router() {
  return <Suspense fallback={<RouteLoadingFallback />}><Switch><Route path="/" component={Home} /><Route path="/fr/availability">{() => <PublicAvailability locale="fr" />}</Route><Route path="/it/availability">{() => <PublicAvailability locale="it" />}</Route><Route path="/fr">{() => <MarketLanding variant="fr" />}</Route><Route path="/it">{() => <MarketLanding variant="it" />}</Route><Route path="/us">{() => <MarketLanding variant="us" />}</Route><Route path="/availability">{() => <PublicAvailability />}</Route><Route path="/buyer-availability" component={BuyerAvailability} /><Route path="/insights">{() => <Insights />}</Route><Route path="/insights/:slug">{({ slug }) => <Insights articleSlug={slug} />}</Route><Route path="/refer" component={Refer} /><Route path="/privacy">{() => <LegalPage page="privacy" />}</Route><Route path="/terms">{() => <LegalPage page="terms" />}</Route><Route path="/admin" component={AdminOperations} /><Route path="/admin/buyers" component={AdminBuyers} /><Route path="/admin/availability" component={AdminAvailability} /><Route path="/admin/briefs" component={AdminProductionBriefs} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /><WhatsAppQuickContact /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
