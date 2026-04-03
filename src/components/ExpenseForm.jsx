import React, { useState, useEffect } from 'react';
import API from '../api';
import { PlusCircle, Loader2, X } from 'lucide-react';

const ExpenseForm = ({ onExpenseAdded, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount ?? '',
    date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    categoryName: initialData?.category?.name || ''
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      description: initialData?.description || '',
      amount: initialData?.amount ?? '',
      date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
      categoryName: initialData?.category?.name || ''
    });
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data);

        if (!initialData && res.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            categoryName: prev.categoryName || res.data[0].name
          }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.categoryName) {
      return alert("Please fill all fields");
    }

    setIsSubmitting(true);

    const payload = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: `${formData.date}T00:00:00`,
      category: {
        name: formData.categoryName
      }
    };

    try {
      if (initialData?.id) {
        await API.put(`/budget/expenses/${initialData.id}`, payload);
      } else {
        await API.post('/budget/add', payload);
      }

      onExpenseAdded();
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data || "Error while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white shadow-2xl rounded-3xl p-8 border border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800">
        <PlusCircle className="mr-2 text-blue-600" size={28} />
        {initialData ? "Edit Expense" : "New Expense"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-black text-gray-400 uppercase ml-1">
            What did you spend on?
          </label>
          <input
            name="description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-4 mt-1 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-400 uppercase ml-1">
            Amount (Rs)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-4 mt-1 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase ml-1">
              Date
            </label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-4 mt-1 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase ml-1">
              Category
            </label>

            <select
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              className="w-full p-4 mt-1 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : initialData ? "Update Expense" : "Save Expense"}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
