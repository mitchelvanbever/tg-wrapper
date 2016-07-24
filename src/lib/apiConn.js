/**
 * API connection for wrapper.
 *
 * @author          Ehsaan (hello@ehsaan.me)
 */
const EventEmitter = require( 'events' ),
      debug = require( 'debug' )( 'tg' ),
      msgParser = require( './msgParser' );

class apiConnection extends EventEmitter {
    /**
     * Connects to socket and tries to read and write.
     *
     * @param         {object} socket - Socket object.
     */
    constructor( socket ) {
        super();
        this.socket = socket;
        this._registerEvents();
        this.open = true;
    }

    /**
     * Send a regular message to given peer.
     *
     * @param         {string} peer - Peer name
     * @param         {string} message - Message text
     */
    send( peer, message ) {
        this._executeCmd( 'msg', peer.replace( /\ /, '_' ), message ); // Filters the peer.
    }

    /**
     * Send a photo to given peer.
     *
     * @param         {string} peer - Peer name
     * @param         {string} path - Path to photo
     */
    sendPhoto( peer, path ) {
        this._executeCmd( 'send_photo', peer.replace( /\ /, '_' ), `"${path}"` );
    }

    /**
     * Send a photo to given peer.
     *
     * @param         {string} peer - Peer name
     * @param         {string} path - Path to photo
     */
    sendDocument( peer, path ) {
        this._executeCmd( 'send_document', peer.replace( /\ /, '_' ), `${path}` );
    }

    /**
     * Executes given commands.
     */
    _executeCmd() {
        if ( this.open ) {
            var args = Array.prototype.slice.call( arguments ),
                cmd = args.join( ' ' );

            debug( 'executing command: ' + cmd );
            this.socket.writeLine( cmd );
        } else {
            throw new Error( 'API connection closed' );
        }
    }

    /**
     * Close the connection.
     */
    close() {
        if ( this.open ) {
            this.open = false;
            this.socket.end();
        }
    }

    /**
     * Register events for emitter.
     */
    _registerEvents() {
        var _emitter = this;
        this.socket.on( 'line', function( line ) {
            var message = msgParser( line );
            if ( message )
                this.emit( 'message', message );
        }.bind( this ) );

        this.socket.on( 'error', function( e ) {
            this.emit( 'error', e );
        }.bind( this ) );

        this.socket.on( 'close', function() {
            this.emit( 'disconnect' );
        }.bind( this ) );
    }
}
module.exports = apiConnection;
