import Ember from 'ember';
import layout from '../templates/components/music-player';

export default Ember.Component.extend({
  layout: layout,
  volume: 15,

  pausePlayer: false,

  isLoaded: false,
  isPlaying: false,
  isOpen: false,
  volumeRange: false,
  pauseOnInit: false,
  timeDuration: '0:00',
  timeProgress: 0,
  typeClass: '',

  playing: {
    title: '',
    artist: '',
    cover: ''
  },

  current_song: null,

  initialize: Ember.on('init', function() {
    this.set('current_time', '0:00');

    if (this.$('#audioPlayerLoader')) {
        this.$('#audioPlayerLoader').hide();
    }
  }),

  handleMeta( song, timeLong ) {
    // let current_song = this.get('current_song');
    let current_song = this.get('player');

    this.set('playing.title', song.title);
    this.set('playing.artist', song.artist);
    this.set('playing.cover', song.cover);

    current_song.addEventListener('timeupdate', () => {
      let time = parseInt(current_song.currentTime, 10);
      let progress = ((time * 100) / timeLong).toFixed(1);
      moment.duration.fn.format.defaults.minutes = /n+/;
      let current_time = moment.duration(time, "seconds").format("hh:n:ss");
      if (current_time.length === 2) {
        current_time = '0:' + current_time;
      }
      this.set('current_time', current_time);
      this.set('timeProgress', progress);
    });

  },

  cleanMeta() {
    this.set('playing.title', '');
    this.set('playing.artist', '');
    this.set('playing.cover', '');
    this.set('current_time', '0:00');
  },

  stopCurrentSong() {
    // let current_song = this.get('current_song');
    let current_song = this.get('player');

    if ( current_song && !current_song.paused ) {
      current_song.pause();
      current_song.src = '';
      current_song.currentTime = 0;
      this.set('current_time', '0:00');
    }
  },

  handleVolume: Ember.observer('volume', function() {
    let volume = this.get('volume') / 100;

    // this.get('current_song').volume = volume;
    this.get('player').volume = volume;
  }),


  handleLoadedState: Ember.observer('isLoaded', function() {
  }),

  handleExternalPause: Ember.observer('pausePlayer', function() {
    if (this.get('pausePlayer')) {
      this.send('pauseAudio');
    }
  }),

  handlePlaylist( song ) {
    let current_song = this.get('player');
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

  playlistUpdate: Ember.observer('playlist', function(a) {
    //avoiding duplicate execution
    if(a.__nextSuper !== undefined && !this.get('isLoaded')) {
      this.send('playAudio');
    }
  }),

  actions: {
    playerOpen() {
      this.set('isOpen', true);
    },

    playerClose() {
      this.set('isOpen', false);
    },

    playAudio( audio ) {

      if (this.get('playlist').length || !!audio) {

        let song = audio;
        let pauseOnInit = this.get('pauseOnInit');

        if ( !audio ) {
          song = this.get('playlist')[0];
        }

        this.stopCurrentSong();

        if (this.$('#audioPlayerLoader')) {
            this.$('#audioPlayerLoader').show();
        }

        if (song) {
          this.set('current_song', song.file.mp3);
          this.set('isLoaded', true);

          if (this.$('#audioPlayer')) {

              const $player = this.$('#audioPlayer')[0]; //this.get('current_song');
              $player.src = this.get('current_song');

              this.set('player', $player);

              this.handleVolume();
              this.handlePlaylist( song );

              if(pauseOnInit) {
                this.set('current_time', '0:00');
                $player.pause();
                this.set('isPlaying', false);
                this.set('pauseOnInit', true);
              }else {
                $player.play();
                this.set('isPlaying', true);
              }

              let parentController = this.get('targetObject');
              parentController.send('playingAudio', this.get('isPlaying'));

              $player.addEventListener('loadedmetadata', () => {
                this.$('#audioPlayerLoader').hide();
                moment.duration.fn.format.defaults.minutes = /n+/;
                let timeLong = $player.duration;
                this.handleMeta( song, timeLong);
                this.set('timeDuration', moment.duration(timeLong, "seconds").format("n:ss"));
              });
          }
        }

      }
    },

    pauseAudio() {
      const $player = this.get('player');

      if ( $player && !$player.paused ) {
        $player.pause();
        this.set('isPlaying', false);
      } else {
        $player.play();
        this.set('isPlaying', true);
      }

      let parentController = this.get('targetObject');
      parentController.send('playingAudio', this.get('isPlaying'));

    },

    stopAudio() {
      this.stopCurrentSong();
      this.set('isPlaying', false);

      let parentController = this.get('targetObject');
      parentController.send('playingAudio', this.get('isPlaying'));
    },

    prevSong() {
      let current_song = this.get('current_song');
      const playlist   = this.get('playlist');

      let current_index = playlist.findIndex( (item) => {
        return item.file.mp3 === current_song;
      });

      this.send('stopAudio');

      let next_index = current_index - 1;

      if (next_index === -1) {
        next_index = playlist.length -1;
      }

      let next_song = playlist[next_index];

      if ( next_song ) {
        this.send('playAudio', next_song);
      } else {
        this.send('stopAudio');
        this.cleanMeta();
      }
    },

    nextSong() {
      let current_song = this.get('current_song');
      const playlist   = this.get('playlist');

      let current_index = playlist.findIndex( (item) => {
        return item.file.mp3 === current_song;
      });

      this.send('stopAudio');

      let next_index = current_index + 1;

      if (next_index === playlist.length) {
        next_index = 0;
      }

      let next_song = playlist[next_index];

      if ( next_song ) {
        this.send('playAudio', next_song);
      } else {
        this.send('stopAudio');
        this.cleanMeta();
      }

    },

    showVolume() {
      this.set('volumeRange', !this.get('volumeRange'));
    }
  }
});
