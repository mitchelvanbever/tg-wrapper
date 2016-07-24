var messageType = {
    '>>>':  'outgoing', // Outgoing message (messages you sent)
    '<<<':  'incoming', // Incoming message (messages you receive)
    '«««':  'incoming_history', // Incoming message in history and supergroups
    '»»»':  'outgoing_history' // Outgoing message in history and supergroups
};

/**
 * Parses a line that contains a message.
 *
 * @param         {string} string - Line string
 * @return        {object} - Message object
 */
module.exports = ( string ) => {
    var messagePattern = /^\[(.*?)\]\s{2}(.*?)\s(>>>|<<<|«««|»»»)\s(.+?)$/;
    var result = messagePattern.exec( string.trim() );
    if ( ! result ) return false;

    return {
        time:   result[1],
        peer:   result[2],
        type:   messageType[ result[3] ],
        body:   result[4]
    };
};
