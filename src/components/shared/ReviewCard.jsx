import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function ReviewCard({ review, index = 0 }) {
    // Stagger animation based on grid index
    const delay = index * 0.1;

    // Generate an array of 5 for star rendering
    const starsArray = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-bg-surface border border-border-subtle hover:border-border-strong rounded-2xl p-5 md:p-6 transition-colors duration-300 flex flex-col h-full"
        >
            <div className="flex items-start justify-between mb-4 gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                        <span className="font-syne font-bold text-text-primary text-[0.85rem]">
                            {review.studentName?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-syne font-bold text-text-primary text-[0.9rem] leading-tight mb-0.5 max-w-[140px] md:max-w-[200px] truncate">
                            {review.studentName}
                        </h4>
                        <p className="font-dmsans text-[0.7rem] text-text-secondary leading-none">
                            Student
                        </p>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="flex gap-0.5 shrink-0 mt-1">
                    {starsArray.map((star) => (
                        <Star
                            key={star}
                            className={`w-3.5 h-3.5 transition-colors ${star <= (review.rating || 5)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-border-strong fill-transparent'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Review Content */}
            <p className="font-dmsans text-[0.85rem] text-text-secondary leading-relaxed italic mb-4 flex-grow">
                "{review.review || 'Great course! Highly recommended for beginners.'}"
            </p>

            {/* Course Context Meta */}
            <div className="mt-auto pt-3 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="font-syne text-[0.75rem] text-primary-400 font-medium truncate max-w-[200px]">
                    {review.courseTitle}
                </span>
                <span className="font-dmsans text-[0.65rem] text-text-tertiary">
                    Recently
                </span>
            </div>
        </motion.div>
    );
}
