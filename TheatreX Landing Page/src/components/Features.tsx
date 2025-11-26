import { Activity, Calendar, Users, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Theatre Status',
    description: 'Get live status updates on all operating theatres with real-time progress tracking and instant notifications.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Intelligent calendar system for managing surgeries, staff assignments, and resource allocation efficiently.'
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Track surgeon availability, manage team assignments, and optimize staff allocation across all theatres.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Comprehensive reports on theatre utilization, procedure durations, and operational efficiency metrics.'
  },
  {
    icon: Clock,
    title: 'Upcoming Surgeries',
    description: 'View scheduled procedures with patient details, assigned staff, and estimated completion times.'
  },
  {
    icon: CheckCircle2,
    title: 'Status Tracking',
    description: 'Color-coded system showing theatres as in-use, preparing, cleaning, or available at a glance.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: '"Assistant", sans-serif' }}>
            Everything you need to manage theatre operations efficiently and effectively
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#357bd7] transition-colors">
                  <Icon className="w-7 h-7 text-[#357bd7] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
