// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  const msgContent = document.getElementById('msgContent');
  const sendBtn = document.getElementById('sendMessageBtn');
  const getMessagesBtn = document.getElementById('getMessagesBtn');
  
  if (msgContent && sendBtn && getMessagesBtn) {
    msgContent.addEventListener('input', updateMessageFee);
    sendBtn.addEventListener('click', sendMessage);
    getMessagesBtn.addEventListener('click', getMessages);
  }
});

async function updateMessageFee() {
  if (!contract) return;
  
  try {
    const message = document.getElementById('msgContent').value;
    const gasPerChar = await contract.gasPerChar();
    const fee = gasPerChar.mul(message.length);
    
    document.getElementById('messageFee').textContent = 
      `Estimated fee: ${ethers.utils.formatEther(fee)} MONAD`;
  } catch (error) {
    console.error("Fee calculation error:", error);
  }
}

async function sendMessage() {
  if (!contract || !currentAccount) {
    return log("Please connect wallet first");
  }

  const toAddress = document.getElementById('toAddress').value;
  const message = document.getElementById('msgContent').value.trim();

  if (!ethers.utils.isAddress(toAddress)) {
    return log("Invalid recipient address");
  }

  if (!message) {
    return log("Message cannot be empty");
  }

  try {
    const sendBtn = document.getElementById('sendMessageBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";

    const gasPerChar = await contract.gasPerChar();
    const fee = gasPerChar.mul(message.length);

    const tx = await contract.sendMessage(toAddress, message, { value: fee });
    log(`Transaction sent: ${tx.hash}`);
    
    await tx.wait();
    log("Message sent successfully!");
    
    // Clear inputs
    document.getElementById('msgContent').value = '';
    document.getElementById('toAddress').value = '';
    updateMessageFee();
    
  } catch (error) {
    log(`Send failed: ${error.message}`);
  } finally {
    const sendBtn = document.getElementById('sendMessageBtn');
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send Message";
    }
  }
}

async function getMessages() {
  if (!contract) return log("Wallet not connected");

  const userAddress = document.getElementById('msgUser').value || currentAccount;

  if (!ethers.utils.isAddress(userAddress)) {
    return log("Invalid address");
  }

  try {
    const messages = await contract.getMessages(userAddress);
    displayMessages(messages);
    log(`Loaded ${messages.length} messages`);
  } catch (error) {
    log(`Load failed: ${error.message}`);
  }
}

function displayMessages(messages) {
  const container = document.getElementById('messagesList');
  if (!container) return;

  container.innerHTML = messages.length ? '' : '<p>No messages found</p>';

  messages.forEach((msg, i) => {
    const msgElement = document.createElement('div');
    msgElement.className = 'message';
    msgElement.innerHTML = `
      <p><strong>From:</strong> ${shortenAddress(msg.sender)}</p>
      <p><strong>To:</strong> ${shortenAddress(msg.receiver)}</p>
      <p>${msg.content}</p>
      <small>${new Date(msg.timestamp * 1000).toLocaleString()}</small>
      ${i < messages.length - 1 ? '<hr>' : ''}
    `;
    container.appendChild(msgElement);
  });
}