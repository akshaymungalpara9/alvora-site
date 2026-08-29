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
const PublicAvailability = lazy(() => import("./pages/PublicAvailability"));
const MarketLanding = lazy(() => import("./pages/MarketLanding"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const Insights = lazy(() => import("./pages/Insights"));
const Refer = lazy(() => import("./pages/Refer"));
const B2BLanding = lazy(() => import("./pages/B2BLanding"));

function RouteLoadingFallback() {
  return <main className="route-loading" role="status" aria-live="polite"><p>Loading Alvora…</p></main>;
}

function Router() {
  return <Suspense fallback={<RouteLoadingFallback />}><Switch><Route path="/" component={Home} /><Route path="/fr/availability">{() => <PublicAvailability locale="fr" />}</Route><Route path="/it/availability">{() => <PublicAvailability locale="it" />}</Route><Route path="/fr">{() => <MarketLanding variant="fr" />}</Route><Route path="/it">{() => <MarketLanding variant="it" />}</Route><Route path="/us">{() => <MarketLanding variant="us" />}</Route><Route path="/availability">{() => <PublicAvailability />}</Route><Route path="/buyer-availability">{() => <PublicAvailability />}</Route><Route path="/insights">{() => <Insights />}</Route><Route path="/insights/:slug">{({ slug }) => <Insights articleSlug={slug} />}</Route><Route path="/refer" component={Refer} /><Route path="/oem-private-label-lab-grown-diamond-jewellery">{() => <B2BLanding page="oem" />}</Route><Route path="/wholesale-lab-grown-diamond-jewellery">{() => <B2BLanding page="wholesale" />}</Route><Route path="/export-lab-grown-diamond-jewellery">{() => <B2BLanding page="export" />}</Route><Route path="/custom-jewellery-manufacturing">{() => <B2BLanding page="custom" />}</Route><Route path="/lab-grown-diamond-rings-wholesale">{() => <B2BLanding page="rings" />}</Route><Route path="/trade-catalogue">{() => <B2BLanding page="catalogue" />}</Route><Route path="/process-and-documentation">{() => <B2BLanding page="proof" />}</Route><Route path="/wholesale-cvd-diamonds-surat">{() => <B2BLanding page="cvd" />}</Route><Route path="/hpht-fancy-color-lab-grown">{() => <B2BLanding page="hpht" />}</Route><Route path="/bulk-melee-parcels">{() => <B2BLanding page="melee" />}</Route><Route path="/trade-registration">{() => <B2BLanding page="registration" />}</Route><Route path="/privacy">{() => <LegalPage page="privacy" />}</Route><Route path="/terms">{() => <LegalPage page="terms" />}</Route><Route path="/admin" component={AdminOperations} /><Route path="/admin/buyers" component={AdminBuyers} /><Route path="/admin/availability" component={AdminAvailability} /><Route path="/admin/briefs" component={AdminProductionBriefs} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /><WhatsAppQuickContact /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
