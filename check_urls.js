import https from 'https';

const urls = [
  'https://tonejs.github.io/audio/salamander/C4.mp3',
  'https://tonejs.github.io/audio/salamander/A4.mp3',
  'https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/organ/C4.wav',
  'https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/harmonium/C4.wav', // Organ fallback
  'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/harpsichord-mp3/A4.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/harpsichord-mp3/A4.mp3'
];

urls.forEach(url => {
  const req = https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`${res.statusCode} : ${url}`);
  });
  req.on('error', console.error);
  req.end();
});
