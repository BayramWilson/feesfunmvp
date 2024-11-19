import { NextRequest, NextResponse } from 'next/server';

const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const RAYDIUM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
      // Wait longer between each retry
      await sleep(1000 * (i + 1));
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

async function getProgramFees(walletAddress: string, requestOptions: any) {
  const url = `https://pro-api.solscan.io/v2.0/account/transactions?address=${walletAddress}&limit=40`;
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    throw new Error(`Solscan API error: ${response.status}`);
  }

  const data = await response.json();
  let feesPaidToPrograms = 0;

  for (const tx of data.data) {
    const txDetailsUrl = `https://pro-api.solscan.io/v2.0/transaction/detail?tx=${tx.tx_hash}`;
    const txResponse = await fetch(txDetailsUrl, requestOptions);
    
    if (!txResponse.ok) continue;

    const txData = await txResponse.json();
    if (!txData.success || !txData.data?.data) continue;

    if (txData.data.data.programs_involved?.includes(PUMP_FUN_PROGRAM_ID) || 
        txData.data.data.programs_involved?.includes(RAYDIUM_PROGRAM_ID)) {
      const solChange = txData.data.data.sol_bal_change?.reduce((sum: number, change: any) => {
        if (change.address === walletAddress && change.change_amount < 0) {
          return sum + Math.abs(Number(change.change_amount));
        }
        return sum;
      }, 0);

      if (solChange) {
        feesPaidToPrograms += solChange;
      }
    }
  }

  return feesPaidToPrograms;
}

