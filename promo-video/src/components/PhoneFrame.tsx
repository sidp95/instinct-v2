import React from 'react';
import { colors } from '../styles';

interface PhoneFrameProps {
  children: React.ReactNode;
  scale?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, scale = 1 }) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Phone outer frame - MUCH LARGER */}
      <div
        style={{
          width: 520,
          height: 1060,
          backgroundColor: '#1a1a1a',
          borderRadius: 65,
          padding: 14,
          boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.9)',
          border: '5px solid #333',
        }}
      >
        {/* Phone screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.background,
            borderRadius: 55,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 38,
              backgroundColor: '#1a1a1a',
              borderRadius: 22,
              zIndex: 100,
            }}
          />

          {/* Screen content */}
          <div
            style={{
              width: '100%',
              height: '100%',
              paddingTop: 60,
              boxSizing: 'border-box',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
