import React from 'react'
import { Button } from './components/ui/button'
import { BrowserRouter , Routes ,Route } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<Login/>}/>
        <Route exact path="/register" element={<Register/>}/>

        <Route exact path="/dashboard" element={<Dashboard/>}/>


      </Routes>
    </BrowserRouter>
  )
}

export default App
