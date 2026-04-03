import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ExpenseForm from './components/ExpenseForm';
import SpendingChart from './components/SpendingChart';
import FilterBar from './components/FilterBar';
import API, { setAuthToken, updateUser, getCurrentUser, addExtraBudget } from './api';
import { Wallet, LogOut, Plus, Pencil, Trash2, IndianRupee } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ dailyAverage: 0 });
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyOverview, setMonthlyOverview] = useState({
    currentMonthSpent: 0,
    monthlyBudget: 0,
    extraBudget: 0,
    totalAvailableBudget: 0,
    remainingBudget: 0,
    budgetUsedPercentage: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activitySearch, setActivitySearch] = useState('');
  const [isExtraBudgetOpen, setIsExtraBudgetOpen] = useState(false);
  const [extraBudgetAmount, setExtraBudgetAmount] = useState('');

  // Filter State
  const [filter, setFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', email: '', password: '', monthlyBudget: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    const oauthUsername = params.get('username');
    const oauthUserId = params.get('id');

    if (oauthToken) {
      localStorage.setItem('token', oauthToken);

      if (oauthUsername) {
        localStorage.setItem('username', oauthUsername);
      }

      if (oauthUserId) {
        localStorage.setItem('userId', oauthUserId);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedUserId = localStorage.getItem('userId');

    if (!token) return;

    setAuthToken(token);

    if (savedUsername) {
      setUser({ username: savedUsername, id: savedUserId });
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.data?.username) {
          localStorage.setItem('username', res.data.username);
        }
        if (res.data?.id) {
          localStorage.setItem('userId', res.data.id);
        }
        setUser(res.data);
      } catch (err) {
        console.error("Current User Fetch Error:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!isProfileOpen || !user) return;

    setProfileData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      monthlyBudget: user.monthlyBudget ?? ''
    });
  }, [isProfileOpen, user]);

  const handleApplyFilter = (newFilter, start, end) => {
    setFilter(newFilter);
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        let url = '/budget/dashboard';

        if (startDate && endDate) {
          url += `?start=${startDate}T00:00:00&end=${endDate}T23:59:59`;
        }

        const [dashboardRes, monthlyRes] = await Promise.all([
          API.get(url),
          API.get('/budget/monthly-overview')
        ]);

        setExpenses(dashboardRes.data.expenses || []);
        setChartData(dashboardRes.data.chartData || []);
        setTotalSpent(dashboardRes.data.total || 0);
        setSummary({ dailyAverage: dashboardRes.data.dailyAverage || 0 });
        setMonthlyOverview({
          currentMonthSpent: monthlyRes.data.currentMonthSpent || 0,
          monthlyBudget: monthlyRes.data.monthlyBudget || 0,
          extraBudget: monthlyRes.data.extraBudget || 0,
          totalAvailableBudget: monthlyRes.data.totalAvailableBudget || 0,
          remainingBudget: monthlyRes.data.remainingBudget || 0,
          budgetUsedPercentage: monthlyRes.data.budgetUsedPercentage || 0
        });
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, refreshTrigger, filter, startDate, endDate]);

  const handleExpenseAdded = () => {
    setRefreshTrigger(t => t + 1);
    setIsFormOpen(false);
    setSelectedExpense(null);
  };

  const handleAddExpenseClick = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    const shouldDelete = window.confirm("Do you want to delete this expense?");

    if (!shouldDelete) return;

    try {
      await API.delete(`/budget/expenses/${expenseId}`);
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data || "Unable to delete expense");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);
    setUser(null);
  };

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleProfileUpdate = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const payload = {
        ...profileData,
        monthlyBudget: profileData.monthlyBudget === '' ? null : Number(profileData.monthlyBudget)
      };

      const res = await updateUser(userId, payload);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setAuthToken(res.data.token);
      }

      if (res.data.user) {
        localStorage.setItem('username', res.data.user.username);
        setUser(res.data.user);
      }

      alert("Profile Updated Successfully!");
      setIsProfileOpen(false);
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleAddExtraBudget = async () => {
    try {
      if (!extraBudgetAmount || Number(extraBudgetAmount) <= 0) {
        return alert("Enter valid extra budget amount");
      }

      const res = await addExtraBudget({ amount: Number(extraBudgetAmount) });

      if (res.data.user) {
        setUser(res.data.user);
      }

      setExtraBudgetAmount('');
      setIsExtraBudgetOpen(false);
      setRefreshTrigger(t => t + 1);
      alert("Extra budget added for this month");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add extra budget");
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

  const formatExpenseDate = (value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  };

  const filteredExpenses = expenses.filter((exp) => {
    const searchValue = activitySearch.trim().toLowerCase();

    if (!searchValue) return true;

    const description = exp.description?.toLowerCase() || '';
    const category = exp.category?.name?.toLowerCase() || '';

    return description.includes(searchValue) || category.includes(searchValue);
  });

  if (!user) return isRegistering ? (
    <Register onBackToLogin={() => setIsRegistering(false)} />
  ) : (
    <Login onLoginSuccess={setUser} onGoToRegister={() => setIsRegistering(true)} />
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Budgeter</h1>
            <p className="text-gray-500 text-sm">Welcome, {user.username}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsProfileOpen(true)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition">
              Profile
            </button>
            <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <FilterBar onApply={handleApplyFilter} currentFilter={filter} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-lg shadow-blue-200">
                <Wallet size={30} />
                <p className="text-blue-100 text-sm mt-4 uppercase tracking-wider font-semibold">
                  Total Amount Spent
                </p>
                <h2 className="text-4xl font-black mt-1">
                  {formatCurrency(totalSpent)}
                </h2>
              </div>
              <div onClick={handleAddExpenseClick} className="border-2 border-dashed border-gray-300 p-8 rounded-3xl cursor-pointer flex items-center justify-center hover:bg-blue-50 transition-all text-gray-400 group">
                <Plus size={40} className="group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border">
                <p className="text-sm font-bold text-gray-500">This Month</p>
                <h3 className="text-2xl font-black text-gray-800 mt-2">
                  {formatCurrency(monthlyOverview.currentMonthSpent)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border">
                <p className="text-sm font-bold text-gray-500">Monthly Budget</p>
                <h3 className="text-2xl font-black text-gray-800 mt-2">
                  {formatCurrency(monthlyOverview.monthlyBudget)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border">
                <p className="text-sm font-bold text-gray-500">Extra Budget</p>
                <h3 className="text-2xl font-black text-gray-800 mt-2">
                  {formatCurrency(monthlyOverview.extraBudget)}
                </h3>
                <button
                  onClick={() => setIsExtraBudgetOpen(true)}
                  className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Add for this month
                </button>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border">
                <p className="text-sm font-bold text-gray-500">Remaining</p>
                <h3 className={`text-2xl font-black mt-2 ${monthlyOverview.remainingBudget < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                  {formatCurrency(monthlyOverview.remainingBudget)}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-black text-gray-800">Budget Progress</h3>
                  <p className="text-sm text-gray-500">Current month spending against your total available budget</p>
                </div>
                <div className="flex items-center gap-1 text-gray-700 font-bold">
                  <IndianRupee size={16} />
                  <span>{summary.dailyAverage.toFixed(2)} / day</span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${monthlyOverview.remainingBudget < 0 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(monthlyOverview.budgetUsedPercentage || 0, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Total available this month: {formatCurrency(monthlyOverview.totalAvailableBudget)}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border min-h-[400px]">
              <SpendingChart data={chartData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-lg text-gray-800">Activity</h2>
              <span className="text-xs font-bold text-gray-400">{filteredExpenses.length} records</span>
            </div>
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Search expense"
              className="w-full p-3 mb-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-400 py-10">Loading...</p>
              ) : filteredExpenses.length > 0 ? filteredExpenses.slice(0, 10).map(exp => (
                <div key={exp.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                  <div>
                    <p className="font-bold text-gray-800">{exp.description}</p>
                    <p className="text-xs text-gray-400">
                      {exp.category?.name || 'General'} | {formatExpenseDate(exp.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-500">-{formatCurrency(exp.amount)}</span>
                    <button
                      onClick={() => handleEditExpense(exp)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-10">No records found for this search.</p>
              )}
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <ExpenseForm
              initialData={selectedExpense}
              onClose={() => {
                setIsFormOpen(false);
                setSelectedExpense(null);
              }}
              onExpenseAdded={handleExpenseAdded}
            />
          </div>
        )}

        {isExtraBudgetOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
              <h2 className="font-black text-xl mb-4">Add Extra Budget</h2>
              <input
                type="number"
                value={extraBudgetAmount}
                onChange={(e) => setExtraBudgetAmount(e.target.value)}
                placeholder="Amount for this month"
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-3">
                This extra budget is only for the current month.
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setIsExtraBudgetOpen(false)} className="text-gray-500 font-bold px-4">Cancel</button>
                <button onClick={handleAddExtraBudget} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">Add</button>
              </div>
            </div>
          </div>
        )}

        {isProfileOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
              <h2 className="font-black text-xl mb-4">Update Profile</h2>
              <div className="space-y-3">
                <input
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="password"
                  placeholder="New Password"
                  value={profileData.password}
                  type="password"
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="monthlyBudget"
                  value={profileData.monthlyBudget}
                  type="number"
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setIsProfileOpen(false)} className="text-gray-500 font-bold px-4">Cancel</button>
                <button onClick={handleProfileUpdate} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
