"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ShoppingBag, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Logo from "./Logo";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import AuthModal from "./AuthModal";
import { getActiveSections } from "@/lib/sections";
import { Section } from "@/types";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const { getItemCount, isHydrated, loadUserCart } = useCartStore();
  const { user, isHydrated: userHydrated, signOutUser } = useUserStore();
  const itemCount = mounted && isHydrated ? getItemCount() : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch sections for secondary navigation
  useEffect(() => {
    const fetchSections = async () => {
      const activeSections = await getActiveSections();
      setSections(activeSections);
    };
    fetchSections();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user's cart when they sign in
  useEffect(() => {
    if (user?.id && mounted) {
      loadUserCart(user.id);
    }
  }, [user?.id, mounted]);

  const handleSignOut = async () => {
    await signOutUser();
    setShowUserMenu(false);
  };

  const handleSectionClick = (sectionId: string, sectionName: string) => {
    // If on homepage, scroll to section
    if (pathname === "/") {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        const headerHeight = 88; // Height of fixed header
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      // If not on homepage, navigate to homepage with section anchor
      router.push(`/#section-${sectionId}`);
    }
  };

  const navItems = [
    "Store",
    "Audio",
    "Cases",
    "Charging",
    "Wearables",
    "Tech",
    "Lifestyle",
    "Deals",
    "Support",
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl transition-all duration-300"
      style={{
        boxShadow:
          "0 1px 0 0 rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.03)",
      }}
    >
      <nav className="mx-auto max-w-wide">
        <div className="flex h-11 items-center justify-between px-4 lg:px-6">
          {/* Davnex Logo */}
          <Link href="/" className="flex items-center">
            <Logo className="h-6 w-auto" variant="dark" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item}
                href={`/${item
                  .toLowerCase()
                  .replace(" & ", "-")
                  .replace(" ", "-")}`}
                className="text-xs font-medium text-apple-gray-800 hover:text-apple-gray-900 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-apple-gray-800 hover:text-apple-gray-900 transition-colors">
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/cart"
              className="relative text-apple-gray-800 hover:text-apple-gray-900 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Sign In */}
            {mounted && userHydrated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-apple-gray-800 hover:text-apple-gray-900 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-apple-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-apple-gray-200">
                      <p className="text-sm font-semibold text-apple-gray-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-apple-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 text-xs font-medium text-apple-gray-800 hover:text-apple-gray-900 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal - Rendered via Portal */}
      {mounted &&
        showAuthModal &&
        createPortal(
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />,
          document.body
        )}

      {/* Secondary Navigation for Store - Dynamic Sections */}
      <div className="border-t border-apple-gray-300/30">
        <div className="mx-auto max-w-wide px-4 lg:px-6">
          <div className="flex h-12 items-center space-x-8 overflow-x-auto scrollbar-hide">
            {sections.length > 0 ? (
              <>
                <Link
                  href="/"
                  className="text-xs font-medium text-apple-gray-800 hover:text-apple-blue whitespace-nowrap transition-colors"
                >
                  The latest
                </Link>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id, section.name)}
                    className="text-xs font-medium text-apple-gray-500 hover:text-apple-gray-800 whitespace-nowrap transition-colors"
                  >
                    {section.name}
                  </button>
                ))}
              </>
            ) : (
              // Fallback while sections are loading
              <>
                <Link
                  href="/"
                  className="text-xs font-medium text-apple-gray-800 hover:text-apple-blue whitespace-nowrap"
                >
                  The latest
                </Link>
                <span className="text-xs text-apple-gray-400">
                  Loading sections...
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
