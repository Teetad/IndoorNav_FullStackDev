import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage.tsx';

function App() {
  return (
    <>
      <Router>
       <Routes>
        {/* หน้าแรก (หน้าค้นหา) */}
         <Route path="/" element={<ExplorePage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
