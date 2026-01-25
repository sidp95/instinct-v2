import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { OpeningHook } from './scenes/OpeningHook';
import { LogoReveal } from './scenes/LogoReveal';
import { MainPromo } from './scenes/MainPromo';
import { Ending } from './scenes/Ending';

// Video structure (at 30fps):
// Opening Hook: 0-180 frames (6 seconds) - dramatic text reveals
// Logo Reveal: 180-240 frames (2 seconds) - beat drop + logo
// Main Promo: 240-570 frames (~11 seconds) - app features
// Ending: 570-680 frames (~3.7 seconds) - logo + tagline

// Total: 680 frames = ~22.7 seconds

// Set to true when audio files are added to public/audio/
const AUDIO_ENABLED = false;

export const InstinktPromo: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#000',
        position: 'relative',
      }}
    >
      {/* Audio - enable when files are added to public/audio/ */}
      {AUDIO_ENABLED && (
        <>
          {/* Background trap beat - starts at beat drop (frame 180) */}
          <Sequence from={180}>
            <Audio src={staticFile('audio/trap-beat.mp3')} volume={0.6} />
          </Sequence>

          {/* Stadium buzzer + cheer at logo reveal */}
          <Sequence from={180} durationInFrames={90}>
            <Audio src={staticFile('audio/buzzer-cheer.mp3')} volume={0.8} />
          </Sequence>

          {/* Swoosh sound for swipes */}
          <Sequence from={330} durationInFrames={30}>
            <Audio src={staticFile('audio/swoosh.mp3')} volume={0.5} />
          </Sequence>
          <Sequence from={365} durationInFrames={30}>
            <Audio src={staticFile('audio/swoosh.mp3')} volume={0.5} />
          </Sequence>

          {/* Coins sound */}
          <Sequence from={485} durationInFrames={45}>
            <Audio src={staticFile('audio/coins.mp3')} volume={0.6} />
          </Sequence>
        </>
      )}

      {/* Scene 1: Opening Hook (dramatic text) */}
      <Sequence from={0} durationInFrames={180}>
        <OpeningHook />
      </Sequence>

      {/* Scene 2: Logo Reveal (beat drop moment) */}
      <Sequence from={180} durationInFrames={60}>
        <LogoReveal />
      </Sequence>

      {/* Scene 3: Main Promo (fast-paced features) */}
      <Sequence from={240} durationInFrames={330}>
        <MainPromo />
      </Sequence>

      {/* Scene 4: Ending */}
      <Sequence from={570} durationInFrames={110}>
        <Ending />
      </Sequence>
    </div>
  );
};
