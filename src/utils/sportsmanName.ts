import { ISportsman } from '@/types/ISportsman';
import { trimEnd } from 'lodash';

export const sportsmanName = (sportsman: ISportsman, short: boolean = false): string => {
    if (!sportsman) return '';

    let result = `${sportsman.lastName || ''}${sportsman.firstName ? ` ${sportsman.firstName}` : ''} ${
        sportsman.middleName && !short ? ` ${sportsman.middleName}` : ''
    }${sportsman.nick ? ` (${sportsman.nick})` : ''}`;

    return trimEnd(result);
};
