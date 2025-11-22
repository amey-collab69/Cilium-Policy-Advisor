import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Cilium Policy Advisor</h1>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/traffic">Traffic Viewer</Link>
        </li>
        <li>
          <Link to="/policies">Policies</Link>
        </li>
        <li>
          <Link to="/history">History</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
