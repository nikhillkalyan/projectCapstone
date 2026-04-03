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
            {/* Header Container */}
            {(title || action) && (
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-syne font-bold text-xl text-text-primary flex items-center gap-2">
                        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
                        {title}
                    </h2>
                    {action && (
                        <div className="flex-shrink-0 ml-4">
                            {action}
                        </div>
                    )}
                </div>
            )}

            {/* Content Area */}
            <div className="w-full">
                {children}
            </div>
        </motion.section>
    );
}
