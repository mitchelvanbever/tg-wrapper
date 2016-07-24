/**
 * TG Wrapper
 * vysheng's tg wrapper for Node.JS
 *
 * @author          Ehsaan (hello@ehsaan.me)
 */
'use strict';
const cliWrapper = require( './cli_wrapper' ),
      apiConn = require( './lib/apiConn' );

class Tg {
    /**
     * Init wrapper
     *
     * @param           {string} tg_path - Path to vysheng's tg binary file telegram-cli
     * @param           {string} pub_key - Path to public server key.
     */
    constructor( tg_path, pub_key ) {
        this.socket = null;
        this.connection = null;
        this.cli = new cliWrapper( tg_path, pub_key );
    }

    /**
     * Connects to CLI wrapper and API model.
     *
     * @param             {function} cb - Callback when wrapper is connected.
     */
    connect( cb ) {
        if ( this.cli.isRunning() )
            throw new Error( 'tg is already running' );

        this.cli.start( function( socket ) {
            this.connection = new apiConn( socket );
            this.socket = socket;

            // Make tg print all messages to our instance.
            this.socket.writeLine( 'main_session' );

            cb( this.connection );
        }.bind( this ) );
    }

    /**
     * Disconnect from CLI wrapper.
     */
    disconnect() {
        this.cli.stop();
        if ( this.connection ) {
            this.connection.close();
            this.connection = null;
        }
    }
}
module.exports = Tg;
