import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-title">Create account</div>
        <div className="auth-subtitle">Start showcasing your work today</div>
        {error && <div className="alert alert-error" style={{marginBottom:16}}> {error}</div>}
        <form className="auth-form" onSubmit={submit} id="register-form">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input id="register-name" className="input" type="text" placeholder="Your name"
              value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input id="register-email" className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input id="register-password" className="input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
          </div>
          <button id="register-submit" className="btn btn-primary w-full" type="submit" disabled={loading} style={{justifyContent:'center',marginTop:8}}>
            {loading ? 'Creating account' : 'Create Account'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
