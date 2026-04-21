// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function SectionShell({
    title,
    icon: Icon,
    iconColor = "text-primary-400",
    action,
    children,
    delay = 1,
    className = ""
}) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`mb-10 w-full ${className}`}
        >
            {(title || action) && (
                <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="flex items-center gap-3 font-display text-xl font-bold text-text-primary">
                        {Icon && (
                            <span className="glass-sm flex h-9 w-9 items-center justify-center rounded-lg">
                                <Icon className={`h-5 w-5 ${iconColor}`} />
                            </span>
                        )}
                        {title}
                    </h2>
                    {action && (
                        <div className="ml-4 shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full">
                {children}
            </div>
        </motion.section>
    );
}
