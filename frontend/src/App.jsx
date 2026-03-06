import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Tag,
  TrendingDown,
  TrendingUp,
  Trash2,
  Wallet,
  X
} from 'lucide-react'
import { format } from 'date-fns'

const API_BASE_URL = 'http://localhost:5000/api'

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))

function App() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category_id: '',
    type: 'expense'
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false)
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return transactions
    }

    return transactions.filter((transaction) =>
      [transaction.description, transaction.category_name, transaction.type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [transactions, searchTerm])

  const recentTransactions = filteredTransactions.slice(0, 5)

  const activityTotal = Number(summary.totalIncome) + Number(summary.totalExpense)
  const incomeShare = activityTotal > 0 ? Math.round((Number(summary.totalIncome) / activityTotal) * 100) : 0
  const expenseShare = activityTotal > 0 ? 100 - incomeShare : 0

  const fetchData = async () => {
    try {
      setLoading(true)
      const [transactionsResponse, summaryResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions`),
        axios.get(`${API_BASE_URL}/transactions/summary`),
        axios.get(`${API_BASE_URL}/transactions/categories/all`)
      ])

      setTransactions(transactionsResponse.data)
      setSummary(summaryResponse.data)
      setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category_id: '',
      type: 'expense'
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/transactions`, formData)
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API_BASE_URL}/transactions/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const getSignedAmount = (transaction) => {
    const prefix = transaction.type === 'income' ? '+' : '-'
    return `${prefix}${formatCurrency(transaction.amount)}`
  }

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={20} />
          </div>
          <div>
            <p className="brand-title">FinTrack</p>
            <p className="brand-subtitle">Personal Finance Tracker</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'transactions' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('transactions')}
          >
            <Tag size={18} />
            Transactions
          </button>
          <button className="nav-item">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-balance-label">Current Balance</p>
          <p className="sidebar-balance-value">{formatCurrency(summary.balance)}</p>
          <button className="nav-item">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="main-header">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1>{activeTab === 'dashboard' ? 'Finance Dashboard' : 'Transactions'}</h1>
              <p>Track cash flow, monitor spending, and keep every transaction in one place.</p>
            </div>
          </div>

          <div className="header-actions">
            <label className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by description, category, or type"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <button className="primary-btn" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <section className="dashboard-view">
            <div className="metrics-grid">
              <article className="metric-card">
                <div className="metric-title-row">
                  <span className="metric-icon">
                    <Wallet size={18} />
                  </span>
                  <p className="metric-label">Net Balance</p>
                </div>
                <p className="metric-value">{formatCurrency(summary.balance)}</p>
                <p className="metric-note">Income contributes {incomeShare}% of your cash flow.</p>
              </article>

              <article className="metric-card">
                <div className="metric-title-row">
                  <span className="metric-icon income">
                    <TrendingUp size={18} />
                  </span>
                  <p className="metric-label">Total Income</p>
                </div>
                <p className="metric-value income">{formatCurrency(summary.totalIncome)}</p>
                <div className="progress-track">
                  <span className="progress-fill income" style={{ width: `${incomeShare}%` }} />
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-title-row">
                  <span className="metric-icon expense">
                    <TrendingDown size={18} />
                  </span>
                  <p className="metric-label">Total Expense</p>
                </div>
                <p className="metric-value expense">{formatCurrency(summary.totalExpense)}</p>
                <div className="progress-track">
                  <span className="progress-fill expense" style={{ width: `${expenseShare}%` }} />
                </div>
              </article>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Activity</h2>
                  <p className="panel-subtext">{filteredTransactions.length} matched transaction(s)</p>
                </div>
                <button className="link-btn" onClick={() => handleTabChange('transactions')}>
                  View all
                </button>
              </div>

              <div className="table-wrap">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="loading-state">
                          Loading transactions...
                        </td>
                      </tr>
                    ) : recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          No transactions match your search.
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <div className="transaction-title">
                              {transaction.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              <span>{transaction.description || 'General entry'}</span>
                            </div>
                          </td>
                          <td>{transaction.category_name || 'Uncategorized'}</td>
                          <td>{transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy') : '-'}</td>
                          <td className={`amount-text ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                            {getSignedAmount(transaction)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'transactions' && (
          <section className="transactions-view">
            <div className="panel-header">
              <div>
                <h2>All Transactions</h2>
                <p className="panel-subtext">
                  Showing {filteredTransactions.length} transaction(s)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="panel loading-state">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="panel empty-state">No transactions to display.</div>
            ) : (
              <div className="transaction-list">
                {filteredTransactions.map((transaction) => (
                  <article key={transaction.id} className="transaction-item">
                    <div className="item-left">
                      <span className={`type-icon ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                        {transaction.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </span>

                      <div className="item-details">
                        <h3>{transaction.description || 'General entry'}</h3>
                        <p className="item-meta">
                          <span>
                            <Tag size={12} />
                            {transaction.category_name || 'Uncategorized'}
                          </span>
                          <span className="item-date">
                            <Calendar size={12} />
                            {transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy') : '-'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="item-right">
                      <span className={`amount-pill ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                        {getSignedAmount(transaction)}
                      </span>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(transaction.id)}
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {showModal && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Add Transaction</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="field-group">
                <label className="field-label">Type</label>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segment ${formData.type === 'expense' ? 'is-active expense' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    className={`segment ${formData.type === 'income' ? 'is-active income' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="field-grid">
                <div className="field-group">
                  <label className="field-label">Amount (KES)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Category</label>
                  <select
                    required
                    className="input-field"
                    value={formData.category_id}
                    onChange={(event) => setFormData({ ...formData, category_id: event.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="input-field"
                  placeholder="Groceries, salary, rent..."
                />
              </div>

              <div className="field-group">
                <label className="field-label">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                  className="input-field"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
