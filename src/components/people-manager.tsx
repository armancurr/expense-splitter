import { useEffect, useRef, useState } from 'react';
import { Plus, CaretDown, CaretUp, Users } from '@phosphor-icons/react';

interface PeopleManagerProps {
  people: string[];
  onAddPerson: (name: string) => boolean;
  onRemovePerson: (name: string) => void;
}

type Msg = { text: string; type: 'success' | 'error' } | null;

export default function PeopleManager({ people, onAddPerson, onRemovePerson }: PeopleManagerProps) {
  const [nameInput, setNameInput] = useState('');
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = normalize(nameInput);
    if (!trimmed) {
      flash({ text: 'Please enter a name', type: 'error' });
      return;
    }

    const ok = onAddPerson(trimmed);
    if (ok) {
      setNameInput('');
      flash({ text: 'Person added successfully', type: 'success' });
    } else {
      flash({ text: 'This person already exists', type: 'error' });
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-6 md:p-8">
      <header className="flex items-start justify-between max-w-md gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lime-300 text-xl md:text-2xl font-semibold leading-tight">Manage People</h2>
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
            Add people to share the expenses with.
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
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Type a name and press +"
            aria-label="Person name"
            className="w-full px-6 py-4 rounded-sm bg-neutral-900 placeholder-neutral-500 text-neutral-100 focus:ring-0 focus:outline-none border border-neutral-800"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors duration-200 active:scale-95 border border-indigo-400"
        >
          <Plus size={16} weight="bold" className="bg-transparent" />
        </button>
      </form>

      <section>
          {people.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-4 bg-neutral-900">
                <Users size={36} className="text-neutral-400 bg-transparent" />
              </div>
              <p className="text-neutral-300 text-base">No people added yet</p>
              <p className="text-neutral-400 text-sm mt-1">Add people to start splitting expenses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {people.map((person) => {
                const displayName = person.trim();
                const initial = displayName.charAt(0).toUpperCase() || '?';

                return (
                  <div
                    key={person}
                    className="person-card flex flex-col items-center gap-3 p-4 rounded-sm bg-neutral-900 border border-neutral-800 text-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 text-white text-lg border border-neutral-700 font-medium">
                      {initial}
                    </div>
                    <div className="text-sm font-medium text-neutral-100 bg-transparent truncate w-full">{displayName}</div>

                    <button
                      type="button"
                      onClick={() => onRemovePerson(person)}
                      aria-label={`Remove ${displayName}`}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-sm text-sm font-medium transition-colors duration-200 hover:bg-white/10 text-neutral-500 active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
      </section>
        </>
      )}
    </div>
  );
}
