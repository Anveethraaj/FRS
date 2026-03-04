import { NavLink } from 'react-router-dom';
import { PieChart, Sofa, FileText, Database, Plug } from 'lucide-react';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">🪑</div>
        <h1>FurnRent</h1>
        <p>Management System</p>
      </div>
      <div className="sidebar-nav">
        <div className="nav-label">Main</div>
        
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <i><PieChart size={18} /></i> Dashboard
        </NavLink>
        
        <NavLink 
          to="/furniture" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <i><Sofa size={18} /></i> Inventory
        </NavLink>
        
        <NavLink 
          to="/rentals" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <i><FileText size={18} /></i> Rentals
        </NavLink>

        <div className="nav-label">Tools</div>
        <a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer" className="nav-link">
          <i><Database size={18} /></i> H2 Console
        </a>
        <a href="http://localhost:8080/api/v1/furniture" target="_blank" rel="noreferrer" className="nav-link">
          <i><Plug size={18} /></i> REST API
        </a>
      </div>
      <div className="sidebar-footer">Furniture Rental © 2026</div>
    </nav>
  );
};

export default Sidebar;
