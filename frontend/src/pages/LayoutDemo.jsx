import React from 'react';
import { Layout } from './components/ui';

/**
 * Layout Component Demo
 * Demonstrates the Layout component created by M6 (Dinil) on Day 2
 */
const LayoutDemo = () => {
    return (
        <Layout>
            <div className="space-y-6">
                {/* Demo Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        🎭 Layout Component Demo
                    </h2>
                    <p className="text-gray-600">
                        M6 (Dinil) - Day 2 Task Complete
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            ✅ Header Section
                        </h3>
                        <p className="text-sm text-gray-600">
                            Sticky header with branding and navigation. Ready for M4's Header component integration.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            ✅ Sidebar Navigation
                        </h3>
                        <p className="text-sm text-gray-600">
                            Fixed sidebar with navigation menu. Ready for M5's Sidebar component integration.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            ✅ Main Content Area
                        </h3>
                        <p className="text-sm text-gray-600">
                            Flexible content area with proper spacing and max-width constraints.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            ✅ Responsive Design
                        </h3>
                        <p className="text-sm text-gray-600">
                            Mobile-friendly layout with TailwindCSS utility classes.
                        </p>
                    </div>
                </div>

                {/* Usage Example */}
                <div className="bg-gray-900 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                        📝 Usage Example
                    </h3>
                    <pre className="text-sm text-green-400 overflow-x-auto">
                        {`import { Layout } from './components/ui';

function MyPage() {
  return (
    <Layout>
      <h1>Your Content Here</h1>
    </Layout>
  );
}`}
                    </pre>
                </div>

                {/* Day 2 Checklist */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                        ✅ M6 (Dinil) Day 2 Checklist
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Backend:</h4>
                            <ul className="space-y-1 text-sm text-blue-700">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Technicians table created</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Schema with all fields</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Integrated into initialization</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Frontend:</h4>
                            <ul className="space-y-1 text-sm text-blue-700">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Layout component created</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Header + Sidebar structure</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Exported from ui/index.js</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LayoutDemo;
