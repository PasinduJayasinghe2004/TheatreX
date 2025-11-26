import { ArrowRight, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-[#357bd7] rounded-full border border-blue-200">
              <span className="text-sm" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                Hospital Theatre Management System
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700, lineHeight: '1.1' }}>
              Streamline Your Theatre Operations
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 max-w-xl" style={{ fontFamily: '"Assistant", sans-serif' }}>
              Real-time theatre monitoring, intelligent staff scheduling, and comprehensive analytics all in one powerful platform. Optimize your surgical operations for maximum efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-[#357bd7] text-white rounded-lg hover:bg-[#2a62ad] transition-all hover:shadow-lg flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                Request Demo
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-[#357bd7] hover:text-[#357bd7] transition-all flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                <Play className="w-5 h-5" />
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            {/* Background blur effect */}
            <div className="absolute inset-0 bg-blue-200 rounded-3xl blur-3xl opacity-30 transform scale-95"></div>
            
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1757152962882-6bf8495b324d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYXRpbmclMjByb29tJTIwc3VyZ2VyeXxlbnwxfHx8fDE3NjQwNTM5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Operating Theatre"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
