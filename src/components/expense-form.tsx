import { useEffect, useRef, useState } from 'react';
import { Expense } from '../types';
import { Plus, CaretDown, CaretUp, Users } from '@phosphor-icons/react';

interface ExpenseFormProps {
  people: string[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

type Msg = { text: string; type: 'success' | 'error' } | null;

export default function ExpenseForm({ people, onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<Msg>(null);
  const [isFolded, setIsFolded] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearMessage = () => setMessage(null);
  const flash = (m: Msg, ms = 3000) => {
    setMessage(m);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setMessage(null), ms);
  };

  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

  const handleCheckboxChange = (person: string, checked: boolean) => {
    setSplitBetween((prev) => {
      if (checked) {
        // add
        if (!prev.includes(person)) {
          if (splitType === 'custom') {
            setCustomAmounts((p) => ({ ...p, [person]: p[person] ?? 0 }));
          }
          return [...prev, person];
        }
        return prev;
      } else {
        // remove
        if (splitType === 'custom') {
          setCustomAmounts((p) => {
            const next = { ...p };
            delete next[person];
            return next;
          });
        }
        return prev.filter((x) => x !== person);
      }
    });
  };

  const handleCustomAmountChange = (person: string, raw: string) => {
    // parse as float, store number (0 on invalid)
    const parsed = parseFloat(raw);
    setCustomAmounts((p) => ({ ...p, [person]: isNaN(parsed) ? 0 : parsed }));
  };

  const validateAndBuild = () => {
    if (!normalize(description)) {
      flash({ text: 'Please enter a description', type: 'error' });
      return null;
    }

    // parse amount carefully
    const amt = parseFloat(amount);
    if (isNaN(amt) || !(amt > 0)) {
      flash({ text: 'Please enter a valid amount', type: 'error' });
      return null;
    }

    if (!paidBy) {
      flash({ text: 'Please select who paid', type: 'error' });
      return null;
    }

    if (splitBetween.length === 0) {
      flash({ text: 'Select at least one person to split with', type: 'error' });
      return null;
    }

    if (splitType === 'custom') {
      const totalCustom = splitBetween.reduce((sum, p) => sum + (customAmounts[p] ?? 0), 0);
      if (Math.abs(totalCustom - amt) > 0.01) {
        flash({ text: `Custom amounts must total ${amt.toFixed(2)}`, type: 'error' });
        return null;
      }
    }

    const payload: Omit<Expense, 'id'> = {
      description: normalize(description),
      amount: amt,
      date,
      paidBy,
      splitBetween,
      splitType,
      ...(splitType === 'custom' ? { customAmounts } : {})
    };

    return payload;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = validateAndBuild();
    if (!payload) return;

    onAddExpense(payload);

    // reset
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy('');
    setSplitBetween([]);
    setCustomAmounts({});
    setSplitType('equal');

    flash({ text: 'Expense added', type: 'success' });
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-6 md:p-8">
      <header className="flex items-start justify-between max-w-md gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lime-300 text-xl md:text-2xl font-semibold leading-tight">Create Expense</h2>
            <button
              onClick={() => setIsFolded(!isFolded)}
              className="p-1 rounded-sm hover:bg-white/4 transition-colors duration-200 text-neutral-400 hover:text-neutral-200 active:scale-95"
              aria-label={isFolded ? 'Expand' : 'Collapse'}
              aria-expanded={!isFolded}
            >
              {isFolded ? <CaretDown size={20} weight="bold" /> : <CaretUp size={20} weight="bold" />}
            </button>
          </div>
          <p className="text-neutral-400 text-sm md:text-base mt-1">
            Create a new expense for your group.
          </p>
        </div>
      </header>

      <div aria-live="polite" className="min-h-[40px] mb-4">
        {message ? (
          <div
            role="status"
            className={`px-3 py-2 rounded-sm text-sm inline-flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-lime-300/8 text-lime-300 border-lime-300/20'
                : 'bg-red-800/12 text-red-300 border-red-700/20'
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={clearMessage}
              className="ml-2 p-1 rounded-sm hover:bg-white/4 transition-colors duration-200 text-neutral-100 active:scale-95"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      {!isFolded && (
        <>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-200">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was the expense for?"
            className="w-full px-4 py-3 rounded-sm bg-neutral-900 border border-neutral-800 placeholder-neutral-500 text-neutral-100 focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-semibold text-neutral-200">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-sm bg-neutral-900 border border-neutral-800 placeholder-neutral-500 text-neutral-100 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-neutral-200">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-sm bg-neutral-900 border border-neutral-800 placeholder-neutral-500 text-neutral-100 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-200">Paid By</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-4 py-3 rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-400 focus:ring-0 focus:outline-none appearance-none"
          >
            <option value="">Select person...</option>
            {people.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-200">Split Type</label>
          <div className="flex gap-3">
            <label
              className={`flex flex-1 items-center gap-3 px-4 py-3 rounded-sm border text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                splitType === 'equal'
                  ? 'border-indigo-400 bg-indigo-500/15 text-neutral-100'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="split-type"
                value="equal"
                checked={splitType === 'equal'}
                onChange={() => setSplitType('equal')}
                className="h-4 w-4 accent-indigo-500"
              />
              Equal Split
            </label>

            <label
              className={`flex flex-1 items-center gap-3 px-4 py-3 rounded-sm border text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                splitType === 'custom'
                  ? 'border-indigo-400 bg-indigo-500/15 text-neutral-100'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="split-type"
                value="custom"
                checked={splitType === 'custom'}
                onChange={() => setSplitType('custom')}
                className="h-4 w-4 accent-indigo-500"
              />
              Custom Split
            </label>
          </div>
        </div>

        {/* split between */}
        <div>
          <label className="block mb-3 text-sm font-semibold text-neutral-200">Split Between</label>

          {people.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-4 bg-neutral-900">
                <Users size={36} className="text-neutral-400 bg-transparent" />
              </div>
              <p className="text-neutral-300 text-base">No members yet</p>
              <p className="text-neutral-400 text-sm mt-1">Add people to split expenses with</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {people.map((person) => {
                const checked = splitBetween.includes(person);
                const displayName = person.trim();
                const initial = displayName.charAt(0).toUpperCase() || '?';

                return (
                  <div
                    key={person}
                    className={`flex flex-col items-center gap-3 p-4 rounded-sm border text-center transition-colors duration-200 ${
                      checked
                        ? 'border-indigo-500/60 bg-indigo-500/10'
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-medium border ${
                        checked ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-neutral-800 text-white border-neutral-700'
                      }`}
                    >
                      {initial}
                    </div>
                    <div className="text-sm font-medium bg-transparent text-neutral-100 truncate w-full">{displayName}</div>

                    <label className="flex items-center gap-2 cursor-pointer bg-transparent">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleCheckboxChange(person, e.target.checked)}
                        className="h-4 w-4 accent-indigo-600"
                        aria-label={`Include ${displayName}`}
                      />
                      <span className="text-xs bg-transparent text-neutral-400">
                        {checked ? 'Included' : 'Include'}
                      </span>
                    </label>

                    {splitType === 'custom' && checked && (
                      <div className="w-full flex items-center gap-2 rounded-sm bg-neutral-800 border border-neutral-700 px-3 py-2">
                        <span className="text-sm text-neutral-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmounts[person] !== undefined ? String(customAmounts[person]) : ''}
                          onChange={(e) => handleCustomAmountChange(person, e.target.value)}
                          className="w-full rounded-sm bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:ring-0 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={people.length < 2}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-semibold transition-colors duration-200 active:scale-95 focus:outline-none focus:ring-0 ${
            people.length < 2 ? 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-indigo-600 border border-indigo-400 text-white hover:bg-indigo-700'
          }`}
        >
          <Plus size={16} weight="bold" className="bg-transparent" />
          Add Expense
        </button>
      </form>
        </>
      )}
    </div>
  );
}
