// ============================================================================
// Summary Card Component
// ============================================================================
// Created by: M5 (Inthusha) - Day 12
//
// Reusable card for displaying summary statistics on dashboards.
// ============================================================================



/**
 * SummaryCard Component
 * @param {string} label - The text label for the metric
 * @param {string|number} value - The numeric or text value to display
 * @param {string} colour - Tailwind background colour for the icon container
 * @param {React.ReactNode} icon - SVG or other icon element
 * @param {number|null} comparison - Comparison value from yesterday
 */
const SummaryCard = ({ label, value, colour, icon, comparison }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 transition-all hover:shadow-md">
        <div className={`w-12 h-12 ${colour} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
                {comparison !== undefined && comparison !== null ? (
                    <span className={`text-xs font-semibold ${comparison >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {comparison >= 0 ? `+${comparison}` : comparison} from yesterday
                    </span>
                ) : (
                    comparison === null && <span className="text-xs text-gray-400">No comparison data</span>
                )}
            </div>
        </div>
    </div>
);

export default SummaryCard;
