import BalanceView from './components/BalanceView';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import PeopleManager from './components/PeopleManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Expense } from './types';

function App() {
  // State management with localStorage persistence
  // Start with empty arrays for a clean slate
  const [people, setPeople] = useLocalStorage<string[]>('expense-splitter-people', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expense-splitter-expenses', []);

  // Add a new person to the group
  const addPerson = (name: string) => {
    if (!name.trim()) return false;
    if (people.includes(name.trim())) return false;
    setPeople([...people, name.trim()]);
    return true;
  };

  // Remove a person from the group
  const removePerson = (name: string) => {
    setPeople(people.filter(person => person !== name));
  };

  // Add a new expense
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now(), // Simple ID generation using timestamp
    };
    setExpenses([...expenses, newExpense]);
  };

  // Delete an expense
  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <header className="bg-white/10 backdrop-blur-md p-6 text-center border-b border-white/20">
        <h1 className="text-white text-4xl font-bold drop-shadow-lg">💰 Expense Splitter</h1>
      </header>

      <main className="p-8">
        <div className="max-w-7xl mx-auto flex gap-8" style={{ minWidth: '1000px' }}>
          <div style={{ width: '50%', minWidth: '500px' }}>
            <PeopleManager 
              people={people}
              onAddPerson={addPerson}
              onRemovePerson={removePerson}
            />
            <ExpenseForm 
              people={people}
              onAddExpense={addExpense}
            />
          </div>

          <div style={{ width: '50%', minWidth: '500px' }}>
            <BalanceView 
              people={people}
              expenses={expenses}
            />
            <ExpenseList 
              expenses={expenses}
              onDeleteExpense={deleteExpense}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
