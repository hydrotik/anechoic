(() => {

    window.addEventListener('DOMContentLoaded', (event) => {
        console.log('Loading Example 1');

        const playButton = document.querySelector('#play-button');

        const anechoic = new Anechoic({});
        anechoic.getLooper().on('onLoopComplete', (params) => {
            console.warn('loopComplete');
            console.warn(params);
        });
        anechoic.getLooper().on('onResumed', (params) => {
            console.warn('onResumed');
            console.warn(params);
        });
        anechoic.getLooper().loopAudio(
            [
                '../audio-files/djdonovan-eclipse-loop-1.wav',
                '../audio-files/djdonovan-eclipse-loop-2.wav',
                '../audio-files/djdonovan-eclipse-loop-3.wav',
            ],
            [
                8,
                4,
                4
            ], playButton);
    });

})();