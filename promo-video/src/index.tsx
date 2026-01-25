import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { InstinktPromo } from './Video';

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InstinktPromo"
        component={InstinktPromo}
        durationInFrames={660} // 22 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

registerRoot(RemotionRoot);
