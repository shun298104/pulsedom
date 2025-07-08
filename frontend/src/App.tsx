// src/App.tsx
import AppUILayout from './components/AppUILayout';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AppStateProvider } from './hooks/AppStateContext';
import { BufferProvider } from './hooks/BufferContext';

function App() {
  return (
    <BufferProvider>
      <AppStateProvider>
        <Tooltip.Provider>
          <AppUILayout />
        </Tooltip.Provider>
      </AppStateProvider>
    </BufferProvider>
  );
}

export default App;
