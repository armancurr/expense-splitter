import { useState } from 'react';
import { MinusCircle, Plus } from '@phosphor-icons/react';

interface PeopleManagerProps {
  people: string[];
  onAddPerson: (name: string) => boolean;
  onRemovePerson: (name: string) => void;
}

export default function PeopleManager({ people, onAddPerson, onRemovePerson }: PeopleManagerProps) {
  const [nameInput, setNameInput] = useState('');

  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = normalize(nameInput);
    if (!trimmed) return;

    const ok = onAddPerson(trimmed);
    if (ok) {
      setNameInput('');
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 md:p-8">
      <header className="flex items-start justify-between max-w-md gap-4 mb-6">
        <div>
          <h2 className="text-lime-300 text-xl md:text-2xl font-semibold leading-tight">Manage People</h2>
          <p className="text-neutral-400 text-sm md:text-base mt-1">
            Add people to share the expenses with.
          </p>
        </div>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Type a name and press +"
            aria-label="Person name"
            className="w-full px-4 py-3 rounded-lg bg-neutral-900 placeholder-neutral-500 text-neutral-100 focus:ring-0 glow-focus"
          />
        </div>

        <button
          type="submit"
          onClick={() => handleSubmit()}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus size={16} weight="bold" />
        </button>
      </form>

      <section>
        {people.length === 0 ? (
          <div className="p-6 text-center text-neutral-500">
            Add at least two people to begin splitting expenses.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {people.map((person) => {
              const displayName = person.trim();
              const initial = displayName.charAt(0).toUpperCase() || '?';

              return (
                <div
                  key={person}
                  className="person-card flex flex-col items-center gap-3 p-4 rounded-lg bg-neutral-900 text-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 text-white text-lg font-medium">
                    {initial}
                  </div>
                  <div className="text-sm font-medium text-neutral-100 truncate w-full">{displayName}</div>

                  <button
                    type="button"
                    onClick={() => onRemovePerson(person)}
                    aria-label={`Remove ${displayName}`}
                    className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10 text-neutral-100 active:scale-95"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
