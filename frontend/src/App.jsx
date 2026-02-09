import { useState } from 'react';
import AppRoutes from './routes';
import { Button, Input, Card } from './components/ui';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [showDemo, setShowDemo] = useState(true);
  const [inputValue, setInputValue] = useState('');

  // Toggle between demo and routes
  if (!showDemo) {
    return (
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎭 TheatreX - Day 1 Complete!
            </h1>
            <p className="text-gray-600">
              M1 Tasks: Backend Setup + Frontend Components
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDemo(false)}
              className="mt-4"
            >
              Switch to Routes View
            </Button>
          </div>

          {/* Component Demo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Button Demo Card */}
            <Card title="Button Component" hoverable>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Variants:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="danger" size="sm">Danger</Button>
                    <Button variant="success" size="sm">Success</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Sizes:</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">States:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>Normal</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Input Demo Card */}
            <Card title="Input Component" hoverable>
              <div className="space-y-4">
                <Input
                  label="Text Input"
                  type="text"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <Input
                  label="Email Input"
                  type="email"
                  placeholder="your@email.com"
                  required
                />

                <Input
                  label="Password Input"
                  type="password"
                  placeholder="Enter password"
                />

                <Input
                  label="With Error"
                  type="text"
                  placeholder="This field has an error"
                  error="This field is required"
                />

                <Input
                  label="Disabled Input"
                  type="text"
                  placeholder="Disabled"
                  disabled
                  value="Cannot edit"
                />
              </div>
            </Card>

            {/* Card Demo */}
            <Card title="Card Component" hoverable>
              <p className="text-gray-700 mb-4">
                This is a basic card with a title. Cards can have headers, bodies, and footers.
              </p>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  ✅ Supports custom styling<br />
                  ✅ Hover effects<br />
                  ✅ Click handlers<br />
                  ✅ Flexible layout
                </p>
              </div>
            </Card>

            {/* Backend Status Card */}
            <Card
              title="Backend API Status"
              footer={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
                >
                  Test API
                </Button>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Express Server: Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm">MySQL Database: Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Users Table: Created</span>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-mono text-gray-600">
                    API: http://localhost:5000
                  </p>
                </div>
              </div>
            </Card>

            {/* Day 1 Checklist Card */}
            <Card
              title="✅ M1 Day 1 Checklist"
              className="md:col-span-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Backend Tasks:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>GitHub repo created</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Express server setup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>MySQL connection (Aiven Cloud + SSL)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Users table created</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>API routes structure</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Frontend Tasks:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>React + Vite initialized</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>React Router setup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Button component</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Input component</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Card component</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
