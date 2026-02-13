// ============================================================================
// Surgery Card Test Page
// ============================================================================
// Created by: M4 - Day 5
// 
// Temporary page to verify the SurgeryCard component
// ============================================================================

import React from 'react';
import SurgeryCard from '../components/SurgeryCard';

const SurgeryCardTest = () => {
    // Dummy Data
    const dummySurgeries = [
        {
            id: 1,
            surgery_type: 'Appendectomy',
            patient_name: 'John Doe',
            scheduled_date: '2026-03-15',
            scheduled_time: '2026-03-15T09:00:00',
            duration_minutes: 120,
            surgeon: { name: 'Dr. Strange' },
            status: 'scheduled',
            priority: 'routine'
        },
        {
            id: 2,
            surgery_type: 'Knee Replacement',
            patient_name: 'Jane Smith',
            scheduled_date: '2026-03-16',
            scheduled_time: '2026-03-16T14:30:00',
            duration_minutes: 180,
            surgeon: { name: 'Dr. Who' },
            status: 'in_progress',
            priority: 'urgent'
        },
        {
            id: 3,
            surgery_type: 'Emergency C-Section',
            patient_name: 'Mary Poppins',
            scheduled_date: '2026-03-14',
            scheduled_time: '2026-03-14T23:15:00',
            duration_minutes: 60,
            surgeon: { name: 'Dr. House' },
            status: 'completed',
            priority: 'emergency'
        }
    ];

    const handleEdit = (id) => console.log('Edit clicked for', id);
    const handleDelete = (id) => console.log('Delete clicked for', id);

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Surgery Card Component Test</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dummySurgeries.map(surgery => (
                    <SurgeryCard
                        key={surgery.id}
                        surgery={surgery}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default SurgeryCardTest;
