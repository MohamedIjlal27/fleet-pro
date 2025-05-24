import { StrictMode, useEffect, useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/app/store.ts';
import './index.css';
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import 'react-toastify/dist/ReactToastify.min.css';
// Import Chart.js configuration early to ensure proper registration
import './utils/chartConfig';
import App from './App.tsx';
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { PersistGate } from 'redux-persist/integration/react';
//import { ThemeProvider, createTheme } from '@mui/material/styles';

// // 1. Create the Theme Context
// const ThemeContext = createContext({
//   isDarkMode: false,
//   toggleTheme: () => {},
// });

// export const useTheme = () => useContext(ThemeContext);

// // 2. Light and Dark Themes
// export const lightTheme = createTheme({
//   palette: {
//     mode: 'light',
//     primary: {
//       main: '#1976D2', 
//     },
//     secondary: {
//       main: '#D32F2F',  
//     },
//     background: {
//       default: '#fff',
//       paper: '#f4f4f4',
//     },
//   },
// });

// export const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#1976D2',  
//     },
//     secondary: {
//       main: '#D32F2F',  
//     },
//     background: {
//       default: '#121212', // Dark background
//       paper: '#333333',  // Dark paper color
//     },
//   },
// });

// // 3. App Wrapper that provides the context and handles theme switching
// const AppWrapper = () => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Set the initial theme on mount
//   useEffect(() => {
//     const storedTheme = localStorage.getItem('theme');
//     if (storedTheme) {
//       setIsDarkMode(storedTheme === 'dark');
//     }
//   }, []);

//   // Toggle theme
//   const toggleTheme = () => {
//     const newTheme = isDarkMode ? 'light' : 'dark';
//     setIsDarkMode(!isDarkMode);
//     localStorage.setItem('theme', newTheme);
//     document.documentElement.classList.toggle('dark', !isDarkMode); // Toggle dark class for Tailwind
//   };

//   // Provide context to nested components
//   return (
//     <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
//       <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
//         <App />
//       </ThemeProvider>
//     </ThemeContext.Provider>
//   );
// };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ThemeProvider>
          <AppWrapper>
            <App />
          </AppWrapper>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);

