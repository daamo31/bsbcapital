import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide"
    >
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
            {item.path ? (
              <Link
                to={item.path}
                className="hover:text-primary transition-colors max-w-[150px] sm:max-w-none truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="font-medium text-foreground max-w-[150px] sm:max-w-none truncate"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
