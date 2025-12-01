const ethers = require('ethers');

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
  const address = '0x13C0D2D0111F0505D3Ee7DBD6aCba0d9F581fFC6';
  
  try {
    const balance = await provider.getBalance(address);
    const balanceInMatic = ethers.formatEther(balance);
    
    console.log(`\n📋 Wallet Address: ${address}`);
    console.log(`💰 Amoy Balance: ${balanceInMatic} MATIC\n`);
    
    if (parseFloat(balanceInMatic) > 0) {
      console.log('✅ MATIC 수령 확인됨! 배포 준비 완료');
    } else {
      console.log('⏳ MATIC 수령 대기 중... 1-5분 후 다시 확인해주세요');
    }
  } catch (error) {
    console.error('❌ 잔액 조회 실패:', error.message);
  }
}

checkBalance();
