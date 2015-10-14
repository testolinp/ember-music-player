import Ember from 'ember';
import layout from '../templates/components/music-player';

export default Ember.Component.extend({
  layout: layout,
  volume: 15,

  isPlaying: false,

  playing: {
    title: '',
    artist: '',
    cover: ''
  },

  current_song: null,

  handleMeta( song ) {
    let current_song = this.get('current_song');

    this.set('playing.title', song.title);
    this.set('playing.artist', song.artist);
    this.set('playing.cover', song.cover);

    current_song.addEventListener('timeupdate', () => {
      let time = parseInt(current_song.currentTime, 10);

      this.set('current_time', time);
    });
  },

  cleanMeta() {
    this.set('playing.title', '');
    this.set('playing.artist', '');
    this.set('playing.cover', '');

    this.set('current_time', 0);
  },

  stopCurrentSong() {
    let current_song = this.get('current_song');

    if ( current_song && !current_song.paused ) {
      current_song.pause();
      current_song.currentTime = 0;
    }
  },

  handleVolume: Ember.observer('volume', function() {
    let volume = this.get('volume') / 100;

    this.get('current_song').volume = volume;
  }),

  handlePlaylist( song ) {
    let current_song = this.get('current_song');
    const playlist   = this.get('playlist');

    current_song.addEventListener('ended', () => {
      let current_index = playlist.findIndex( (item) => {
        return item.title === song.title;
      });

      let next_index = playlist[current_index + 1];

      if ( next_index ) {

        this.send('playAudio', next_index);

      } else {

        this.send('stopAudio');
        this.cleanMeta();

      }


    });
  },

  playlistUpdate: Ember.observer('playlist', function() {
    this.send('playAudio');
  }),

  actions: {
    playAudio( audio ) {
      let song = audio;

      this.stopCurrentSong();

      if ( !audio ) {
        song = this.get('playlist')[0];
      }

      //this.set('current_song', new Audio('data/' + song.file.mp3));
      this.set('current_song', new Audio(song.file.mp3));

      const current_song = this.get('current_song');

      this.handleVolume();
      this.handlePlaylist( song );
      this.handleMeta( song );

      current_song.play();

      current_song.addEventListener('loadedmetadata', () => {
        this.set('timeDuration', Math.round(current_song.duration));
        console.log(current_song.duration);
      });

    },

    pauseAudio() {
      let current_song = this.get('current_song');

      if ( current_song && !current_song.paused ) {
        current_song.pause();
      } else if ( current_song ){
        current_song.play();
      }

    },

    stopAudio() {
      this.stopCurrentSong();
      this.set('isPlaying', false);
    }
  }
});
