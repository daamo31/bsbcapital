import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/navigation/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Shield, 
  Users, 
  Calendar,
  BarChart3,
  FileText,
  ChevronDown
} from 'lucide-react';

const AdminDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 border-orange-200">
          <Shield className="mr-2 h-4 w-4" />
          Admin
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Panel de Administración</p>
            <p className="text-xs leading-none text-muted-foreground">
              Gestión completa del sistema
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin" className="w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard Principal</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin" onClick={() => setTimeout(() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'users' })), 100)} className="w-full cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <span>Gestión de Usuarios</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin" onClick={() => setTimeout(() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'calendar' })), 100)} className="w-full cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendario & Citas</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin" onClick={() => setTimeout(() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'content' })), 100)} className="w-full cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            <span>Gestión de Contenido</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin" onClick={() => setTimeout(() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'analytics' })), 100)} className="w-full cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Estadísticas</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminDropdown;