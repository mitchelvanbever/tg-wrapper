/**
 * This very simple example sends a message to whoever contacts the account
 * in past 10 minutes.
 */

const options = {
  'tg_binary':        '/path/to/bin/telegram-cli',
  'server_key':       '/path/to/server.pub'
};

const Tg_Wrapper = require( '../' ),
      fs = require( 'fs' ),
      cli = new Tg_Wrapper( options.tg_binary, options.server_key );

var times = require( './times.json' ).users;

/* Connects to wrapper */
cli.connect( ( api ) => {
  /* api is an instance of apiConn */
  api.on( 'message', ( message ) => {
    /* A message is sent/received */
    if ( message.type != 'outgoing' ) return; // Ignore all message except for received ones.

    if ( ! times[ message.peer ] ) // No time saved for this peer.
      times[ message.peer ] = Date.now();
    else {
      if ( times[ message.peer ] + ( 10 * 60 * 1000 ) < Date.now() ) // If that was more than 10 minutes ago.
        times[ message.peer ] = Date.now(); // Reset the time.
      else
        return; // Ignore sending the message.
    }

    fs.writeFileSync( './times.json', JSON.stringify( { users: times } ) ); // Save the times.
    api.send( message.peer, `Thank you for contacting me. I'll be in touch with you soon.` ); // Send a message to the peer.
    // Note that spaces will be replaced with _ automatically.
  } );
} );
