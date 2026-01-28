export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface KeyData {
    note: string;
    octave: number;
    isSharp: boolean;
    frequency?: number;
}

export function generateKeyboard(startOctave: number = 0, endOctave: number = 8): KeyData[] {
    const keys: KeyData[] = [];
    // Standard piano 88 keys usually starts at A0, ends at C8.

    for (let oct = startOctave; oct <= endOctave; oct++) {
        for (let i = 0; i < NOTES.length; i++) {
            const note = NOTES[i];

            // Logic for A0 start (Standard Piano starts at A0)
            if (oct === 0 && (note === 'C' || note === 'C#' || note === 'D' || note === 'D#' || note === 'E' || note === 'F' || note === 'F#' || note === 'G' || note === 'G#')) continue;

            // Logic for C8 end
            if (oct === 8 && note !== 'C') break;

            keys.push({
                note: note,
                octave: oct,
                isSharp: note.includes('#')
            });
        }
    }
    return keys;
}

export const getNoteId = (note: string, octave: number) => `${note}${octave}`;
