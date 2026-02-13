import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home'; // Keep Home static for fast LCP
import { Loader2 } from 'lucide-react';

// Components
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute.jsx';

import ScrollToTop from '@/components/layout/ScrollToTop';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AcademyProtectedRoute from '@/components/auth/AcademyProtectedRoute';

// Lazy Load Pages
// Services
const BsbMaker = lazy(() => import('@/pages/services/BsbMaker'));
const Consultoria = lazy(() => import('@/pages/services/Consultoria'));
const ConsultationPricing = lazy(() => import('@/pages/ConsultationPricing'));
const AlgoFund = lazy(() => import('@/pages/services/AlgoFund.jsx'));
const OtrosServicios = lazy(() => import('@/pages/services/OtrosServicios.jsx'));
const Academia = lazy(() => import('@/pages/services/Academia.jsx'));

// Company
const Empresa = lazy(() => import('@/pages/company/Empresa.jsx'));
const Legal = lazy(() => import('@/pages/company/Legal.jsx'));
const Contacto = lazy(() => import('@/pages/company/Contacto.jsx'));

// Content
const Blog = lazy(() => import('@/pages/content/Blog.jsx'));
const GuiaInversion = lazy(() => import('@/pages/content/GuiaInversion.jsx'));

// Academia
const AcademiaIndex = lazy(() => import('@/pages/academia/AcademiaIndex.jsx'));
const AcademiaCatalog = lazy(() => import('@/pages/academia/AcademiaCatalog.jsx'));
const AcademiaContent = lazy(() => import('@/pages/academia/AcademiaContent.jsx'));
const AcademiaAdmin = lazy(() => import('@/pages/academia/AcademiaAdmin.jsx'));
const ModuloAcademia = lazy(() => import('@/pages/academia/ModuloAcademia.jsx'));

// Payments
const Paquetes = lazy(() => import('@/pages/payments/Paquetes.jsx'));
const CompraExitosa = lazy(() => import('@/pages/payments/CompraExitosa.jsx'));
const CheckoutPage = lazy(() => import('@/pages/payments/CheckoutPage.jsx'));
const PaqueteConfirmado = lazy(() => import('@/pages/payments/PaqueteConfirmado.jsx'));
const MembresiaConfirmada = lazy(() => import('@/pages/payments/MembresiaConfirmada.jsx'));

// Dashboard
const UserDashboard = lazy(() => import('@/pages/dashboard/UserDashboard.jsx'));
const AcademiaDashboard = lazy(() => import('@/pages/dashboard/AcademiaDashboard.jsx'));
const AreaCliente = lazy(() => import('@/pages/dashboard/AreaCliente.jsx'));

// Admin
const AccessPanel = lazy(() => import('@/pages/admin/AccessPanel.jsx'));
const HotmartSystemStatus = lazy(() => import('@/components/admin/HotmartSystemStatus.jsx'));

