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
    // official1_title: string;
    // official1_name: string;
    // official2_title: string;
    // official2_name: string;
    // official3_title: string;
    // official3_name: string;
}
