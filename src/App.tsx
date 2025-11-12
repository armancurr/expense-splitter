import BalanceView from './components/balance-view';
import ExpenseForm from './components/expense-form';
import ExpenseList from './components/expense-list';
import PeopleManager from './components/people-manager';
import { useLocalStorage } from './hooks/use-local-storage';
import { GithubLogo } from '@phosphor-icons/react';
import { Expense } from './types';

export default function App() {
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
    <div className="min-h-screen">
      <header className="p-4 text-left">
        <div className="max-w-7xl p-8 mx-auto rounded-sm border border-neutral-800 relative">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-100 mb-4">
              Expense Splitter
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-neutral-300 mb-4">
              Add the people you&apos;re planning with, log your shared purchases, and see
              balanced payouts instantly. Expense Splitter keeps everyone aligned without
              the spreadsheet hassle.
            </p>
          </div>
          <a
            href="https://github.com/armancurr/expense-splitter"
            target="_blank"
            rel="noopener noreferrer"
            className="relative md:absolute bottom-0 md:bottom-8 right-0 md:right-8 mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-100 hover:bg-neutral-800 hover:border-neutral-700 transition-colors duration-300 font-medium text-sm md:text-base w-fit"
          >
            <GithubLogo size={22} className="bg-transparent"/>
            <span className="hidden sm:inline">View Source Code</span>
            <span className="sm:hidden">Source</span>
          </a>
        </div>
      </header>

      <main className="p-2">
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
