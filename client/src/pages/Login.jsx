import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to manage your portfolio</div>
        {error && <div className="alert alert-error" style={{marginBottom:16}}> {error}</div>}
        <form className="auth-form" onSubmit={submit} id="login-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input id="login-email" className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input id="login-password" className="input" type="password" placeholder=""
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          <button id="login-submit" className="btn btn-primary w-full" type="submit" disabled={loading} style={{justifyContent:'center',marginTop:8}}>
            {loading ? 'Signing in' : 'Sign In'}
          </button>
        </form>
        <div className="auth-link">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
