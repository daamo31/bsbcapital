import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { BrowserRouter } from 'react-router-dom';
    import App from '@/App';
    import { Toaster } from "@/components/ui/feedback/toaster";
    import '@/index.css';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <Toaster />
      </BrowserRouter>
    );