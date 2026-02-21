
import React, { useEffect, useState, createContext, useContext } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Cursor Context to manage state
type CursorContextType = {
    cursorVariant: string;
    setCursorVariant: (variant: string) => void;
    cursorText: string;
    setCursorText: (text: string) => void;
};

const CursorContext = createContext<CursorContextType>({
    cursorVariant: 'default',
    setCursorVariant: () => { },
    cursorText: '',
    setCursorText: () => { },
});

export const useCursor = () => useContext(CursorContext);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cursorVariant, setCursorVariant] = useState('default');
    const [cursorText, setCursorText] = useState('');

    return (
        <CursorContext.Provider value={{ cursorVariant, setCursorVariant, cursorText, setCursorText }}>
            {children}
            <CustomCursor />
        </CursorContext.Provider>
    );
};

const isTouchDevice = () =>
    typeof window !== 'undefined' &&
    (('ontouchstart' in window) || navigator.maxTouchPoints > 0);

const CustomCursor: React.FC = () => {
    const { cursorVariant, cursorText } = useCursor();
    const [isTouch, setIsTouch] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for laggy feeling
    const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.5 });
    const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.5 });

    useEffect(() => {
        setIsTouch(isTouchDevice());
    }, []);

    useEffect(() => {
        if (isTouch) return;

        const manageMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', manageMouseMove);
        return () => window.removeEventListener('mousemove', manageMouseMove);
    }, [mouseX, mouseY, isTouch]);

    const variants = {
        default: {
            height: 16,
            width: 16,
            backgroundColor: "#ffffff",
            x: "-50%",
            y: "-50%",
            mixBlendMode: "difference" as const
        },
        text: {
            height: 100,
            width: 100,
            backgroundColor: "#ffffff",
            x: "-50%",
            y: "-50%",
            mixBlendMode: "difference" as const
        },
        hidden: {
            opacity: 0
        }
    };

    if (isTouch) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 bg-white rounded-full pointer-events-none z-[9999] flex items-center justify-center overflow-hidden"
            style={{
                left: smoothX,
                top: smoothY,
            }}
            variants={variants}
            animate={cursorVariant}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
            {cursorVariant === 'text' && (
                <span className="text-black text-[10px] uppercase font-bold tracking-widest px-2 text-center">
                    {cursorText || "View"}
                </span>
            )}
        </motion.div>
    );
};