async function getTransferAnalysis(walletAddress: string, requestOptions: any) {
  const url = `https://pro-api.solscan.io/v2.0/account/transactions?address=${walletAddress}&limit=40`;
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    throw new Error(`Solscan API error: ${response.status}`);
  }

  const data = await response.json();
  let transactionAnalysis = [];

  for (const tx of data.data) {
    const txDetailsUrl = `https://pro-api.solscan.io/v2.0/transaction/actions?tx=${tx.tx_hash}`;
    const txResponse = await fetch(txDetailsUrl, requestOptions);
    
    if (!txResponse.ok) continue;

    const txData = await txResponse.json();
    if (!txData.success || !txData.data) continue;

    const transfers = txData.data.sol_bal_change
      ?.filter((change: any) => 
        change.address === walletAddress && 
        change.change_amount < 0
      )
      .map((change: any) => Math.abs(Number(change.change_amount)))
      .sort((a: number, b: number) => b - a);

    if (transfers?.length > 1) {
      const smallerAmountsTotal = transfers.slice(1).reduce((sum: number, amount: number) => sum + amount, 0);
      transactionAnalysis.push({
        txHash: tx.tx_hash,
        smallerAmountsTotal
      });
    }
  }

  return transactionAnalysis;
}

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');
  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  if (!process.env.SOLSCAN_TOKEN) {
    return NextResponse.json({ error: 'SOLSCAN_TOKEN not configured' }, { status: 500 });
  }

  const requestOptions = {
    headers: {
      'token': process.env.SOLSCAN_TOKEN,
      'Accept': 'application/json'
    }
  };

  try {
    const listUrl = `https://pro-api.solscan.io/v2.0/account/transactions?address=${walletAddress}&limit=40`;
    console.log('\n🔍 Fetching transactions for wallet:', walletAddress);
    
    const listResponse = await fetch(listUrl, requestOptions);
    if (!listResponse.ok) {
      throw new Error(`Transaction list fetch failed: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    if (!listData.success || !listData.data) {
      throw new Error('Invalid transaction list response');
    }

    let feesPaidToPrograms = 0;
    let transactionAnalysis = [];

    console.log(`\n📋 Found ${listData.data.length} transactions to analyze\n`);

    for (const tx of listData.data) {
      try {
        const detailUrl = `https://pro-api.solscan.io/v2.0/transaction/detail?tx=${tx.tx_hash}`;
        console.log(`\n🔄 Processing transaction: ${tx.tx_hash}`);
        
        await sleep(200);

        const txData = await fetchWithRetry(detailUrl, requestOptions);
        
        if (!txData.success || !txData.data) continue;

        const txDetails = txData.data;
        
        // Log transaction details
        console.log(`📅 Time: ${new Date(txDetails.block_time * 1000).toLocaleString()}`);
        console.log(`🔧 Programs: ${txDetails.programs_involved?.join(', ') || 'none'}`);

        // Check for program involvement
        const isPumpFunTx = txDetails.programs_involved?.includes(PUMP_FUN_PROGRAM_ID);
        const isRaydiumTx = txDetails.programs_involved?.includes(RAYDIUM_PROGRAM_ID);

        if (isPumpFunTx || isRaydiumTx) {
          console.log('\n🎯 Found target program transaction:', {
            isPumpFun: isPumpFunTx,
            isRaydium: isRaydiumTx
          });

          // Debug log the SOL balance changes
          console.log('\n💰 SOL Balance Changes:', 
            txDetails.sol_bal_change?.map((change: any) => ({
              address: change.address,
              amount: change.change_amount,
              isWallet: change.address === walletAddress
            }))
          );

          // Find all SOL changes for our wallet (both positive and negative)
          const solChanges = txDetails.sol_bal_change
            ?.filter((change: any) => change.address === walletAddress)
            .map((change: any) => Number(change.change_amount));

          if (solChanges?.length > 0) {
            // Calculate net change
            const netChange = solChanges.reduce((sum: number, amount: number) => sum + amount, 0);
            
            if (netChange < 0) {
              // If net change is negative, it's a fee
              const fee = Math.abs(netChange);
              console.log('\n💸 Program Transaction Changes:');
              console.log(`Net Change: ${(netChange / 1e9).toFixed(6)} SOL`);
              
              feesPaidToPrograms += fee;
              console.log(`💰 Total fees in this transaction: ${(fee / 1e9).toFixed(6)} SOL`);
            } else {
              console.log('\n💰 No fees in this transaction (net positive change)');
            }
          } else {
            console.log('❌ No SOL changes found for wallet');
          }
        }

        // Bot fee analysis
        const allTransfers = txDetails.parsed_instructions
          ?.filter((ins: any) => 
            ins.program === "spl-token" && 
            ins.parsed_type === "transfer" &&
            ins.transfers?.some((t: any) => 
              t.token_address === "So11111111111111111111111111111111111111112" &&
              t.source_owner === walletAddress
            )
          )
          .flatMap((ins: any) => 
            ins.transfers.filter((t: any) => 
              t.token_address === "So11111111111111111111111111111111111111112" &&
              t.source_owner === walletAddress
            )
          )
          .map((t: any) => Number(t.amount))
          .sort((a: number, b: number) => b - a);

        if (allTransfers?.length > 1) {
          const largestTransfer = allTransfers[0];
          const smallerTransfers = allTransfers.slice(1);
          const smallerAmountsTotal = smallerTransfers.reduce((sum: number, amount: number) => sum + amount, 0);

          console.log('\n🔍 Bot Fee Analysis:');
          console.log(`Main Transfer: ${(largestTransfer / 1e9).toFixed(6)} SOL`);
          console.log(`Smaller Transfers: ${smallerTransfers.map((t: number) => (t / 1e9).toFixed(6)).join(', ')} SOL`);
          console.log(`Total Bot Fees: ${(smallerAmountsTotal / 1e9).toFixed(6)} SOL`);

          transactionAnalysis.push({
            txHash: tx.tx_hash,
            timestamp: txDetails.block_time,
            mainTransfer: largestTransfer,
            smallerAmountsTotal,
            smallerTransfers
          });
        }

      } catch (txError) {
        console.error(`❌ Error processing transaction ${tx.tx_hash}:`, txError);
        continue;
      }
    }

    console.log('\n📊 Analysis Summary:');
    console.log(`Total Program Fees: ${(feesPaidToPrograms / 1e9).toFixed(6)} SOL`);
    console.log(`Total Bot Fees: ${(transactionAnalysis.reduce((sum, tx) => sum + tx.smallerAmountsTotal, 0) / 1e9).toFixed(6)} SOL`);

    return NextResponse.json({
      walletAddress,
      feesPaidToPrograms,
      transactionAnalysis
    });

  } catch (error) {
    console.error('Error in solscan route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 });
  }
}
