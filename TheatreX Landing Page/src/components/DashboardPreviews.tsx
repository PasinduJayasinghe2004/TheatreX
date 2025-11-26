import { Activity, Calendar, Clock, Users, MapPin, TrendingUp, ArrowUpDown, Zap, User, CheckCircle2, BarChart2, PieChart, LineChart } from 'lucide-react';

export function DashboardPreviews() {
  return (
    <section id="preview" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Live Theatre Status Preview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#357bd7] to-[#4a8ce7] p-6">
            <h3 className="text-2xl text-white flex items-center gap-3" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
              <Activity className="w-7 h-7" />
              Live Theatre Status
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left - Status Indicators */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <span className="text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                      Theatre 1 - In Use
                    </span>
                    <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Cardiac Surgery • Dr. Johnson • 2h 15m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                      Theatre 2 - Preparing
                    </span>
                    <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Orthopedic Surgery • Dr. Smith • Starting in 30m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                      Theatre 3 - Cleaning
                    </span>
                    <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Sterilization in progress • Available in 15m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                      Theatre 4 - Available
                    </span>
                    <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Ready for next procedure
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Key Info */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                <h4 className="text-lg text-gray-900 mb-4" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                  Key Information
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Real-time progress tracking for all active surgeries
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Surgeon and team assignments visible at a glance
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Location-based status updates across all facilities
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Automatic notifications for status changes
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Calendar Scheduling Preview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#357bd7] to-[#4a8ce7] p-6">
            <h3 className="text-2xl text-white flex items-center gap-3" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
              <Calendar className="w-7 h-7" />
              Smart Calendar Scheduling
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left - Features */}
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                  <h4 className="text-gray-900 mb-2 flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                    <Calendar className="w-5 h-5 text-[#357bd7]" />
                    Multiple View Options
                  </h4>
                  <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    Switch between daily, weekly, and monthly views to plan your theatre schedule with precision
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                  <h4 className="text-gray-900 mb-2 flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                    <Users className="w-5 h-5 text-purple-600" />
                    Staff Assignment
                  </h4>
                  <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    Automatically assign surgeons, nurses, and support staff based on availability and expertise
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                  <h4 className="text-gray-900 mb-2 flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                    <Activity className="w-5 h-5 text-green-600" />
                    Resource Optimization
                  </h4>
                  <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    Optimize equipment and room allocation to maximize theatre utilization and minimize downtime
                  </p>
                </div>
              </div>

              {/* Right - Quick Features List */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                <h4 className="text-lg text-gray-900 mb-4" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                  Advanced Scheduling Features
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowUpDown className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Drag & drop scheduling interface for easy planning
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Automatic conflict detection and resolution suggestions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Quick rescheduling with one-click updates
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-[#357bd7] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Real-time theatre availability tracking
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized User Profile Preview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#357bd7] to-[#4a8ce7] p-6">
            <h3 className="text-2xl text-white flex items-center gap-3" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
              <User className="w-7 h-7" />
              Personalized User Profile
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left - Profile & Welcome */}
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#357bd7] to-[#4a8ce7] rounded-full flex items-center justify-center text-white text-2xl" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
                      DJ
                    </div>
                    <div>
                      <h4 className="text-xl text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                        Welcome, Dr. Johnson
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Cardiac Surgeon
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    You have 3 surgeries scheduled today and 2 pending tasks
                  </p>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <h4 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                    <Calendar className="w-5 h-5 text-[#357bd7]" />
                    Today's Schedule
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        08:00 AM - Pre-op meeting
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        10:00 AM - Cardiac surgery (Theatre 1)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        02:00 PM - Post-op rounds
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Tasks */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                <h4 className="text-lg text-gray-900 mb-4" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                  Today's Tasks
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-5 h-5 border-2 border-[#357bd7] rounded mt-0.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        Review patient files for tomorrow's surgeries
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Due: Today, 5:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-5 h-5 bg-[#357bd7] rounded flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 opacity-60">
                      <p className="text-gray-900 mb-1 line-through" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        Complete surgery report for case #4821
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-5 h-5 border-2 border-[#357bd7] rounded mt-0.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        Update staff availability for next week
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Due: Tomorrow, 12:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Surgery History Preview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#357bd7] to-[#4a8ce7] p-6">
            <h3 className="text-2xl text-white flex items-center gap-3" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
              <Clock className="w-7 h-7" />
              Comprehensive Surgery History
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-4">
              {/* Surgery Record 1 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                        Cardiac Bypass Surgery
                      </h4>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Patient: John Smith • Case #4821 • Theatre 1
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        <Users className="w-4 h-4 text-[#357bd7]" />
                        Dr. Johnson, 3 nurses, 2 assistants
                      </span>
                      <span className="flex items-center gap-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        <Clock className="w-4 h-4 text-[#357bd7]" />
                        Duration: 4h 30m
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    Nov 25, 2025<br/>10:00 AM - 2:30 PM
                  </div>
                </div>
              </div>

              {/* Surgery Record 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                        Orthopedic Hip Replacement
                      </h4>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Patient: Mary Johnson • Case #4815 • Theatre 2
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        <Users className="w-4 h-4 text-[#357bd7]" />
                        Dr. Smith, 2 nurses, 1 assistant
                      </span>
                      <span className="flex items-center gap-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        <Clock className="w-4 h-4 text-[#357bd7]" />
                        Duration: 3h 15m
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    Nov 24, 2025<br/>08:00 AM - 11:15 AM
                  </div>
                </div>
              </div>

              {/* Surgery Record 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                        Neurosurgery - Tumor Removal
                      </h4>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: '"Assistant", sans-serif' }}>
                      Patient: Robert Williams • Case #4809 • Theatre 3
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        <Users className="w-4 h-4 text-[#357bd7]" />
                        Dr. Anderson, 4 nurses, 3 assistants
                      </span>
                      <span className="flex items-center gap-2" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        <Clock className="w-4 h-4 text-[#357bd7]" />
                        Duration: 6h 45m
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                    Nov 23, 2025<br/>09:00 AM - 3:45 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics & Statistics Preview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#357bd7] to-[#4a8ce7] p-6">
            <h3 className="text-2xl text-white flex items-center gap-3" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
              <BarChart2 className="w-7 h-7" />
              Advanced Analytics & Statistics
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Key Metric Cards */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center">
                <PieChart className="w-8 h-8 text-[#357bd7] mx-auto mb-3" />
                <div className="text-3xl text-gray-900 mb-1" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
                  87%
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                  Theatre Utilization
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl text-gray-900 mb-1" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
                  142
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                  Surgeries This Month
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 text-center">
                <LineChart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl text-gray-900 mb-1" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 700 }}>
                  3.8h
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                  Avg. Surgery Duration
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Activity Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                <h4 className="text-lg text-gray-900 mb-4" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                  Weekly Activity
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>Monday</span>
                      <span className="text-gray-900" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>12 surgeries</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#357bd7] rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>Tuesday</span>
                      <span className="text-gray-900" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>15 surgeries</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#357bd7] rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>Wednesday</span>
                      <span className="text-gray-900" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>10 surgeries</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#357bd7] rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>Thursday</span>
                      <span className="text-gray-900" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>14 surgeries</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#357bd7] rounded-full" style={{ width: '93%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700" style={{ fontFamily: '"Assistant", sans-serif' }}>Friday</span>
                      <span className="text-gray-900" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>11 surgeries</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#357bd7] rounded-full" style={{ width: '73%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
                <h4 className="text-lg text-gray-900 mb-4" style={{ fontFamily: '"Spline Sans", sans-serif', fontWeight: 600 }}>
                  Performance Insights
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        15% increase in efficiency
                      </p>
                      <p className="text-xs text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Compared to last month
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#357bd7]" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        98.5% success rate
                      </p>
                      <p className="text-xs text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        All procedures completed successfully
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        12 min avg. turnover time
                      </p>
                      <p className="text-xs text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Between consecutive surgeries
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1" style={{ fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
                        24 active staff members
                      </p>
                      <p className="text-xs text-gray-600" style={{ fontFamily: '"Assistant", sans-serif' }}>
                        Optimal staffing level maintained
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}