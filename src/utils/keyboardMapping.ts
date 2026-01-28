// Keyboard mapping from config.json
export const KEYBOARD_MAPPING: Record<string, string> = {
    // Octave 0
    'A0': '1',
    'A#0': '2',
    'B0': '3',

    // Octave 1
    'C1': '4',
    'C#1': '5',
    'D1': '6',
    'D#1': '7',
    'E1': '8',
    'F1': '9',
    'F#1': '0',
    'G1': 'q',
    'G#1': 'w',
    'A1': 'e',
    'A#1': 'r',
    'B1': 't',

    // Octave 2
    'C2': '1',
    'C#2': '!',
    'D2': '2',
    'D#2': '@',
    'E2': '3',
    'F2': '4',
    'F#2': '$',
    'G2': '5',
    'G#2': '%',
    'A2': '6',
    'A#2': '^',
    'B2': '7',

    // Octave 3
    'C3': '8',
    'C#3': '*',
    'D3': '9',
    'D#3': '(',
    'E3': '0',
    'F3': 'q',
    'F#3': 'Q',
    'G3': 'w',
    'G#3': 'W',
    'A3': 'e',
    'A#3': 'E',
    'B3': 'r',

    // Octave 4
    'C4': 't',
    'C#4': 'T',
    'D4': 'y',
    'D#4': 'Y',
    'E4': 'u',
    'F4': 'i',
    'F#4': 'I',
    'G4': 'o',
    'G#4': 'O',
    'A4': 'p',
    'A#4': 'P',
    'B4': 'a',

    // Octave 5
    'C5': 's',
    'C#5': 'S',
    'D5': 'd',
    'D#5': 'D',
    'E5': 'f',
    'F5': 'g',
    'F#5': 'G',
    'G5': 'h',
    'G#5': 'H',
    'A5': 'j',
    'A#5': 'J',
    'B5': 'k',

    // Octave 6
    'C6': 'l',
    'C#6': 'L',
    'D6': 'z',
    'D#6': 'Z',
    'E6': 'x',
    'F6': 'c',
    'F#6': 'C',
    'G6': 'v',
    'G#6': 'V',
    'A6': 'b',
    'A#6': 'B',
    'B6': 'n',

    // Octave 7
    'C7': 'm',
};

// Reverse mapping for keyboard to note
export const KEY_TO_NOTE: Record<string, string> = {};
Object.entries(KEYBOARD_MAPPING).forEach(([note, key]) => {
    KEY_TO_NOTE[key.toLowerCase()] = note;
    KEY_TO_NOTE[key.toUpperCase()] = note;
});
