// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  const depositBtn = document.getElementById('depositLPBtn');
  const withdrawBtn = document.getElementById('withdrawLPBtn');
  
  if (depositBtn && withdrawBtn) {
    depositBtn.addEventListener('click', depositLP);
    withdrawBtn.addEventListener('click', withdrawLP);
    
    // Auto-update balance if wallet connected
    if (window.ethereum?.selectedAddress) {
      updateLpBalance();
    }
  }
});

async function updateLpBalance() {
  if (!contract || !currentAccount) return;
  
  try {
    const balance = await contract.getLpBalance(currentAccount);
    document.getElementById('lpBalance').textContent = 
      `Your LP Balance: ${ethers.utils.formatEther(balance)} MONAD`;
  } catch (error) {
    console.error("Balance update error:", error);
  }
}

async function depositLP() {
  if (!contract || !currentAccount) {
    return log("Please connect wallet first");
  }

  const amount = document.getElementById('lpAmount').value.trim();

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return log("Invalid amount");
  }

  try {
    const depositBtn = document.getElementById('depositLPBtn');
    depositBtn.disabled = true;
    depositBtn.textContent = "Processing...";

    const tx = await contract.depositLP(ethers.utils.parseEther(amount));
    log(`Deposit TX: ${tx.hash}`);
    
    await tx.wait();
    log("Deposit successful!");
    updateLpBalance();
    
    document.getElementById('lpAmount').value = '';
    
  } catch (error) {
    log(`Deposit failed: ${error.message}`);
  } finally {
    const depositBtn = document.getElementById('depositLPBtn');
    if (depositBtn) {
      depositBtn.disabled = false;
      depositBtn.textContent = "Deposit";
    }
  }
}

async function withdrawLP() {
  if (!contract || !currentAccount) {
    return log("Please connect wallet first");
  }

  const amount = document.getElementById('lpAmount').value.trim();

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return log("Invalid amount");
  }

  try {
    const withdrawBtn = document.getElementById('withdrawLPBtn');
    withdrawBtn.disabled = true;
    withdrawBtn.textContent = "Processing...";

    const tx = await contract.withdrawLP(ethers.utils.parseEther(amount));
    log(`Withdraw TX: ${tx.hash}`);
    
    await tx.wait();
    log("Withdrawal successful!");
    updateLpBalance();
    
    document.getElementById('lpAmount').value = '';
    
  } catch (error) {
    log(`Withdraw failed: ${error.message}`);
  } finally {
    const withdrawBtn = document.getElementById('withdrawLPBtn');
    if (withdrawBtn) {
      withdrawBtn.disabled = false;
      withdrawBtn.textContent = "Withdraw";
    }
  }
}