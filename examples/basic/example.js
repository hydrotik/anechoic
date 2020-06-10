(() => {

    window.addEventListener('DOMContentLoaded', (event) => {
        console.log('Loading Example 1');

        const playButton = document.querySelector('#play-button');

        const anechoic = new Anechoic({});
        anechoic.getLooper().loopAudio('../audio-files/kai-illum-loop.wav', 5, playButton);
    });

})();