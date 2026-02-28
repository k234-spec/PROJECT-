import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Portfolio from './pages/Portfolio'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import ProjectDetail from './pages/ProjectDetail'
import Collaborate from './pages/Collaborate'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/collaborate" element={<Collaborate />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
        <Route path="*" element={<Portfolio />} />
      </Routes>
    </BrowserRouter>
  )
}