import { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useSpring, useTransform } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
export default function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
    // Extract number from value string if it contains percentages or text
    const numMatch = typeof value === 'string' ? value.match(/[\d.]+/) : null;
    const numValue = numMatch ? parseFloat(numMatch[0]) : (typeof value === 'number' ? value : 0);
    const suffix = typeof value === 'string' && numMatch ? value.replace(/[\d.]+/, '') : '';
    const isNumeric = numValue > 0 || typeof value === 'number';

    // Count up animation
    const springValue = useSpring(0, { stiffness: 50, damping: 20 });
    const displayValue = useTransform(springValue, (current) =>
        isNumeric ? (Number.isInteger(numValue) ? Math.floor(current) : current.toFixed(1)) + suffix : value
    );

    useEffect(() => {
        if (isNumeric) {
            springValue.set(numValue);
        }
    }, [numValue, isNumeric, springValue]);

    // Map legacy color hex codes to Tailwind safe colors if needed,
    // or use an inline style variable for the specific glow color since
    // these come dynamically from the stats array (ACCENT2, TEAL, GOLD, DANGER)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: delay * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="bg-bg-surface border border-border-subtle rounded-[1.75rem] p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-white/10"
            style={{ '--glow-color': color }}
        >
            {/* Background soft glow on active hover */}
            <div
                className="absolute -inset-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
                style={{ backgroundColor: 'var(--glow-color)' }}
            />

            <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-text-secondary text-sm font-medium">{label}</span>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
                    style={{ backgroundColor: `${color}18`, color: color }}
                >
                    <Icon size={20} />
                </div>
            </div>

            <h3 className="font-syne font-bold text-3xl text-text-primary relative z-10 tracking-tight">
                {isNumeric ? <motion.span>{displayValue}</motion.span> : value}
            </h3>
        </motion.div>
    );
}
