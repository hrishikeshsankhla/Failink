import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { ForgotPassword } from './components/auth/ForgotPassword'
import { ResetPassword } from './components/auth/ResetPassword'
import { Profile } from './components/profile/Profile'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { Navbar } from './components/layout/Navbar'
import { FeedPage } from './pages/Feed'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <FeedPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
