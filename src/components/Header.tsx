
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context

  const navLinks = [
    { name: "Courses", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-white font-bold text-xl">SolStudy</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white relative">
                  <Bell size={20} />
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-[#14F195]">3</Badge>
                </Button>
                <Link to="/dashboard">
                  <Avatar className="border-2 border-white/20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90">
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#1A1F2C]/95 backdrop-blur-lg border-white/10 text-white">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-lg font-medium hover:text-[#14F195] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  {!isLoggedIn && (
                    <Link to="/auth">
                      <Button className="w-full mt-4 bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90">
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
