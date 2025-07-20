import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Coins, FileText, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
// import WalletConnect from './WalletConnect'; // Removido

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Início', href: '/', icon: null },
    { name: 'ICO', href: '/ico', icon: Coins },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Whitepaper', href: '/whitepaper', icon: FileText },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${mobile ? 'w-full justify-start' : ''}
              ${isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }
            `}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CasinoFound
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLinks />
          </div>

          {/* Desktop Wallet Connect */}
          <div className="hidden md:block">
            <w3m-button />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-2 px-3">
                    <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-lg">C</span>
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      CasinoFound
                    </span>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col space-y-2">
                    <NavLinks mobile={true} onItemClick={() => setIsOpen(false)} />
                  </div>

                  {/* Mobile Wallet Connect */}
                  <div className="px-3">
                    <w3m-button />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


