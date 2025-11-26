import { ArrowRight, Phone } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#357bd7] to-[#4a8ce7] rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl text-white mb-6" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
            Ready to Optimize Your Theatre Operations?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto" style={{ fontFamily: '"Assistant", sans-serif' }}>
            Join leading hospitals worldwide in revolutionizing theatre management. Schedule a personalized demo today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-white text-[#357bd7] rounded-lg hover:bg-gray-100 transition-all hover:shadow-xl flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600, fontSize: '1.125rem' }}>
              Schedule Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600, fontSize: '1.125rem' }}>
              <Phone className="w-5 h-5" />
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
