import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage.tsx';
import MainLayout from './layouts/MainLayout.tsx';

function App() {
  return (
    <>
      <Router>
       <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<ExplorePage />} />
          {/* <Route path="/map" element={<MapPage />} /> */}
          {/* <Route path="/report" element={<ReportPage />} /> */}
        </Route>
        {/* หน้าแรก (หน้าค้นหา) */}
         <Route path="/" element={<ExplorePage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
