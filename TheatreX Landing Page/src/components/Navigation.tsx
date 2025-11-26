import { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2" style={{ fontFamily: '"Days One", sans-serif' }}>
            <Activity className="w-8 h-8 text-[#357bd7]" strokeWidth={2.5} />
            <span className="text-xl text-gray-900">TheatreX</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-[#357bd7] transition-colors" style={{ fontFamily: '"Assistant", sans-serif' }}>
              Features
            </a>
            <a href="#preview" className="text-gray-700 hover:text-[#357bd7] transition-colors" style={{ fontFamily: '"Assistant", sans-serif' }}>
              Preview
            </a>
            <a href="#benefits" className="text-gray-700 hover:text-[#357bd7] transition-colors" style={{ fontFamily: '"Assistant", sans-serif' }}>
              Benefits
            </a>
            <button className="px-6 py-2 bg-[#357bd7] text-white rounded-lg hover:bg-[#2a62ad] transition-colors" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-700 hover:text-[#357bd7] transition-colors py-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                Features
              </a>
              <a href="#preview" className="text-gray-700 hover:text-[#357bd7] transition-colors py-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                Preview
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-[#357bd7] transition-colors py-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                Benefits
              </a>
              <button className="px-6 py-2 bg-[#357bd7] text-white rounded-lg hover:bg-[#2a62ad] transition-colors" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
