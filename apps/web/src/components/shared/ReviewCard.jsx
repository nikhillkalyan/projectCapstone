// eslint-disable-next-line no-unused-vars
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
            className="glass-card flex h-full flex-col rounded-lg p-5 transition-colors duration-300 md:p-6"
        >
            <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-400/20 bg-gradient-primary shadow-glow">
                        <span className="font-display text-[0.85rem] font-bold text-white">
                            {review.studentName?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                    </div>
                    <div>
                        <h4 className="mb-0.5 max-w-[140px] truncate font-display text-[0.9rem] font-bold leading-tight text-text-primary md:max-w-[200px]">
                            {review.studentName}
                        </h4>
                        <p className="text-[0.7rem] leading-none text-text-secondary">
                            Student
                        </p>
                    </div>
                </div>

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

            <p className="mb-4 flex-grow text-[0.85rem] italic leading-relaxed text-text-secondary">
                "{review.review || 'Great course! Highly recommended for beginners.'}"
            </p>

            <div className="mt-auto pt-3 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="max-w-[200px] truncate font-display text-[0.75rem] font-medium text-primary-300">
                    {review.courseTitle}
                </span>
                <span className="text-[0.65rem] text-text-tertiary">
                    Recently
                </span>
            </div>
        </motion.div>
    );
}
