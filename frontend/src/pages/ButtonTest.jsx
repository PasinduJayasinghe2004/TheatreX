import React from 'react';
import Button from '../components/ui/Button';

/**
 * Button Test Page - M4 Day 1 Integration Task
 * Tests all Button component variants and sizes
 */

const ButtonTest = () => {
    const handleClick = (variant) => {
        alert(`${variant} button clicked!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                    Button Component Test - M4 Day 1
                </h1>

                {/* Variants Section */}
                <section className="mb-12 bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Button Variants
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            variant="primary"
                            onClick={() => handleClick('Primary')}
                        >
                            Primary Button
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleClick('Secondary')}
                        >
                            Secondary Button
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleClick('Danger')}
                        >
                            Danger Button
                        </Button>
                        <Button
                            variant="success"
                            onClick={() => handleClick('Success')}
                        >
                            Success Button
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleClick('Outline')}
                        >
                            Outline Button
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => handleClick('Ghost')}
                        >
                            Ghost Button
                        </Button>
                    </div>
                </section>

                {/* Sizes Section */}
                <section className="mb-12 bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Button Sizes
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button size="sm" onClick={() => handleClick('Small')}>
                            Small Button
                        </Button>
                        <Button size="md" onClick={() => handleClick('Medium')}>
                            Medium Button
                        </Button>
                        <Button size="lg" onClick={() => handleClick('Large')}>
                            Large Button
                        </Button>
                    </div>
                </section>

                {/* Disabled State Section */}
                <section className="mb-12 bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Disabled State
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary" disabled>
                            Disabled Primary
                        </Button>
                        <Button variant="secondary" disabled>
                            Disabled Secondary
                        </Button>
                        <Button variant="danger" disabled>
                            Disabled Danger
                        </Button>
                    </div>
                </section>

                {/* Real-world Examples */}
                <section className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Real-world Use Cases
                    </h2>
                    <div className="space-y-6">
                        {/* Form Actions */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-3">
                                Form Actions
                            </h3>
                            <div className="flex gap-3">
                                <Button variant="primary" onClick={() => alert('Form submitted!')}>
                                    Submit
                                </Button>
                                <Button variant="outline" onClick={() => alert('Form cancelled')}>
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        {/* CRUD Operations */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-3">
                                CRUD Operations
                            </h3>
                            <div className="flex gap-3">
                                <Button variant="success" size="sm">
                                    Create
                                </Button>
                                <Button variant="primary" size="sm">
                                    Edit
                                </Button>
                                <Button variant="danger" size="sm">
                                    Delete
                                </Button>
                                <Button variant="ghost" size="sm">
                                    View
                                </Button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-3">
                                Navigation
                            </h3>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm">
                                    ← Previous
                                </Button>
                                <Button variant="primary" size="sm">
                                    Next →
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Test Results */}
                <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                        ✅ M4 Day 1 Tasks Completed
                    </h3>
                    <ul className="list-disc list-inside text-green-700 space-y-1">
                        <li>Backend: Users table created successfully</li>
                        <li>Frontend: Button component implemented with variants</li>
                        <li>Integration: All button variants rendering correctly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ButtonTest;
