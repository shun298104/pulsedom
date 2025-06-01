// src/App.tsx
import AppUILayout from './components/AppUILayout';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AppStateProvider } from './hooks/AppStateContext';

function App() {
  return (
    <AppStateProvider>
      <Tooltip.Provider>
        <AppUILayout />
      </Tooltip.Provider>
    </AppStateProvider>
  );
}

export default App;
