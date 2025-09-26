import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

const HotmartModal = ({ isOpen, onClose, productUrl, children }) => {
  const [showExternalLink, setShowExternalLink] = useState(false);

  const handleIframeError = () => {
    setShowExternalLink(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Academia BSB Capital - Acceso al Curso</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative">
          {!showExternalLink ? (
            <>
              <iframe
                src={productUrl}
                className="w-full h-full border-0"
                title="Academia BSB Capital"
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
              <div className="absolute bottom-4 right-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(productUrl, '_blank')}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en nueva ventana
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Acceder al Curso</h3>
                <p className="text-muted-foreground mb-4">
                  Para una mejor experiencia, accede al curso en una nueva ventana.
                </p>
              </div>
              <Button
                onClick={() => window.open(productUrl, '_blank')}
                size="lg"
                className="mb-4"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Ir a la Academia
              </Button>
              <p className="text-sm text-muted-foreground">
                Se abrirá en una nueva pestaña para tu comodidad
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotmartModal;