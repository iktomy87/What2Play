import { BrowserRouter, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RecoPage from './pages/RecoPage';
import { AuthProvider } from './context/AuthContext';
import MainPage from './pages/MainPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/recommendations" element={<RecoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;