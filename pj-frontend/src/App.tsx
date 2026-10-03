import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Floor_4 from './pages/Explore/floor_4.tsx';
import Floor_5 from './pages/Explore/floor_5.tsx';
import Floor_6 from './pages/Explore/floor_6.tsx';
import Floor_7 from './pages/Explore/floor_7.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import ReportPage from './pages/UserReportPage.tsx';
import LogInPage from './pages/LogInPage.tsx';

function App() {
  return (
    <>
      <Router>
       <Routes>
        <Route element={<MainLayout />}>

          <Route path="/floor-4" element={<Floor_4 />} />
          <Route path="/floor-5" element={<Floor_5 />} />
          <Route path="/floor-6" element={<Floor_6 />} />
          <Route path="/floor-7" element={<Floor_7 />} />

          <Route path="/login" element={<LogInPage />} /> 
          <Route path="/report" element={<ReportPage />} />
        </Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
