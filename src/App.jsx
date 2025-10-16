import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import MobileErrorBoundary from '@/components/MobileErrorBoundary';
import Home from '@/pages/Home';

// Services
import BsbMaker from '@/pages/services/BsbMaker';
import Consultoria from '@/pages/services/Consultoria';
import ConsultationPricing from '@/pages/ConsultationPricing';
import AlgoFund from '@/pages/services/AlgoFund.jsx';
import OtrosServicios from '@/pages/services/OtrosServicios.jsx';
import Formacion from '@/pages/services/Formacion.jsx';

// Company
import Empresa from '@/pages/company/Empresa.jsx';
import Legal from '@/pages/company/Legal.jsx';
import Contacto from '@/pages/company/Contacto.jsx';

// Content
import Blog from '@/pages/content/Blog.jsx';
import GuiaInversion from '@/pages/content/GuiaInversion.jsx';

// Academia
import AcademiaIndex from '@/pages/academia/AcademiaIndex.jsx';
import AcademiaCatalog from '@/pages/academia/AcademiaCatalog.jsx';
import AcademiaContent from '@/pages/academia/AcademiaContent.jsx';
import AcademiaAdmin from '@/pages/academia/AcademiaAdmin.jsx';
import ModuloAcademia from '@/pages/academia/ModuloAcademia.jsx';

// Payments
import MembresiasDB from '@/pages/payments/MembresiasDB.jsx';
import CompraExitosa from '@/pages/payments/CompraExitosa.jsx';
import CheckoutPage from '@/pages/payments/CheckoutPage.jsx';

// Dashboard
import UserDashboard from '@/pages/dashboard/UserDashboard.jsx';
import AcademiaDashboard from '@/pages/dashboard/AcademiaDashboard.jsx';

// Admin
import AccessPanel from '@/pages/admin/AccessPanel.jsx';

// Demo/Testing
import ConsultationFormDemo from '@/pages/ConsultationFormDemo.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import ResponsiveTest from '@/pages/ResponsiveTest.jsx';

// Components
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute.jsx';

// Auth
import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';

// Testing
import TestPageSimple from '@/pages/testing/TestPageSimple';
import TestSystemPage from '@/pages/TestSystemPage';
import ContentAccessDemo from '@/components/ContentAccessDemo';
import HotmartAcademy from '@/pages/content/HotmartAcademy';
import EmailTester from '@/pages/EmailTester';
import HotmartIntegrationDemo from '@/pages/content/HotmartIntegrationDemo';
import HotmartTestPlayer from '@/components/HotmartTestPlayer';
import TestNavigationPage from '@/pages/testing/TestNavigationPage';

import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AcademyProtectedRoute from '@/components/AcademyProtectedRoute';

function App() {
  const location = useLocation();

  const oldAcademyRoutes = [
    "/academia",
    "/academia/contenido/:slug",
    "/academia/ruta/:slug",
    "/academia/admin",
    "/academia/gracias",
    "/verify-email",
    "/error-verificacion",
    "/academia-legacy",
    "/app",
    "/area-cliente",
    "/client-dashboard"
  ];

  return (
    <MobileErrorBoundary>
      <AuthProvider>
        <Layout>
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/bsb-maker" element={<BsbMaker />} />
                <Route path="/consultoria" element={<Consultoria />} />
                <Route path="/consultoria/precios" element={<ConsultationPricing />} />
                <Route path="/membresias" element={<MembresiasDB />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/empresa" element={<Empresa />} />
                <Route path="/algo-fund" element={<AlgoFund />} />
                <Route path="/otros-servicios" element={<OtrosServicios />} />
                <Route path="/legal/:page" element={<Legal />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/guia-inversion" element={<GuiaInversion />} />
                <Route path="/formacion" element={<Formacion />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/test" element={<TestSystemPage />} />
                <Route path="/test-simple" element={<TestPageSimple />} />
                <Route path="/demo-acceso" element={<ContentAccessDemo />} />
                <Route path="/hotmart-academy" element={<HotmartAcademy />} />
                <Route path="/hotmart-demo" element={<HotmartIntegrationDemo />} />
                <Route path="/hotmart-test" element={
                  <HotmartTestPlayer 
                    contentId="module_1" 
                    title="Test de Integración Hotmart"
                    description="Prueba la conexión con Hotmart en diferentes modos"
                  />
                } />
                <Route path="/test-navigation" element={<TestNavigationPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/compra-exitosa" element={<CompraExitosa />} />

                <Route path="/panel/accesos" element={
                  <ProtectedRoute adminOnly={true}>
                    <AccessPanel />
                  </ProtectedRoute>
                } />

                {/* Admin Dashboard - Sistema completo de administración */}
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/*" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />

                {/* Academia Routes - Nueva estructura */}
                <Route path="/academia" element={<AcademiaIndex />}>
                  <Route path="catalogo" element={<AcademiaCatalog />} />
                  <Route path="contenido" element={
                    <AcademyProtectedRoute>
                      <AcademiaContent />
                    </AcademyProtectedRoute>
                  } />
                  <Route path="admin" element={
                    <ProtectedRoute adminOnly={true}>
                      <AcademiaAdmin />
                    </ProtectedRoute>
                  } />
                  <Route path="modulo/:moduleId" element={
                    <AcademyProtectedRoute>
                      <ModuloAcademia />
                    </AcademyProtectedRoute>
                  } />
                </Route>

                {/* Rutas de Dashboard separadas */}
                <Route path="/academia/dashboard" element={
                  <AcademyProtectedRoute>
                    <AcademiaDashboard />
                  </AcademyProtectedRoute>
                } />

                {/* Rutas de Testing */}
                <Route path="/email-tester" element={<EmailTester />} />
                <Route path="/test/hotmart" element={
                  <HotmartTestPlayer 
                    contentId="module_1" 
                    title="Test de Integración Hotmart"
                    description="Prueba la conexión con Hotmart en diferentes modos"
                  />
                } />
                <Route path="/test/user-status" element={<TestNavigationPage />} />
                <Route path="/demo/consultation-form" element={<ConsultationFormDemo />} />
                <Route path="/test/tools" element={<ContentAccessDemo />} />
                <Route path="/test/responsive" element={<ResponsiveTest />} />

                {oldAcademyRoutes.map(path => (
                  <Route key={path} path={path} element={<Navigate to="/formacion" replace />} />
                ))}

              </Routes>
            </AnimatePresence>
          </Layout>
        </AuthProvider>
      </MobileErrorBoundary>
    );
}

export default App;