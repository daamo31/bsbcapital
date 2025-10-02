import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';

// Services
import BsbMaker from '@/pages/services/BsbMaker';
import Consultoria from '@/pages/services/Consultoria';
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

// Auth
import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';

// Testing
import TestPageSimple from '@/pages/testing/TestPageSimple';

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
        <AuthProvider>
          <Layout>
            <ScrollToTop />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/bsb-maker" element={<BsbMaker />} />
                <Route path="/consultoria" element={<Consultoria />} />
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
                <Route path="/test" element={<TestPageSimple />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/compra-exitosa" element={<CompraExitosa />} />

                <Route path="/panel/accesos" element={
                  <ProtectedRoute adminOnly={true}>
                    <AccessPanel />
                  </ProtectedRoute>
                } />

                {/* Ruta inteligente de Academia */}
                <Route path="/academia" element={
                  <AcademyProtectedRoute redirectToMemberships={true}>
                    <Navigate to="/academia/dashboard" replace />
                  </AcademyProtectedRoute>
                } />

                {/* Nuevas rutas de Academia integrada */}
                <Route path="/academia/dashboard" element={
                  <AcademyProtectedRoute>
                    <AcademiaDashboard />
                  </AcademyProtectedRoute>
                } />
                <Route path="/academia/modulo/:moduleId" element={
                  <AcademyProtectedRoute>
                    <ModuloAcademia />
                  </AcademyProtectedRoute>
                } />

                {oldAcademyRoutes.map(path => (
                  <Route key={path} path={path} element={<Navigate to="/formacion" replace />} />
                ))}

              </Routes>
            </AnimatePresence>
          </Layout>
        </AuthProvider>
      );
    }

    export default App;