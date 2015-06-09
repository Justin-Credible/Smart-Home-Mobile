
/**
 * Global application state for the Chrome Extension.
 * 
 * This is a transient, in-memory only variable that
 * does not persist between sessions.
 */
var state = {
	
	/**
	 * The user's security passphrase.
	 * 
	 * Used to encrypt the AlertMe API password so it isn't stored in cleartext
	 * in local storage. The user must enter their passphrase at least once so
	 * it will be available.
	 */
	passphrase: null
};