import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Floor_4 from './pages/User/Explore/floor_4.tsx';
import Floor_5 from './pages/User/Explore/floor_5.tsx';
import Floor_6 from './pages/User/Explore/floor_6.tsx';
import Floor_7 from './pages/User/Explore/floor_7.tsx';
import ReportPage from './pages/User/ReportPage.tsx';
import LogInPage from './pages/User/LogInPage.tsx';
import SearchPage from './pages/User/SearchPage.tsx';
import StartNavigation from './pages/User/StartNavigation.tsx';
import AuthCallback from './pages/User/AuthCallback.tsx';
import AddReportPage from './pages/User/AddReportPage.tsx';
import DashBoardPage from './pages/Admin/DashBoardPage.tsx';
import MapAdminPage from './pages/Admin/MapAdmin.tsx';
import ReportAdminPage from './pages/Admin/ReportAdmin.tsx';
import { NavigationProvider } from './context/NavigationContext.tsx';

function App() {
  return (
    <>
    <NavigationProvider>
      <Router>
       <Routes>
          <Route path="/" element={<Floor_4 />} />
          <Route path="/floor-4" element={<Floor_4 />} />
          <Route path="/floor-5" element={<Floor_5 />} />
          <Route path="/floor-6" element={<Floor_6 />} />
          <Route path="/floor-7" element={<Floor_7 />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LogInPage />} /> 
          <Route path="/report" element={<ReportPage />} />
          <Route path="/addreport" element={<AddReportPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/start-navigation" element={<StartNavigation />} />
          <Route path="/mapadmin" element={<MapAdminPage />} />
          <Route path="/reportadmin" element={<ReportAdminPage />} />
          <Route path="/dashboard" element={<DashBoardPage />} />
      </Routes>
    </Router>
   </NavigationProvider>
    </>
  )
}

export default App
