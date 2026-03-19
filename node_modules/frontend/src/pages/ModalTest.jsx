import { useState } from 'react';
import { Modal, Button, Input, Card } from '../components/ui';

/**
 * Modal Test Page
 * Comprehensive testing page for the Modal component
 * Created by: (Pasindu) - Day 2
 */
const ModalTest = () => {
    const [basicModalOpen, setBasicModalOpen] = useState(false);//
    const [smallModalOpen, setSmallModalOpen] = useState(false);
    const [largeModalOpen, setLargeModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        alert(`Form submitted!\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`);
        setFormModalOpen(false);
        setFormData({ name: '', email: '', message: '' });
    };

    const handleConfirmAction = () => {
        alert('Action confirmed!');
        setConfirmModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Modal Component Test
                    </h1>
                    <p className="text-xl text-gray-600">
                        Testing the reusable Modal component with various configurations
                    </p>
                    <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        M1 (Pasindu) - Day 2 Task
                    </div>
                </div>

                {/* Test Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Test 1: Basic Modal */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Basic Modal
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Simple modal with title and content
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => setBasicModalOpen(true)}
                            >
                                Open Basic Modal
                            </Button>
                        </div>
                    </Card>

                    {/* Test 2: Small Modal */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Small Modal
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Compact modal for quick messages
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => setSmallModalOpen(true)}
                            >
                                Open Small Modal
                            </Button>
                        </div>
                    </Card>

                    {/* Test 3: Large Modal */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Large Modal
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Spacious modal for detailed content
                            </p>
                            <Button
                                variant="success"
                                onClick={() => setLargeModalOpen(true)}
                            >
                                Open Large Modal
                            </Button>
                        </div>
                    </Card>

                    {/* Test 4: Form Modal */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Form Modal
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Modal with interactive form elements
                            </p>
                            <Button
                                variant="warning"
                                onClick={() => setFormModalOpen(true)}
                            >
                                Open Form Modal
                            </Button>
                        </div>
                    </Card>

                    {/* Test 5: Confirmation Modal */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Confirmation Modal
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Modal with action buttons in footer
                            </p>
                            <Button
                                variant="danger"
                                onClick={() => setConfirmModalOpen(true)}
                            >
                                Open Confirm Modal
                            </Button>
                        </div>
                    </Card>

                    {/* Test Info Card */}
                    <Card>
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                ✨ Features Tested
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>✓ ESC key to close</li>
                                <li>✓ Backdrop click to close</li>
                                <li>✓ Multiple sizes</li>
                                <li>✓ Smooth animations</li>
                                <li>✓ Form integration</li>
                                <li>✓ Custom footers</li>
                            </ul>
                        </div>
                    </Card>
                </div>

                {/* Modals */}

                {/* Basic Modal */}
                <Modal
                    isOpen={basicModalOpen}
                    onClose={() => setBasicModalOpen(false)}
                    title="Basic Modal"
                    size="md"
                >
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            This is a basic modal with a title and some content. You can close it by:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Clicking the X button</li>
                            <li>Pressing the ESC key</li>
                            <li>Clicking outside the modal (backdrop)</li>
                        </ul>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> This modal uses smooth fade-in and slide-up animations!
                            </p>
                        </div>
                    </div>
                </Modal>

                {/* Small Modal */}
                <Modal
                    isOpen={smallModalOpen}
                    onClose={() => setSmallModalOpen(false)}
                    title="Small Modal"
                    size="sm"
                >
                    <p className="text-gray-700">
                        This is a compact modal perfect for quick notifications or simple messages.
                    </p>
                </Modal>

                {/* Large Modal */}
                <Modal
                    isOpen={largeModalOpen}
                    onClose={() => setLargeModalOpen(false)}
                    title="Large Modal with Lots of Content"
                    size="lg"
                >
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            This is a large modal that can accommodate more content. Perfect for detailed information,
                            long forms, or complex layouts.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">Feature 1</h4>
                                <p className="text-sm text-purple-700">
                                    Responsive design that works on all screen sizes
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Feature 2</h4>
                                <p className="text-sm text-blue-700">
                                    Smooth animations and transitions
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Feature 3</h4>
                                <p className="text-sm text-green-700">
                                    Accessibility features built-in
                                </p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h4 className="font-semibold text-orange-900 mb-2">Feature 4</h4>
                                <p className="text-sm text-orange-700">
                                    Customizable sizes and styles
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm">
                            The modal body is scrollable when content exceeds the maximum height (90vh).
                        </p>
                    </div>
                </Modal>

                {/* Form Modal */}
                <Modal
                    isOpen={formModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    title="Contact Form"
                    size="md"
                    footer={
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setFormModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleFormSubmit}
                            >
                                Submit
                            </Button>
                        </div>
                    }
                >
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <Input
                            label="Name"
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="4"
                                placeholder="Enter your message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            />
                        </div>
                    </form>
                </Modal>

                {/* Confirmation Modal */}
                <Modal
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    title="Confirm Action"
                    size="sm"
                    footer={
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleConfirmAction}
                            >
                                Confirm
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="font-semibold text-red-900">Warning</h4>
                                <p className="text-sm text-red-700">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-gray-700">
                            Are you sure you want to proceed with this action?
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default ModalTest;
