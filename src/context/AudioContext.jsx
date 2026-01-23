import { createContext, useContext } from 'react';

const AudioContextContext = createContext(null);

export function AudioContextProvider({ audioContext, children }) {
  return (
    <AudioContextContext.Provider value={audioContext}>
      {children}
    </AudioContextContext.Provider>
  );
}

export function useAudioContext() {
  return useContext(AudioContextContext);
}
