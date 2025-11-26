import { Check, Clock, Eye, TrendingUp, Infinity } from 'lucide-react';

const benefits = [
  'Reduce scheduling conflicts by 50%',
  'Improve team communication',
  'Real-time visibility across all theatres',
  'Optimize staff allocation',
  'Better patient care coordination'
];

const stats = [
  {
    icon: Clock,
    value: '24/7',
    label: 'Real-Time Monitoring'
  },
  {
    icon: Eye,
    value: '100%',
    label: 'Theatre Visibility'
  },
  {
    icon: TrendingUp,
    value: '50%',
    label: 'Reduced Conflicts'
  },
  {
    icon: Infinity,
    value: '∞',
    label: 'Scalable Solution'
  }
];

export function Benefits() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Benefits List */}
          <div>
            <h2 className="text-4xl text-gray-900 mb-6" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
              Why Choose TheatreX?
            </h2>
            <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: '"Assistant", sans-serif' }}>
              Transform your hospital's theatre operations with our comprehensive management solution
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#357bd7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-lg text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Stats Cards */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#357bd7] to-[#4a8ce7] p-8 rounded-2xl text-white text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Icon className="w-10 h-10 mx-auto mb-4" strokeWidth={2} />
                  <div className="text-4xl mb-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div className="text-sm opacity-90" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
