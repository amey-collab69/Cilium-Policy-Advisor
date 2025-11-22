import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TrafficViewer from './components/TrafficViewer';
import YAMLEditor from './components/YAMLEditor';
import PolicyHistory from './components/PolicyHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/traffic" element={<TrafficViewer />} />
            <Route path="/policies" element={<YAMLEditor />} />
            <Route path="/policies/:id" element={<YAMLEditor />} />
            <Route path="/history" element={<PolicyHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
