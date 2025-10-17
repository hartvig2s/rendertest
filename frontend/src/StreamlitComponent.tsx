import React from 'react';
import App from './App';

declare global {
  interface Window {
    streamlit?: {
      setComponentValue: (value: any) => void;
      setFrameHeight: (height: number) => void;
    };
  }
}

const StreamlitComponent: React.FC = () => {
  React.useEffect(() => {
    // Set initial frame height
    if (window.streamlit) {
      window.streamlit.setFrameHeight(window.innerHeight);
    }

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (window.streamlit) {
        window.streamlit.setFrameHeight(document.body.scrollHeight);
      }
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return <App />;
};

export default StreamlitComponent;