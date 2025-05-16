let provider, signer, contract;
let currentAccount = null;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
  
  // Auto-connect if wallet is already connected
  if (window.ethereum?.selectedAddress) {
    connectWallet();
  }
});

async function connectWallet() {
  try {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask!");
    }
    else {
  console.log("MetaMask detected");
    }

    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = accounts[0];
    
    // Initialize provider and signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    // Initialize contract
    contract = new ethers.Contract(CONFIG.contractAddress, CONFIG.contractABI, signer);
    
    // Update UI
    updateWalletUI();
    await checkNetwork();
    setupEventListeners();
    
    log("Wallet connected: " + shortenAddress(currentAccount));
    
  } catch (error) {
    log("Connection error: " + error.message);
    console.error(error);
  }
}

function updateWalletUI() {
  const walletStatus = document.getElementById('walletStatus');
  const connectBtn = document.getElementById('connectWalletBtn');
  
  walletStatus.textContent = `Connected: ${shortenAddress(currentAccount)}`;
  walletStatus.style.display = 'block';
  connectBtn.textContent = 'Connected';
  connectBtn.disabled = true;
}

async function checkNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log("Current Chain ID:", parseInt(chainId));

    // Jika network tidak sesuai dengan Monad Testnet (ID: 10143)
    if (parseInt(chainId) !== CONFIG.chainId) {
      alert("⚠️ Please switch to the Monad Testnet (Chain ID: 10143)");
      // Uncomment the following line to allow automatic network switching
      // await switchNetwork();
    }
  } catch (error) {
    console.error("Error checking network:", error);
  }
}

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [CONFIG]
    });
  } catch (error) {
    console.error("Error adding network:", error);
  }
}

function setupEventListeners() {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      currentAccount = accounts[0];
      updateWalletUI();
      log("Account changed");
    }
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}

function handleDisconnect() {
  currentAccount = null;
  document.getElementById('walletStatus').style.display = 'none';
  document.getElementById('connectWalletBtn').textContent = 'Connect Wallet';
  document.getElementById('connectWalletBtn').disabled = false;
  log("Wallet disconnected");
}

// Shortens the wallet address for display (e.g., 0x1234...abcd)
function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Log function to display information in the UI
function log(message) {
  const logElement = document.getElementById('log');
  logElement.textContent = message;
}
