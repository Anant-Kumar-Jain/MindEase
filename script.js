let provider;
let signer;

// --- Contract Configuration ---
// TODO: Replace with your contract's address and ABI
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
const contractABI = [
    // A minimal ABI for a mint function. Replace with your actual ABI.
    "function safeMint(address to, string memory uri)"
];

/**
 * Handles switching between different pages of the single-page application.
 * @param {string} pageId The ID of the page element to display.
 */
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

/**
 * Updates the UI elements related to the wallet connection status.
 * @param {string} address The user's wallet address.
 */
function updateWalletStatus(address) {
    const walletStatusEl = document.getElementById('wallet-status');
    const connectButtons = document.querySelectorAll('button.btn');

    if (address) {
        // Update status on profile page
        if (walletStatusEl) {
            walletStatusEl.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            walletStatusEl.classList.remove('wallet-disconnected');
            walletStatusEl.classList.add('wallet-connected');
        }
        // Update connect buttons text
        connectButtons.forEach(btn => {
            if (btn.textContent.includes('Connect Wallet')) {
                btn.textContent = 'Wallet Connected';
                btn.disabled = true;
            }
        });
    } else {
        // Reset UI if disconnected
        if (walletStatusEl) {
            walletStatusEl.textContent = 'Wallet not connected';
            walletStatusEl.classList.remove('wallet-connected');
            walletStatusEl.classList.add('wallet-disconnected');
        }
        connectButtons.forEach(btn => {
            if (btn.textContent.includes('Wallet Connected')) {
                btn.textContent = 'Connect Wallet to Get Started';
                btn.disabled = false;
            }
        });
    }
}

/**
 * Connects to the user's Ethereum wallet (e.g., MetaMask).
 */
async function connectWallet() {
    // Check if MetaMask (or another wallet) is installed
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Use ethers.js to wrap the browser's provider
            provider = new ethers.providers.Web3Provider(window.ethereum);

            // Request account access
            await provider.send("eth_requestAccounts", []);

            // Get the signer (the user's account)
            signer = provider.getSigner();
            const address = await signer.getAddress();

            console.log("Account connected:", address);
            updateWalletStatus(address);

        } catch (error) {
            console.error("User rejected connection:", error);
            alert("You rejected the connection request. Please connect your wallet to continue.");
        }
    } else {
        console.error("MetaMask is not installed!");
        alert("Please install MetaMask to use this feature.");
    }
}

// Listen for account changes in MetaMask
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            console.log(`Account changed to: ${accounts[0]}`);
            // Re-run connection logic to update signer and UI
            connectWallet();
        } else {
            console.log('Account disconnected.');
            signer = null;
            updateWalletStatus(null);
        }
    });
}

/**
 * Calls the smart contract to mint a new "Healing Badge" NFT.
 */
async function mintBadge() {
    if (!signer) {
        alert("Please connect your wallet first to mint a badge.");
        return;
    }

    try {
        // Create a contract instance
        const badgeContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Get the user's address
        const userAddress = await signer.getAddress();

        // Define the metadata for the NFT. In a real app, this would be a URL to a JSON file.
        const tokenURI = "ipfs://bafkreih2y7h2z4lpj4bdg3i4g5v5l3p6z5qj3d7y2w6f4z6c4x5e6a7b8i"; // Example IPFS URI

        console.log(`Minting badge for ${userAddress}...`);
        alert("Please approve the transaction in your wallet to mint your badge.");

        // Call the 'safeMint' function on the contract
        const tx = await badgeContract.safeMint(userAddress, tokenURI);

        // Wait for the transaction to be mined
        await tx.wait();

        alert(`Congratulations! You've successfully minted your 'First Step' badge. Transaction hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error minting badge:", error);
        alert("An error occurred while minting the badge. Please check the console for details.");
    }
}

// --- Placeholder functions for other features ---

function handleLogin() { console.log("Login attempt"); }
function handleSignup() { console.log("Signup attempt"); }
function showSignup() { document.getElementById('login-form').style.display = 'none'; document.getElementById('signup-form').style.display = 'block'; }
function showLogin() { document.getElementById('signup-form').style.display = 'none'; document.getElementById('login-form').style.display = 'block'; }
function updatePassword() { console.log("Updating password"); }
function saveNotes() { console.log("Saving notes"); }
function sendMessage() { console.log("Sending message"); }
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}