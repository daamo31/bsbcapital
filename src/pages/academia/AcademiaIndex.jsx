import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import AcademyNavigation from '../../components/AcademyNavigation';

const AcademiaIndex = () => {
  const location = useLocation();
  
  // Si estamos en la ruta base de academia, mostrar la navegación
  const isBaseRoute = location.pathname === '/academia' || location.pathname === '/academia/';

  return (
    <Layout>
      {isBaseRoute ? (
        <AcademyNavigation />
      ) : (
        <Outlet />
      )}
    </Layout>
  );
};

export default AcademiaIndex;