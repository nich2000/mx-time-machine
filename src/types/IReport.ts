import { TypeReport } from '@/types/TypeReport';
import { TypeRoundReport } from '@/types/TypeRoundReport';

export interface IReport {
    _id: string;
    competitionId: string;
    roundId?: string;
    name: string;
    type: TypeReport;
    sessionId: string;
    typeRound: TypeRoundReport;
    notCountedRounds?: number;
    onlySportsmen?: boolean;
    simplified?: boolean;
    count?: number;
    broadCastStyle?: boolean;

    // competition_name: string;
    // competition_description: string;
    // person1_title: string;
    // person1_name: string;
    // person2_title: string;
    // person2_name: string;
    // person3_title: string;
    // person3_name: string;
}
