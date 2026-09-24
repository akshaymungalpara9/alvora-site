/** Alvora: jewellery at the root, the wholesale manufacturing site under /trade, plus protected buyer and admin routes. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { initGA4, rememberLandingPage } from "@/lib/ga4";
import { PRODUCT_PAGES } from "@/lib/productPages";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, useEffect } from "react";
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
const MatchedPairDiamonds = lazy(() => import("./pages/MatchedPairDiamonds"));
const CustomCutDiamonds = lazy(() => import("./pages/CustomCutDiamonds"));
const MeleeDiamonds = lazy(() => import("./pages/MeleeDiamonds"));
const Certifications = lazy(() => import("./pages/Certifications"));
const About = lazy(() => import("./pages/About"));
const ForJewelryBrands = lazy(() => import("./pages/ForJewelryBrands"));
const RequestAQuote = lazy(() => import("./pages/RequestAQuote"));
const Contact = lazy(() => import("./pages/Contact"));
const MarkdownPage = lazy(() => import("./components/pages/MarkdownPage"));
const SingaporeHub = lazy(() => import("./pages/SingaporeHub"));
const SgWholesaleLgd = lazy(() => import("./pages/singapore/WholesaleLgd"));
const SgLgdWholesaler = lazy(() => import("./pages/singapore/LgdWholesaler"));
const SgForJewellers = lazy(() => import("./pages/singapore/ForJewellers"));
const SgLgdSupplier = lazy(() => import("./pages/singapore/LgdSupplier"));
const SgCalibratedParcels = lazy(() => import("./pages/singapore/CalibratedParcels"));
const SgMatchedPairs = lazy(() => import("./pages/singapore/MatchedPairs"));
const SgMelee = lazy(() => import("./pages/singapore/Melee"));
const SgForManufacturers = lazy(() => import("./pages/singapore/ForManufacturers"));
const SgSuratToSingapore = lazy(() => import("./pages/singapore/SuratToSingapore"));
const SgWholesaleParcels = lazy(() => import("./pages/singapore/WholesaleParcels"));
const StonePassport = lazy(() => import("./pages/StonePassport"));
const TradeHome = lazy(() => import("./pages/TradeHome"));
const TradeJewellery = lazy(() => import("./pages/TradeJewellery"));
const CollectionPage = lazy(() => import("./pages/jewellery/CollectionPage"));
const ProductPage = lazy(() => import("./pages/jewellery/ProductPage"));
const ConsultationPage = lazy(() => import("./pages/jewellery/ConsultationPage"));
const GuidePage = lazy(() => import("./pages/jewellery/GuidePage"));
const AdminJewelleryEnquiries = lazy(() => import("./pages/AdminJewelleryEnquiries"));

/** Jewellery collection routes (see COLLECTION_ROUTES in CollectionPage). */
const COLLECTION_PATHS = ["/jewellery", "/engagement-rings", "/rings", "/earrings", "/pendants", "/wedding-bands", "/jewellery/antique-cuts", "/jewellery/coloured-stones"];

function RouteLoadingFallback() {
  return <main className="route-loading" role="status" aria-live="polite"><p>Loading Alvora…</p></main>;
}

function Router() {
  return <Suspense fallback={<RouteLoadingFallback />}><Switch><Route path="/" component={Home} /><Route path="/trade" component={TradeHome} /><Route path="/trade/jewellery" component={TradeJewellery} />{COLLECTION_PATHS.map((path) => (<Route key={path} path={path}>{() => <CollectionPage path={path} />}</Route>))}<Route path="/engagement-rings/shape/:shape">{({ shape }) => <CollectionPage key={shape} path="/engagement-rings" shape={shape} />}</Route><Route path="/jewellery/:slug">{({ slug }) => <ProductPage key={slug} slug={slug} />}</Route><Route path="/book-a-consultation" component={ConsultationPage} /><Route path="/guides/:slug">{({ slug }) => <GuidePage key={slug} slug={slug} />}</Route><Route path="/fr/availability">{() => <PublicAvailability locale="fr" />}</Route><Route path="/it/availability">{() => <PublicAvailability locale="it" />}</Route><Route path="/fr">{() => <MarketLanding variant="fr" />}</Route><Route path="/it">{() => <MarketLanding variant="it" />}</Route><Route path="/us">{() => <MarketLanding variant="us" />}</Route><Route path="/availability">{() => <PublicAvailability />}</Route><Route path="/buyer-availability">{() => <PublicAvailability />}</Route><Route path="/insights">{() => <Insights />}</Route><Route path="/insights/:slug">{({ slug }) => <Insights articleSlug={slug} />}</Route><Route path="/singapore" component={SingaporeHub} /><Route path="/singapore/wholesale-lab-grown-diamonds" component={SgWholesaleLgd} /><Route path="/singapore/lab-grown-diamond-wholesaler" component={SgLgdWholesaler} /><Route path="/singapore/for-jewellers" component={SgForJewellers} /><Route path="/singapore/lab-grown-diamond-supplier" component={SgLgdSupplier} /><Route path="/singapore/calibrated-parcels" component={SgCalibratedParcels} /><Route path="/singapore/matched-pairs" component={SgMatchedPairs} /><Route path="/singapore/melee" component={SgMelee} /><Route path="/singapore/for-manufacturers" component={SgForManufacturers} /><Route path="/singapore/surat-to-singapore" component={SgSuratToSingapore} /><Route path="/singapore/wholesale-parcels" component={SgWholesaleParcels} /><Route path="/stone/:report">{({ report }) => <StonePassport report={report} />}</Route><Route path="/refer" component={Refer} /><Route path="/privacy">{() => <LegalPage page="privacy" />}</Route><Route path="/terms">{() => <LegalPage page="terms" />}</Route>{PRODUCT_PAGES.map((page) => (<Route key={page.route} path={page.route}>{() => <MarkdownPage page={page} />}</Route>))}<Route path="/matched-pair-diamonds" component={MatchedPairDiamonds} /><Route path="/custom-cut-diamonds" component={CustomCutDiamonds} /><Route path="/melee-diamonds" component={MeleeDiamonds} /><Route path="/certifications" component={Certifications} /><Route path="/about" component={About} /><Route path="/for-jewelry-brands" component={ForJewelryBrands} /><Route path="/request-a-quote" component={RequestAQuote} /><Route path="/contact" component={Contact} /><Route path="/admin" component={AdminOperations} /><Route path="/admin/buyers" component={AdminBuyers} /><Route path="/admin/availability" component={AdminAvailability} /><Route path="/admin/briefs" component={AdminProductionBriefs} /><Route path="/admin/jewellery" component={AdminJewelleryEnquiries} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

function App() {
  useEffect(() => { rememberLandingPage(); initGA4(); }, []);
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /><FloatingWhatsApp /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
