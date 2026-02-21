import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Droplets, Heart, Activity, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Diabetes', path: '/diabetes', icon: <Droplets className="w-4 h-4" /> },
    { name: 'Heart Disease', path: '/heart', icon: <Heart className="w-4 h-4" /> },
    { name: 'Parkinson\'s', path: '/parkinsons', icon: <Activity className="w-4 h-4" /> },
    { name: 'Team', path: '/team', icon: <Users className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MediGuard</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 rounded-full px-4",
                  isActive(item.path) 
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link 
                  to="/" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-2"
                >
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <span className="font-bold text-2xl">MediGuard</span>
                </Link>
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      )}>
                        {item.icon}
                        {item.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;