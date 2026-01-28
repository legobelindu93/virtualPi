
// Classical
import solfegietto from '../midi/C.P.E.Bach Solfeggieto.mid?url';
import moonlight3rd from '../midi/ludwig-van-beethoven-moonlight-sonata-3rd-movement-midi-generated.mid?url';
import odeToJoy from '../midi/Beethhoven_-_Beethoven_-_9th_Symphony_(Ode_To_Joy)_[Easy_Piano_Tutorial].mid?url';
import moonlight from '../midi/Beethoven-Moonlight-Sonata.mid?url';
import symph5_4th from '../midi/Beethoven_Ludwig_van_-_Beethoven_Symphony_No._5_4th.mid?url';
import symph5_1st from '../midi/Beethoven_Ludwig_van_-_Symphony_No.5_Mvt.1__Fate_.mid?url';
import mozartVar from '../midi/twinkle-twinkle-little-star-mozart-variations.mid?url';
import waltz from '../midi/WLZ_64-1.MID?url'; // Chopin Minute Waltz
import lassaSymphony from '../midi/73273_Lassasymphonie.mid?url';
import bachBwv806 from '../midi/Bwv806.mid?url';
import mozartLacrimosa from '../midi/Mozart-Lacrimosa-requiem-Anonymous-20160827220113-nonstop2k.com.mid?url';
import chopinNocturne from '../midi/chopin-nocturne-op-9-no-2-e-flat-major.mid?url';
import chopinBallade from '../midi/frederic-chopin-ballade-no3-in-a-flat-major-op47.mid?url';
import rachmaninoffConcerto from '../midi/rachmaninoff-piano-concerto-no-3-in-d-minor-i-allegro-ma-non-tanto-arranged-for-solo-piano.mid?url';

// Anime
import bleach from '../midi/Bleach - Life is Like a Boat.mid?url';
import evangelion from '../midi/Evangelion - Cruel Angel\'s Thesis.mid?url';
import naruto from '../midi/Naruto Shippuden - Blue Bird.mid?url';
import sao from '../midi/Sword Art Online (SAO)_ Crossing Field.mid?url';

// Other / Video Games / Pop
import beethovenVirus from '../midi/Diana-Boncheva-feat-BanYa-Beethoven-Virus-Piano-version-Anonymous-20220805174142-nonstop2k.com.mid?url';
import calamity from '../midi/Calamity_Mod_OST__DM_DOKURO_-_UNIVERSAL_COLLAPSE__Piano_solo.mid?url';
import finalCountdown from '../midi/EUROPE.The final countdown K.mid?url';
import beethovenVirusInsane from '../midi/Beethoven Virus (insane).mid.mid?url';
import rushE from '../midi/Rush E Original + Midi Download.mid?url';
import erika from '../midi/erika.mid.mid?url';

export type SongCategory = 'Classical' | 'Anime' | 'Other';

export interface Song {
    id: string;
    title: string;
    url: string;
    category: SongCategory;
    bpm: number;
    duration: number; // in seconds
}

export const SONGS: Song[] = [
    // Classical
    { id: 'solfegietto', title: 'C.P.E. Bach - Solfeggieto', url: solfegietto, category: 'Classical', bpm: 120, duration: 90 },
    { id: 'moonlight3', title: 'Beethoven - Moonlight Sonata (3rd Mvt)', url: moonlight3rd, category: 'Classical', bpm: 180, duration: 420 },
    { id: 'moonlight1', title: 'Beethoven - Moonlight Sonata', url: moonlight, category: 'Classical', bpm: 54, duration: 360 },
    { id: 'ode', title: 'Beethoven - Ode To Joy', url: odeToJoy, category: 'Classical', bpm: 120, duration: 180 },
    { id: 'symph5_1', title: 'Beethoven - Symphony No.5 (1st Mvt)', url: symph5_1st, category: 'Classical', bpm: 108, duration: 480 },
    { id: 'symph5_4', title: 'Beethoven - Symphony No.5 (4th Mvt)', url: symph5_4th, category: 'Classical', bpm: 84, duration: 540 },
    { id: 'mozart', title: 'Mozart - Twinkle Variations', url: mozartVar, category: 'Classical', bpm: 120, duration: 300 },
    { id: 'waltz', title: 'Chopin - Minute Waltz (Op. 64 No. 1)', url: waltz, category: 'Classical', bpm: 144, duration: 100 },
    { id: 'lassa', title: 'Lassus - Symphony', url: lassaSymphony, category: 'Classical', bpm: 120, duration: 240 },
    { id: 'bach806', title: 'Bach - French Suite No. 1 (BWV 806)', url: bachBwv806, category: 'Classical', bpm: 120, duration: 180 },
    { id: 'lacrimosa', title: 'Mozart - Lacrimosa (Requiem)', url: mozartLacrimosa, category: 'Classical', bpm: 80, duration: 210 },
    { id: 'nocturne', title: 'Chopin - Nocturne Op. 9 No. 2', url: chopinNocturne, category: 'Classical', bpm: 66, duration: 270 },
    { id: 'ballade', title: 'Chopin - Ballade No. 3 in A♭ Major', url: chopinBallade, category: 'Classical', bpm: 138, duration: 420 },
    { id: 'rach3', title: 'Rachmaninoff - Piano Concerto No. 3', url: rachmaninoffConcerto, category: 'Classical', bpm: 144, duration: 900 },

    // Anime
    { id: 'evangelion', title: 'Evangelion - Cruel Angel\'s Thesis', url: evangelion, category: 'Anime', bpm: 128, duration: 240 },
    { id: 'naruto', title: 'Naruto - Blue Bird', url: naruto, category: 'Anime', bpm: 140, duration: 210 },
    { id: 'bleach', title: 'Bleach - Life is Like a Boat', url: bleach, category: 'Anime', bpm: 120, duration: 220 },
    { id: 'sao', title: 'SAO - Crossing Field', url: sao, category: 'Anime', bpm: 145, duration: 230 },

    // Other
    { id: 'virus', title: 'Beethoven Virus', url: beethovenVirus, category: 'Other', bpm: 160, duration: 180 },
    { id: 'virusInsane', title: 'Beethoven Virus (Insane)', url: beethovenVirusInsane, category: 'Other', bpm: 200, duration: 200 },
    { id: 'calamity', title: 'Terraria Calamity - Universal Collapse', url: calamity, category: 'Other', bpm: 150, duration: 300 },
    { id: 'final', title: 'Europe - The Final Countdown', url: finalCountdown, category: 'Other', bpm: 118, duration: 310 },
    { id: 'rushE', title: 'Rush E', url: rushE, category: 'Other', bpm: 180, duration: 150 },
    { id: 'erika', title: 'Erika', url: erika, category: 'Other', bpm: 112, duration: 180 },
];
