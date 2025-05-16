// Logging utility
function log(message) {
  const logElement = document.getElementById('log');
  if (!logElement) return;
  
  const timestamp = new Date().toLocaleTimeString();
  logElement.innerHTML += `[${timestamp}] ${message}\n`;
  logElement.scrollTop = logElement.scrollHeight;
}

// Address shortener
function shortenAddress(address) {
  return address ? `${address.substring(0, 6)}...${address.substring(38)}` : '';
}

// Error handler
function handleError(error) {
  console.error(error);
  log(error.message || "An error occurred");
  return null;
}

// Check if element exists
function elementExists(id) {
  return !!document.getElementById(id);
}