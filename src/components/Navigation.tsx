import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  Share2, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  UserCheck,
  Search
} from 'lucide-react';
import { useMediKey } from '@/contexts/MediKeyContext';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { state, dispatch } = useMediKey();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  const patientMenuItems = [
    { id: 'profile', label: 'Profile', icon: Shield },
    { id: 'upload', label: 'Upload Records', icon: FileText },
    { id: 'records', label: 'My Records', icon: FileText },
    { id: 'share', label: 'Share Access', icon: Share2 },
    { id: 'history', label: 'History', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const clinicianMenuItems = [
    { id: 'profile', label: 'Profile', icon: Shield },
    { id: 'request', label: 'Request Access', icon: Search },
    { id: 'records', label: 'Patient Records', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const menuItems = state.currentUser?.role === 'patient' ? patientMenuItems : clinicianMenuItems;

  const NavContent = () => (
    <>
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-primary rounded-lg">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-bold text-lg">MediKey</h2>
          <p className="text-xs text-muted-foreground">
            {state.currentUser?.role === 'patient' ? 'Patient Portal' : 'Clinician Portal'}
          </p>
        </div>
      </div>

      <div className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                currentView === item.id && 'bg-primary text-primary-foreground'
              )}
              onClick={() => {
                onViewChange(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="px-3 py-2 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">Your Key ID</p>
          <p className="text-xs font-mono break-all">
            {state.currentUser?.publicKey?.substring(0, 20)}...
          </p>
          <Badge variant="secondary" className="mt-2 text-xs">
            {state.currentUser?.role}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r',
        'transform transition-transform duration-200 ease-in-out',
        'lg:transform-none',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full p-6">
          <NavContent />
        </div>
      </div>
    </>
  );
}