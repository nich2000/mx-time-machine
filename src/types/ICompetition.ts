import { IGate } from './IGate';
import { Color } from '@/types/Color';
import { Channel } from '@/types/VTXChannel';

export interface ICompetition {
    _id: string;
    name: string;
    // description: string;
    logo: string;
    selected: boolean;

    // person1_title: string;
    // person1_name: string;
    // person2_title: string;
    // person2_name: string;
    // person3_title: string;
    // person3_name: string;

    latitude: number;
    longitude: number;
    radius: number;
    course: number;
    delay: number;

    // deprecated
    skipFirstGate?: boolean;
    playFail?: boolean;
    gates: IGate[];

    color1: Color;
    color2: Color;
    color3: Color;
    color4: Color;
    color5: Color;
    color6: Color;
    color7: Color;
    color8: Color;

    channel1: Channel;
    channel2: Channel;
    channel3: Channel;
    channel4: Channel;
    channel5: Channel;
    channel6: Channel;
    channel7: Channel;
    channel8: Channel;
}
