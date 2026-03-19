import { useState } from 'react';
import { DatePicker, Button, Card } from '../components/ui';

/**
 * DatePicker Test Page
 * Comprehensive testing page for the DatePicker component
 * Created by: Janani (M3) - Day 2
 */
const DatePickerTest = () => {
    // State for different date picker examples
    const [basicDate, setBasicDate] = useState('');
    const [restrictedDate, setRestrictedDate] = useState('');
    const [errorDate, setErrorDate] = useState('');
    const [disabledDate] = useState('2024-12-25');
    const [defaultDate, setDefaultDate] = useState('2024-02-09');

    // Form state for real-world example
    const [surgeryForm, setSurgeryForm] = useState({
        patientName: '',
        surgeryDate: '',
        surgeryTime: '',
        surgeon: ''
    });

    // Validation state
    const [dateError, setDateError] = useState('');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get date 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maxDate = thirtyDaysFromNow.toISOString().split('T')[0];

    // Handle date change with validation
    const handleErrorDateChange = (e) => {
        const selectedDate = e.target.value;
        setErrorDate(selectedDate);

        // Validate: date must be in the future
        if (selectedDate && new Date(selectedDate) < new Date(today)) {
            setDateError('Please select a future date');
        } else {
            setDateError('');
        }
    };

    // Handle surgery form submission
    const handleSurgeryFormSubmit = (e) => {
        e.preventDefault();
        alert(`Surgery Scheduled!\nPatient: ${surgeryForm.patientName}\nDate: ${surgeryForm.surgeryDate}\nTime: ${surgeryForm.surgeryTime}\nSurgeon: ${surgeryForm.surgeon}`);
        setSurgeryForm({ patientName: '', surgeryDate: '', surgeryTime: '', surgeon: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        DatePicker Component Test
                    </h1>
                    <p className="text-xl text-gray-600">
                        Testing the reusable DatePicker component with various configurations
                    </p>
                    <div className="mt-4 inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                        M3 (Janani) - Day 2 Task
                    </div>
                </div>

                {/* Test Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* Test 1: Basic DatePicker */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                1. Basic DatePicker
                            </h3>
                            <DatePicker
                                label="Select a Date"
                                value={basicDate}
                                onChange={(e) => setBasicDate(e.target.value)}
                                placeholder="Choose date"
                            />
                            {basicDate && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Selected:</strong> {basicDate}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Test 2: DatePicker with Min/Max Restrictions */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                2. Date Range Restriction
                            </h3>
                            <DatePicker
                                label="Surgery Date (Next 30 Days)"
                                value={restrictedDate}
                                onChange={(e) => setRestrictedDate(e.target.value)}
                                minDate={today}
                                maxDate={maxDate}
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Only dates within the next 30 days can be selected
                            </p>
                        </div>
                    </Card>

                    {/* Test 3: DatePicker with Error State */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                3. Error State Validation
                            </h3>
                            <DatePicker
                                label="Future Date Required"
                                value={errorDate}
                                onChange={handleErrorDateChange}
                                error={dateError}
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Try selecting a past date to see the error
                            </p>
                        </div>
                    </Card>

                    {/* Test 4: Disabled DatePicker */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                4. Disabled State
                            </h3>
                            <DatePicker
                                label="Disabled DatePicker"
                                value={disabledDate}
                                onChange={() => { }}
                                disabled
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                This date picker is disabled and cannot be changed
                            </p>
                        </div>
                    </Card>

                    {/* Test 5: DatePicker with Default Value */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                5. Default Value
                            </h3>
                            <DatePicker
                                label="Pre-filled Date"
                                value={defaultDate}
                                onChange={(e) => setDefaultDate(e.target.value)}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDefaultDate('')}
                                className="mt-3"
                            >
                                Clear Date
                            </Button>
                        </div>
                    </Card>

                    {/* Features Info Card */}
                    <Card>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                ✨ Features Tested
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>✓ Basic date selection</li>
                                <li>✓ Min/Max date restrictions</li>
                                <li>✓ Error state display</li>
                                <li>✓ Disabled state</li>
                                <li>✓ Default values</li>
                                <li>✓ Required field indicator</li>
                                <li>✓ Dark mode support</li>
                                <li>✓ Readable date format</li>
                            </ul>
                        </div>
                    </Card>
                </div>

                {/* Real-World Example: Surgery Scheduling Form */}
                <Card>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Real-World Example: Surgery Scheduling Form
                        </h2>
                        <form onSubmit={handleSurgeryFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Patient Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={surgeryForm.patientName}
                                        onChange={(e) => setSurgeryForm({ ...surgeryForm, patientName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        placeholder="Enter patient name"
                                        required
                                    />
                                </div>

                                {/* Surgery Date - Using DatePicker */}
                                <DatePicker
                                    label="Surgery Date"
                                    value={surgeryForm.surgeryDate}
                                    onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeryDate: e.target.value })}
                                    minDate={today}
                                    maxDate={maxDate}
                                    required
                                />

                                {/* Surgery Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Surgery Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={surgeryForm.surgeryTime}
                                        onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeryTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Surgeon */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Surgeon <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={surgeryForm.surgeon}
                                        onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeon: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select surgeon</option>
                                        <option value="Dr. Smith">Dr. Smith - Cardiothoracic</option>
                                        <option value="Dr. Johnson">Dr. Johnson - Neurosurgery</option>
                                        <option value="Dr. Williams">Dr. Williams - Orthopedic</option>
                                        <option value="Dr. Brown">Dr. Brown - General Surgery</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                >
                                    Schedule Surgery
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setSurgeryForm({ patientName: '', surgeryDate: '', surgeryTime: '', surgeon: '' })}
                                >
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DatePickerTest;
