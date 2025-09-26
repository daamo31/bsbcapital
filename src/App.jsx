import React from 'react';
    import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
    import { AnimatePresence } from 'framer-motion';
    import Layout from '@/components/Layout';
    import Home from '@/pages/Home';
    import BsbMaker from '@/pages/BsbMaker';
    import Consultoria from '@/pages/Consultoria';
    import Empresa from '@/pages/Empresa.jsx';
    import Legal from '@/pages/Legal.jsx';
    import AlgoFund from '@/pages/AlgoFund.jsx';
    import Blog from '@/pages/Blog.jsx';
    import Contacto from '@/pages/Contacto.jsx';
    import GuiaInversion from '@/pages/GuiaInversion.jsx';
    import Membresias from '@/pages/Membresias.jsx';
    import OtrosServicios from '@/pages/OtrosServicios.jsx';
    import Formacion from '@/pages/Formacion.jsx';
    import AccessPanel from '@/pages/AccessPanel.jsx';
    import ScrollToTop from '@/components/ScrollToTop';
    import { AuthProvider } from '@/contexts/SupabaseAuthContext';
    import ProtectedRoute from '@/components/ProtectedRoute';
    import Login from '@/pages/Login';
    import SignUp from '@/pages/SignUp';

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
                <Route path="/membresias" element={<Membresias />} />
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

                <Route path="/panel/accesos" element={
                  <ProtectedRoute adminOnly={true}>
                    <AccessPanel />
                  </ProtectedRoute>
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