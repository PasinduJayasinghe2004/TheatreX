// ============================================================================
// Analytics Chart Accuracy Unit Tests - M6 Day 19
// ============================================================================
// Tests controller logic without a live database.
// ============================================================================

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the database pool BEFORE importing the controller
jest.unstable_mockModule('../config/database.js', () => ({
    pool: {
        query: jest.fn()
    }
}));

// Dynamically import after mock is set up so controller gets mocked pool
const { getSurgeryDurationStats, getPeakHoursAnalysis, getPatientDemographics } = await import('../controllers/analyticsController.js');
const { pool } = await import('../config/database.js');

describe('Analytics Chart Accuracy - M6 Day 19 (Unit Tests)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getSurgeryDurationStats', () => {
        it('should correctly format duration buckets and calculate stats', async () => {
            // Mock bucket result
            const mockBucketResult = {
                rows: [
                    { range: '0-30', count: 5 },
                    { range: '31-60', count: 12 },
                    { range: '91-120', count: 3 }
                ]
            };
            
            // Mock stats result
            const mockStatsResult = {
                rows: [
                    { avg_duration: 55, min_duration: 15, max_duration: 110, total_surgeries: 20 }
                ]
            };

            // First query is buckets, second is stats in Promise.all
            pool.query.mockImplementation((queryText) => {
                if (queryText.includes('WHEN duration_minutes')) {
                    return Promise.resolve(mockBucketResult);
                }
                return Promise.resolve(mockStatsResult);
            });

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getSurgeryDurationStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.success).toBe(true);

            // Verify buckets are filled fully
            const buckets = responseData.data.buckets;
            expect(buckets.length).toBe(6);
            expect(buckets.find(b => b.range === '0-30').count).toBe(5);
            expect(buckets.find(b => b.range === '61-90').count).toBe(0); // filled with 0

            // Verify stats
            const stats = responseData.data.stats;
            expect(stats.avgDuration).toBe(55);
            expect(stats.totalSurgeries).toBe(20);
        });
    });

    describe('getPeakHoursAnalysis', () => {
        it('should identify the peak hour correctly', async () => {
            const mockHoursResult = {
                rows: Array.from({ length: 24 }).map((_, i) => ({
                    hour: i,
                    count: i === 14 ? 15 : 2 // 14:00 (2 PM) has 15 surgeries, others have 2
                }))
            };

            pool.query.mockResolvedValue(mockHoursResult);

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPeakHoursAnalysis(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];
            
            expect(responseData.data.chartData.length).toBe(24);
            expect(responseData.data.peak.hour).toBe('14:00');
            expect(responseData.data.peak.count).toBe(15);
            expect(responseData.data.peak.displayHour).toBe('2 PM');
        });
    });

    describe('getPatientDemographics', () => {
        it('should properly compute percentages', async () => {
            pool.query.mockImplementation((queryText) => {
                if (queryText.includes('GROUP BY gender')) {
                    return Promise.resolve({ rows: [{ gender: 'Male', count: 40 }, { gender: 'Female', count: 60 }] });
                }
                if (queryText.includes('blood_type')) {
                    return Promise.resolve({ rows: [{ blood_type: 'O+', count: 100 }] });
                }
                if (queryText.includes('age_group')) {
                    return Promise.resolve({ rows: [{ age_group: '18-30', count: 100 }] });
                }
                if (queryText.includes('COUNT(*)::int AS total')) {
                    return Promise.resolve({ rows: [{ total: 100 }] });
                }
                return Promise.resolve({ rows: [] });
            });

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPatientDemographics(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];

            expect(responseData.data.total).toBe(100);
            expect(responseData.data.gender[0].percentage).toBe(40);
            expect(responseData.data.gender[1].percentage).toBe(60);
        });
    });
});
