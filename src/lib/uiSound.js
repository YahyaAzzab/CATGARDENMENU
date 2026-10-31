const files = {
    meow: '/maison/meow.wav',
    boutique: '/maison/boutique.wav',
};
let ctx = null;
const buffers = new Map();
let loading = null;
function audioContext() {
    if (!ctx)
        ctx = new AudioContext({ latencyHint: 'interactive' });
    return ctx;
}
export function preloadUiSounds() {
    if (loading)
        return loading;
    const context = audioContext();
    loading = Promise.all(Object.keys(files).map(async (name) => {
        const response = await fetch(files[name]);
        const data = await response.arrayBuffer();
        buffers.set(name, await context.decodeAudioData(data));
    })).then(() => undefined).catch(() => undefined);
    return loading;
}
export function playUiSound(name) {
    const context = audioContext();
    if (context.state === 'suspended')
        void context.resume();
    const buffer = buffers.get(name);
    if (!buffer) {
        void preloadUiSounds()?.then(() => {
            if (buffers.get(name))
                playUiSound(name);
        });
        return;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = 1;
    source.connect(gain);
    gain.connect(context.destination);
    source.start();
}
/** Joue tout de suite, puis quitte la page une fois le son lancé. */
export function playUiSoundThenGo(event, name) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
    event.preventDefault();
    playUiSound(name);
    const href = event.currentTarget.href;
    window.setTimeout(() => window.location.assign(href), 160);
}
