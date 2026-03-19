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
const SummaryCard = ({ label, value, colour, icon, comparison, subtitle, ...props }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]" {...props}>
        <div className="flex-1 min-h-[72px] flex flex-col justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5" data-testid="summary-value">{value}</p>
            </div>
            <div>
                {comparison !== undefined && comparison !== null ? (
                    <p className={`text-xs font-semibold ${comparison >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} data-testid="summary-comparison">
                        {comparison >= 0 ? `+${comparison}` : comparison} from yesterday
                    </p>
                ) : comparison === null ? (
                    <p className="text-xs text-gray-400 dark:text-slate-500">No comparison data</p>
                ) : subtitle ? (
                    <p className="text-xs text-gray-400 dark:text-slate-500">{subtitle}</p>
                ) : (
                    <div className="h-4" />
                )}
            </div>
        </div>
        <div className={`w-12 h-12 ${colour} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            {icon}
        </div>
    </div>
);

export default SummaryCard;
