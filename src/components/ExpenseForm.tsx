import { useState } from 'react';
import { Expense } from '../types';

interface ExpenseFormProps {
  people: string[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

function ExpenseForm({ people, onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<{ [person: string]: number }>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleCheckboxChange = (person: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, person]);
      if (splitType === 'custom') {
        setCustomAmounts({ ...customAmounts, [person]: 0 });
      }
    } else {
      setSplitBetween(splitBetween.filter(p => p !== person));
      if (splitType === 'custom') {
        const newAmounts = { ...customAmounts };
        delete newAmounts[person];
        setCustomAmounts(newAmounts);
      }
    }
  };

  const handleCustomAmountChange = (person: string, value: string) => {
    setCustomAmounts({
      ...customAmounts,
      [person]: parseFloat(value) || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      setMessage({ text: 'Please enter a description', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!paidBy) {
      setMessage({ text: 'Please select who paid', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (splitBetween.length === 0) {
      setMessage({ text: 'Please select at least one person to split with', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate custom amounts
    if (splitType === 'custom') {
      const totalCustom = Object.values(customAmounts).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalCustom - amountNum) > 0.01) {
        setMessage({ text: `Custom amounts must total $${amountNum.toFixed(2)}`, type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
    }

    const newExpense: Omit<Expense, 'id'> = {
      description: description.trim(),
      amount: amountNum,
      date,
      paidBy,
      splitBetween,
      splitType,
      ...(splitType === 'custom' && { customAmounts })
    };

    onAddExpense(newExpense);

    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy('');
    setSplitBetween([]);
    setCustomAmounts({});
    setSplitType('equal');

    setMessage({ text: 'Expense added successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        💸 Add Expense
      </h2>

      {message && (
        <div className={`px-3 py-2 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
        }`}>
          {message.text}
        </div>
      )}

      {people.length < 2 && (
        <div className="px-3 py-2 rounded-md mb-4 bg-yellow-100 text-yellow-900">
          ⚠️ Add at least 2 people to create expenses
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block mb-1 text-gray-700 font-medium text-sm"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was the expense for?"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label
              htmlFor="amount"
              className="block mb-1 text-gray-700 font-medium text-sm"
            >
              Amount ($)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 mb-4">
            <label
              htmlFor="date"
              className="block mb-1 text-gray-700 font-medium text-sm"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="paidBy"
            className="block mb-1 text-gray-700 font-medium text-sm"
          >
            Paid By
          </label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Select person...</option>
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Split Type
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
              <input
                type="radio"
                value="equal"
                checked={splitType === 'equal'}
                onChange={() => setSplitType('equal')}
                name="splitType"
                className="cursor-pointer"
              />
              <span>Equal Split</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
              <input
                type="radio"
                value="custom"
                checked={splitType === 'custom'}
                onChange={() => setSplitType('custom')}
                name="splitType"
                className="cursor-pointer"
              />
              <span>Custom Amounts</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Split Between
          </label>
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <div
                key={person}
                className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1"
              >
                <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
                  <input 
                    type="checkbox"
                    checked={splitBetween.includes(person)}
                    onChange={(e) => handleCheckboxChange(person, e.target.checked)}
                    className="cursor-pointer" 
                  />
                  <span>{person}</span>
                </label>
                {splitType === 'custom' && splitBetween.includes(person) && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={customAmounts[person] || ''}
                    onChange={(e) => handleCustomAmountChange(person, e.target.value)}
                    className="w-24 px-2 py-1 border-2 border-gray-200 rounded-md text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={people.length < 2}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-indigo-600 hover:-translate-y-px flex items-center justify-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;
