// eslint-disable-next-line no-unused-vars
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
            className={`glass flex w-full flex-col items-center justify-center rounded-lg text-center ${isCompact ? 'px-6 py-10' : 'px-6 py-16 lg:py-24'
                }`}
        >
            {Icon && (
                <div className={`relative mb-5 flex items-center justify-center rounded-full bg-primary-500/10 ${isCompact ? 'h-16 w-16' : 'mb-6 h-24 w-24'
                    }`}>
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl"></div>

                    <Icon className={`relative z-10 text-primary-400 ${isCompact ? 'h-8 w-8' : 'h-12 w-12'
                        }`} />
                </div>
            )}

            <h3 className={`font-display font-bold text-text-primary ${isCompact ? 'mb-2 text-[1.1rem]' : 'mb-3 text-[1.35rem]'
                }`}>
                {title}
            </h3>

            <p className={`mx-auto max-w-md text-text-secondary ${isCompact ? 'mb-5 text-[0.85rem]' : 'mb-8 text-[0.95rem]'
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
