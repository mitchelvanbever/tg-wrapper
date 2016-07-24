/**
 * Socket wrapper, provides reading and writing to process.
 *
 * @author              Ehsaan (hello@ehsaan.me)
 */
const debug = require( 'debug' )( 'tg' );
const EventEmitter = require( 'events' );

class SocketWrapper extends EventEmitter {
    /**
     * @param           {object} socket - Socket object.
     * @param           {object} options - Options for API. lineDelimiter and encoding are supported.
     */
    constructor( socket, options ) {
        super();
        this.socket = socket;
        options = options || {};
        this.lineDelimiter = options.lineDelimiter || '\n';
        this.encoding = options.encoding || 'utf8';
        this.init();
    }

    /**
     * Initializes the reading and writing events/mthods.
     */
    init() {
        this.buffer = '';
        this.socket.setEncoding( this.encoding );
        this.socket.on( 'data', function( data ) {
            this.buffer += data;
            var i;
            while( ( i = this.buffer.indexOf( this.lineDelimiter ) ) != -1 ) {
                var line = this.buffer.substr( 0, i );
                if ( line ) {
                    this.emit( 'line', line );
                    debug( 'Line emitted: ' + line );
                }
                this.buffer = this.buffer.substr( i + 1 );
            }
        }.bind( this ) );

        this.socket.on( 'error', function( e ) {
            this.emit( 'error', e );
            debug( 'Error: ' + e );
        }.bind( this ) );

        this.socket.on( 'close', function() {
            this.emit( 'close' );
        }.bind( this ) );
    }

    /**
     * Disconnect the socket.
     */
    end() {
        if ( this.socket ) {
            this.socket.end();
        }
    }

    /**
     * Write the given line in the process.
     * @param           {string} line - Line of command
     */
    writeLine( line ) {
        this.socket.write( `${line}\n` );
    }
}
module.exports = SocketWrapper;
