import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Onboarding from './components/Onboarding/RoleSelector';
import PromptAlchemy from './components/CreatorTools/PromptAlchemy';
import CreatorSuite from './components/CreatorTools/Suite';

// Mock feed for now
const ViaDedideFeed = () => <div style={{padding: '2rem'}}><h1>User Feed</h1><p>Welcome to your structured social feed.</p></div>;
const StudyOS = () => <div style={{padding: '2rem'}}><h1>StudyOS</h1><p>Welcome, Learner.</p></div>;

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/creator/tool/prompt-alchemy/:platform" element={<PromptAlchemyWrapper />} />
        <Route path="/creator/*" element={<CreatorSuite />} />
        <Route path="/feed" element={<ViaDedideFeed />} />
        <Route path="/learn" element={<StudyOS />} />
      </Routes>
    </Router>
  );
}

// Wrapper to pass the dynamically selected platform to PromptAlchemy
import { useParams } from 'react-router-dom';
function PromptAlchemyWrapper() {
  const { platform } = useParams();
  return <PromptAlchemy platform={platform} />;
}
