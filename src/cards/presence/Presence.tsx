import { useEffect, useState } from 'preact/hooks';
import { Tile, type TileStatus } from '../../components/Tile';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { PersonRow } from './PersonRow';
import type { PersonView } from './presenceModel';

// "since 12 min" moves on by itself
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

// Who is home: the people of the house in a list, those at home in green,
// the others with the zone they are in or on the way
export const Presence = ({
  title,
  people,
  status,
  onPerson,
}: {
  title: string;
  people: PersonView[];
  status?: TileStatus;
  onPerson?: (id: string) => void;
}) => {
  const now = useNow();
  const home = people.filter((person) => person.where === 'home').length;
  return (
    <Tile status={status} role="group" aria-label={title}>
      <div className="flex flex-col gap-2.5 p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="line-clamp-2 text-[15px] leading-snug font-medium" title={title}>
            {title}
          </span>
          {people.length > 1 && (
            <span
              role="status"
              className={cn(
                'text-[13px] tabular-nums',
                home > 0 ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground',
              )}
            >
              {m.PERSON_COUNT_HOME({ home, total: people.length })}
            </span>
          )}
        </div>
        <ul className="grid gap-1.5 @min-[460px]:grid-cols-2">
          {people.map((person) => (
            <PersonRow key={person.id} person={person} now={now} onTap={() => onPerson?.(person.id)} />
          ))}
        </ul>
      </div>
    </Tile>
  );
};
