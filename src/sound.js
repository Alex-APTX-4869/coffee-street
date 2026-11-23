// Self-contained Web Audio mix. Its five recordings are embedded in the standalone page at build time.
const Snd = (() => {
  const buffers = new Map();
  const paths = new Map();
  let context, master, selection, breeze, loading;
  let place = 'cafe';
  let enabled = true;

  // Track the ramp as well as scheduling it: a second doorway click can reverse
  // the first fade at its instantaneous level, including on older WebKit.
  function fade(node, value, seconds) {
    const now = context.currentTime;
    const old = paths.get(node);
    if (old && old.to === value) return;
    const progress = old && old.end > old.start
      ? Math.max(0, Math.min(1, (now - old.start) / (old.end - old.start))) : 1;
    const from = old ? old.from + (old.to - old.from) * progress : node.gain.value;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(from, now);
    node.gain.linearRampToValueAtTime(value, now + seconds);
    paths.set(node, {start: now, end: now + seconds, from, to: value});
  }

  function route() {
    if (!context) return;
    const inside = place === 'cafe';
    fade(selection, inside ? 1 : 0, inside ? 1.65 : 1.25);
    fade(breeze, inside ? .027 : .29, inside ? 1.4 : 1.75);
  }

  function gain(level, destination) {
    const node = context.createGain();
    node.gain.value = level;
    node.connect(destination);
    return node;
  }

  function loop(buffer, level, destination) {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain(level, destination));
    source.start();
  }

  async function decode(name) {
    const tag = document.getElementById('coffee-audio-' + name);
    if (!tag) throw Error('Missing embedded recording: ' + name);
    const raw = atob(tag.textContent.trim());
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const buffer = await context.decodeAudioData(bytes.buffer);
    buffers.set(name, buffer);
    // The supplied second recording measures -42.3 LUFS; use the original
    // return cue's +21 dB trim before the café fader and master.
    if (name === 'music') loop(buffer, .95 * 10 ** (21 / 20), selection);
    if (name === 'fire') loop(buffer, .085, selection);
    if (name === 'wind') loop(buffer, 1, breeze);
  }

  function init() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return Promise.resolve(false);
    if (!context) {
      context = new Audio();
      master = gain(0, context.destination);
      selection = gain(0, master);
      breeze = gain(0, master);
      route();
      fade(master, enabled ? .90 : 0, .42);
    }
    // Call resume in the original user gesture, before asynchronous decoding.
    const resume = context.state === 'running' ? Promise.resolve() : context.resume();
    if (!loading) {
      loading = Promise.all(['sip','paper','music','fire','wind'].map(name =>
        decode(name).catch(error => { console.warn('Coffee audio:', name, error); })
      ));
    }
    return Promise.all([resume, loading]).then(() => context.state === 'running', () => false);
  }

  function cue(name, level) {
    if (!enabled || place !== 'cafe' || !context || context.state !== 'running' || !buffers.has(name)) return;
    const src = context.createBufferSource();
    src.buffer = buffers.get(name);
    const levelNode = gain(level, selection);
    src.connect(levelNode);
    src.addEventListener('ended', () => { src.disconnect(); levelNode.disconnect(); }, {once:true});
    src.start();
    return {src, gain:levelNode};
  }

  return {
    init,
    get on() { return enabled; },
    setOn(on) {
      enabled = !!on;
      if (master) fade(master, enabled ? .90 : 0, enabled ? .28 : .18);
    },
    setPlace(next) {
      if (next !== 'street' && next !== 'cafe') return;
      place = next;
      route();
    },
    sipCoffee() { return cue('sip', .93); },
    turnPage() { return cue('paper', .31); }
  };
})();
