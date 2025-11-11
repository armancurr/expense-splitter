import BalanceView from './components/balance-view';
import ExpenseForm from './components/expense-form';
import ExpenseList from './components/expense-list';
import PeopleManager from './components/people-manager';
import { useLocalStorage } from './hooks/use-local-storage';
import { Expense } from './types';

export default function App() {
  // Start with empty arrays and then uses the localStorage to persist the data
  const [people, setPeople] = useLocalStorage<string[]>('expense-splitter-people', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expense-splitter-expenses', []);

  const addPerson = (name: string) => {
    if (!name.trim()) return false;
    if (people.includes(name.trim())) return false;
    setPeople([...people, name.trim()]);
    return true;
  };

  const removePerson = (name: string) => {
    setPeople(people.filter(person => person !== name));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="p-4 sm:p-6 md:p-8 text-left">
        {/* <h1 className="text-black uppercase text-4xl font-bold">Expense Splitter</h1> */}
      </header>

      <main className="p-2 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-6">
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
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

          <div className="w-full lg:w-1/2 flex flex-col gap-8">
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
