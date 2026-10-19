
import { motion } from 'framer-motion';
import React from 'react';

const FloatingBackground: React.FC = () => {
  const bubbles = [
    { color: "#E5DEFF", size: "15rem", delay: 0, duration: 25 },
    { color: "#D3F4E5", size: "12rem", delay: 5, duration: 30 },
    { color: "#D3E4FD", size: "18rem", delay: 2, duration: 35 },
    { color: "#FDE1D3", size: "10rem", delay: 8, duration: 40 },
    { color: "#FFDEE2", size: "14rem", delay: 15, duration: 45 },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-20"
          style={{ 
            backgroundColor: bubble.color,
            width: bubble.size,
            height: bubble.size,
          }}
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%` 
          }}
          animate={{ 
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: bubble.duration, 
            delay: bubble.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
};

export default FloatingBackground;