// Demo/Testing
const ConsultationFormDemo = lazy(() => import('@/pages/ConsultationFormDemo.jsx'));
const ConsultationPostPayment = lazy(() => import('@/pages/ConsultationPostPayment.jsx'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard.jsx'));

// Auth
const Login = lazy(() => import('@/pages/auth/Login'));
const SignUp = lazy(() => import('@/pages/auth/SignUp'));

// Testing
const TestPageSimple = lazy(() => import('@/pages/testing/TestPageSimple'));
const FormularioDemo = lazy(() => import('@/pages/testing/FormularioDemo'));
const ContentAccessDemo = lazy(() => import('@/components/academy/ContentAccessDemo'));
const HotmartAcademy = lazy(() => import('@/pages/content/HotmartAcademy'));
const EmailTester = lazy(() => import('@/pages/EmailTester'));
const HotmartIntegrationDemo = lazy(() => import('@/pages/content/HotmartIntegrationDemo'));
const HotmartTestPlayer = lazy(() => import('@/components/hotmart/HotmartTestPlayer'));
const ContentSystemDemo = lazy(() => import('@/pages/content/ContentSystemDemo'));
const TestNavigationPage = lazy(() => import('@/pages/testing/TestNavigationPage'));

// Nuevas páginas de integración Hotmart
const HotmartProfessionalIntegration = lazy(
  () => import('@/pages/content/HotmartProfessionalIntegration')
);
const EjemploUsoHotmart = lazy(() => import('@/pages/examples/EjemploUsoHotmart'));
const AcademiaTestPage = lazy(() => import('@/pages/testing/AcademiaTestPage'));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-10 w-10 animate-spin text-brand-gold-500" />
  </div>
);

function App() {
  const location = useLocation();

  const oldAcademyRoutes = [
    '/academia',
    '/academia/contenido/:slug',
    '/academia/ruta/:slug',
    '/academia/admin',
    '/academia/gracias',
    '/verify-email',
    '/error-verificacion',
    '/academia-legacy',
    '/app',
    '/client-dashboard',
  ];

  return (
    <AuthProvider>
      <Layout>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/bsb-maker" element={<BsbMaker />} />
              <Route path="/consultoria-cripto" element={<Consultoria />} />
              <Route path="/consultoria-cripto/precios" element={<ConsultationPricing />} />
              <Route path="/consultation-post-payment" element={<ConsultationPostPayment />} />
              <Route path="/paquetes-cripto" element={<Paquetes />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/area-cliente"
                element={
                  <ProtectedRoute>
                    <AreaCliente />
                  </ProtectedRoute>
                }
              />
              <Route path="/empresa" element={<Empresa />} />
              <Route path="/algo-fund" element={<AlgoFund />} />
              <Route path="/servicios-adicionales-cripto" element={<OtrosServicios />} />
              <Route path="/legal/:page" element={<Legal />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/guia-inversion" element={<GuiaInversion />} />
              <Route path="/formacion-criptoactivos" element={<Academia />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/demo-formularios" element={<FormularioDemo />} />
              <Route path="/test-simple" element={<TestPageSimple />} />
              <Route path="/demo-acceso" element={<ContentAccessDemo />} />
              <Route path="/hotmart-academy" element={<HotmartAcademy />} />
              <Route path="/hotmart-demo" element={<HotmartIntegrationDemo />} />
              <Route path="/content-system-demo" element={<ContentSystemDemo />} />
              <Route
                path="/hotmart-test"
                element={
                  <HotmartTestPlayer
                    contentId="module_1"
                    title="Test de Integración Hotmart"
                    description="Prueba la conexión con Hotmart en diferentes modos"
                  />
                }
              />

              {/* Nuevas rutas para integración profesional Hotmart */}
              <Route
                path="/content/hotmart-professional-integration"
                element={<HotmartProfessionalIntegration />}
              />
              <Route path="/examples/ejemplo-uso-hotmart" element={<EjemploUsoHotmart />} />
              <Route path="/test/academia-real" element={<AcademiaTestPage />} />

              <Route path="/test-navigation" element={<TestNavigationPage />} />
              <Route path="/hotmart-status" element={<HotmartSystemStatus />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/compra-exitosa" element={<CompraExitosa />} />
              <Route path="/academia/paquete-confirmado" element={<PaqueteConfirmado />} />
              <Route path="/academia/membresia-confirmada" element={<MembresiaConfirmada />} />

              <Route
                path="/panel/accesos"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AccessPanel />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard - Sistema completo de administración */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />

              {/* Academia Routes - Nueva estructura */}
              <Route path="/academia" element={<AcademiaIndex />}>
                <Route path="catalogo" element={<AcademiaCatalog />} />
                <Route
                  path="contenido/:slug"
                  element={
                    <AcademyProtectedRoute>
                      <AcademiaContent />
                    </AcademyProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AcademiaAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="modulo/:moduleId"
                  element={
                    <AcademyProtectedRoute>
                      <ModuloAcademia />
                    </AcademyProtectedRoute>
                  }
                />
              </Route>

              {/* Rutas de Dashboard separadas */}
              <Route
                path="/academia/dashboard"
                element={
                  <AcademyProtectedRoute>
                    <AcademiaDashboard />
                  </AcademyProtectedRoute>
                }
              />

              {/* Rutas de Testing */}
              <Route path="/email-tester" element={<EmailTester />} />
              <Route
                path="/test/hotmart"
                element={
                  <HotmartTestPlayer
                    contentId="module_1"
                    title="Test de Integración Hotmart"
                    description="Prueba la conexión con Hotmart en diferentes modos"
                  />
                }
              />
              <Route path="/test/user-status" element={<TestNavigationPage />} />
              <Route path="/demo/consultation-form" element={<ConsultationFormDemo />} />
              <Route path="/test/tools" element={<ContentAccessDemo />} />

              {oldAcademyRoutes.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={<Navigate to="/formacion-criptoactivos" replace />}
                />
              ))}

              {/* Redirects for old URLs to new SEO-optimized URLs */}
              <Route path="/consultoria" element={<Navigate to="/consultoria-cripto" replace />} />
              <Route
                path="/consultoria/precios"
                element={<Navigate to="/consultoria-cripto/precios" replace />}
              />
              <Route
                path="/formacion"
                element={<Navigate to="/formacion-criptoactivos" replace />}
              />
              <Route path="/membresias" element={<Navigate to="/paquetes-cripto" replace />} />
              <Route
                path="/otros-servicios"
                element={<Navigate to="/servicios-adicionales-cripto" replace />}
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </Layout>
    </AuthProvider>
  );
}

export default App;
