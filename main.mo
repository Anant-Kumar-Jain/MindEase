import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Result "mo:base/Result";

/**
 * This is a backend canister for the MindEase dApp.
 * It runs on the Internet Computer blockchain.
 */
actor MindEaseBackend {
    // --- Types ---
    // A record to hold user profile information.
    public type UserProfile = {
        username: Text;
        email: Text;
    };

    // A custom error type for more expressive error handling.
    public type Error = {
        #AlreadyExists;
        #NotFound;
        #InvalidInput(Text);
    };

    // --- State ---
    // We use two Tries for efficient lookups. This is a common and scalable pattern.
    // 1. `profiles`: Maps a user's Principal (their unique ID) to their profile data.
    private stable var profiles = Trie.empty<Principal, UserProfile>();
    // 2. `principalsByEmail`: Maps a user's email to their Principal for quick existence checks.
    private stable var principalsByEmail = Trie.empty<Text, Principal>();

    /**
     * Creates a new user profile associated with the caller's Principal.
     * This is an 'update' call because it modifies the canister's state.
     * Returns the new user profile on success, or an Error on failure.
     */
    public shared (msg) func signup(username: Text, email: Text) : async Result.Result<UserProfile, Error> {
        let caller = msg.caller;

        // Input validation
        if (username == "" or email == "") {
            return #err(#InvalidInput("Username and email cannot be empty."));
        };

        // Check if the email or principal is already registered.
        if (principalsByEmail.get(email) != null) {
            return #err(#AlreadyExists);
        };
        if (profiles.get(caller) != null) {
            return #err(#AlreadyExists);
        };

        // Create and store the new user profile.
        let userProfile : UserProfile = { username; email };
        profiles.put(caller, userProfile);
        principalsByEmail.put(email, caller);

        return #ok(userProfile);
    };

    /**
     * A 'query' call that allows a logged-in user to retrieve their own profile.
     * Query calls are read-only and much faster than update calls.
     */
    public shared (msg) query func getSelf() : async Result.Result<UserProfile, Error> {
        let caller = msg.caller;
        return Result.fromOption(profiles.get(caller), #NotFound);
    };
}
