import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.015,
      delayChildren: 0.08,
    },
  },
};

const characterVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

interface CharacterFadeInProps {
  text: string;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

const motionWrappers = { p: motion.p, span: motion.span, div: motion.div };

export const CharacterFadeIn: React.FC<CharacterFadeInProps> = ({
  text,
  className = '',
  as = 'p',
}) => {
  const characters = text.split('');
  const MotionWrapper = motionWrappers[as];

  return (
    <MotionWrapper
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={characterVariants}
          style={{ display: 'inline-block' }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </MotionWrapper>
  );
};
