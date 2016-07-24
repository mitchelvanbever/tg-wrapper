/**
 * CLI wrapper
 * Inspired from tincann/telegram-cli-wrapper
 *
 * @author            Ehsaan (hello@ehsaan.me)
 */
'use strict';
const debug = require( 'debug' )( 'tg' ),
	  net = require( 'net' ),
	  spawn = require( 'child_process' ).spawn,
	  SocketWrapper = require( './lib/socketWrapper' );

class TgWrapper {
	/**
	 * Constructs the class
	 * @param 			{string} tg_path - Determines vysheng's tg binary path
	 * @param 			{string} pub_key - Path to public key that is used by vysheng's tg.
	 */
	constructor( tg_path, pub_key ) {
		this.childInstance = null;
		this.socket = null;
		this.tg_path = tg_path;
		this.pub_key = pub_key;
	}

	/**
	 * Starts the child process and bind the parent to child events.
	 *
	 * @param				{function} cb - Callback after function started successfully.
	 */
	start( cb ) {
		if ( this.childInstance )
			throw new Error( "Can't start another process, it's running already." );

		var socket_path = `${__dirname}/socket${Date.now()}`;
		debug( `Starting child process, located at ${this.tg_path}` );
		this.childInstance = spawn( this.tg_path, [ '-k', this.pub_key, '-S', socket_path ] );

		// Bind child processes
		this.childInstance.on( 'error', ( e ) => { console.log( e ) } );
		this.childInstance.on( 'exit', function() {
			this.stop();
		}.bind( this ) );

		// Setup stdout
		this.childInstance.stdout.setEncoding( 'utf8' );
		this.childInstance.stdout.once( 'data', ( data ) => {
			data = data.replace( /\r|\n/g, '' ).trim();
			if ( /^Telegram-cli version/.test( data ) ) {
				this.socket = net.createConnection( socket_path, function() {
					cb( new SocketWrapper( this.socket ) );
				}.bind( this ) );
			}
		} );
	}

	/**
	 * @return 				{boolean} - True if child process is running
	 */
	isRunning() {
		return !! this.childInstance;
	}

	/**
	 * Stops the socket and child instance.
	 */
	stop() {
		if ( this.socket && this.socket.writable ) {
			this.socket.write( 'quit\n' );
		}
		if ( this.childInstance ) {
			this.childInstance = null;
		}
	}
}
module.exports = TgWrapper;
