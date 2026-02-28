import { motion } from 'framer-motion';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    isCompact = false
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full flex flex-col items-center justify-center text-center bg-bg-surface border border-border-subtle rounded-2xl ${isCompact ? 'py-10 px-6' : 'py-16 px-6 lg:py-24'
                }`}
        >
            {/* Soft Glowing Icon Wrapper */}
            {Icon && (
                <div className={`relative flex items-center justify-center rounded-full bg-primary-500/10 mb-5 ${isCompact ? 'w-16 h-16' : 'w-24 h-24 mb-6'
                    }`}>
                    {/* Subtle glow layer behind the icon circle */}
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl"></div>

                    <Icon className={`relative z-10 text-primary-400 ${isCompact ? 'w-8 h-8' : 'w-12 h-12'
                        }`} />
                </div>
            )}

            <h3 className={`font-syne font-bold text-text-primary ${isCompact ? 'text-[1.1rem] mb-2' : 'text-[1.35rem] mb-3'
                }`}>
                {title}
            </h3>

            <p className={`font-dmsans text-text-secondary max-w-md mx-auto ${isCompact ? 'text-[0.85rem] mb-5' : 'text-[0.95rem] mb-8'
                }`}>
                {description}
            </p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </motion.div>
    );
}
