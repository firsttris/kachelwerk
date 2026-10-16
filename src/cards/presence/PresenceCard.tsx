import { useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { m } from '../../i18n/messages';
import { Presence } from './Presence';
import { type PresenceConfig, peopleOf, viewOfPerson } from './presenceModel';

export type { PresenceConfig };

export const PresenceCard = ({ hass, config }: CardProps<PresenceConfig>) => {
  const moreInfo = useMoreInfo();
  const people = peopleOf(config).map((person) => viewOfPerson(hass, person));
  return (
    <Presence
      title={config.name ?? m.PERSON_TITLE()}
      people={people}
      status={{ UNREACH: people.every((person) => person.unavailable) }}
      onPerson={moreInfo}
    />
  );
};

export const presenceEntities = (config: PresenceConfig) => peopleOf(config).map((person) => person.entity);

const PEOPLE = ['person', 'device_tracker'];

export const presenceSchema = [
  { name: 'entity', label_key: 'person', required: true, selector: { entity: { domain: PEOPLE } } },
  { name: 'entities', label_key: 'people', selector: { entity: { domain: PEOPLE, multiple: true } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
