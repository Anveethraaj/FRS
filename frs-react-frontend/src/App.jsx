import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Furniture from './pages/Furniture';
import Rentals from './pages/Rentals';
import RentalDetail from './pages/RentalDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/furniture" element={<Furniture />} />
      <Route path="/rentals" element={<Rentals />} />
      <Route path="/rentals/:orderNo" element={<RentalDetail />} />
    </Routes>
  );
}

export default App;
