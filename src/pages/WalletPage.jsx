import { useState, useEffect, useRef } from 'react';
import { useDynamicContext, useEmbeddedReveal } from '@dynamic-labs/sdk-react-core';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { QRCodeSVG } from 'qrcode.react';
import { Connection, PublicKey, Transaction, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import { useTheme } from '../context/ThemeContext';

const presetAmounts = [1, 2, 5, 10, 25];
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';

async function fetchUsdcBalance(walletAddress) {
  try {
    console.log('Fetching USDC balance for wallet:', walletAddress);
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const ownerPubkey = new PublicKey(walletAddress);
    const usdcMintPubkey = new PublicKey(USDC_MINT);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPubkey, {
      mint: usdcMintPubkey,
    });
    console.log('Token accounts found:', tokenAccounts.value.length);
    if (tokenAccounts.value.length === 0) return 0;
    let total = 0;
    for (const acc of tokenAccounts.value) {
      total += acc.account.data.parsed.info.tokenAmount.uiAmount || 0;
    }
    console.log('USDC balance:', total);
    return total;
  } catch (error) {
    console.error('Error fetching USDC:', error);
    return 0;
  }
}

async function fetchSolBalance(walletAddress) {
  try {
    console.log('Fetching SOL balance for wallet:', walletAddress);
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const ownerPubkey = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(ownerPubkey);
    const solBalance = lamports / 1_000_000_000;
    console.log('SOL balance:', solBalance);
    return solBalance;
  } catch (error) {
    console.error('Error fetching SOL:', error);
    return 0;
  }
}

async function fetchTransactionHistory(walletAddress) {
  try {
    const apiKey = 'fc70f382-f7ec-48d3-a615-9bacd782570e';
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=10`;

    const response = await fetch(url);
    const transactions = await response.json();

    console.log('Transaction history:', transactions);

    // DFlow prediction market program IDs
    const DFLOW_PROGRAMS = [
      'DF1ow4tspfHX9JwWJsAb9epbkA8hmpSEAtxXy1V2YQI',
      'pReDicTmksnPfkfiz33ndSdbe2dY43KYPg4U2dbvHvo',
    ];

    // Transform to our format
    return transactions.map((tx, index) => {
      // Check if this is a DFlow/prediction market transaction
      // Check multiple possible locations for program IDs
      const allAccountKeys = tx.accountData?.map(acc => acc.account) || [];
      const instructionProgramIds = tx.instructions?.map(ix => ix.programId) || [];
      const allProgramIds = [...allAccountKeys, ...instructionProgramIds];

      // Also check the transaction description and source
      const description = (tx.description || '').toLowerCase();
      const source = (tx.source || '').toLowerCase();

      const isDFlowTx =
        allProgramIds.some(id => DFLOW_PROGRAMS.includes(id)) ||
        description.includes('swap') ||
        description.includes('dflow') ||
        source.includes('dflow') ||
        // Check if any token transfer involves outcome tokens (not USDC deposits)
        (tx.tokenTransfers?.length > 1 && tx.type === 'SWAP');

      // Determine if this is a deposit (USDC coming IN to wallet)
      const isDeposit = tx.tokenTransfers?.some(t =>
        t.toUserAccount === walletAddress &&
        t.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mint
      );

      // Determine if this is a withdrawal (USDC going OUT to external address, not a swap)
      const isWithdrawal = !isDFlowTx &&
        tx.tokenTransfers?.some(t =>
          t.fromUserAccount === walletAddress &&
          t.toUserAccount !== walletAddress &&
          t.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        );

      // Get transfer amount (prefer USDC transfers)
      const usdcTransfer = tx.tokenTransfers?.find(t =>
        t.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );
      const transfer = usdcTransfer || tx.tokenTransfers?.[0] || tx.nativeTransfers?.[0];
      const amount = transfer?.tokenAmount || (transfer?.amount / 1_000_000_000) || 0;

      // Determine transaction type with correct priority
      let type = 'bet'; // Default to bet for any outgoing USDC that's not a clear withdrawal
      if (isDeposit && !isDFlowTx) {
        type = 'deposit';
      } else if (isWithdrawal) {
        type = 'withdrawal';
      } else if (isDFlowTx || tx.type === 'SWAP') {
        type = 'bet';
      }

      return {
        id: tx.signature || index,
        type,
        amount: Math.abs(amount),
        date: new Date(tx.timestamp * 1000).toISOString().split('T')[0],
        status: 'completed',
        signature: tx.signature,
      };
    }).filter(tx => tx.amount > 0);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Modal Overlay Component
function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Deposit Modal
function DepositModal({ onClose, walletAddress, colors }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        backgroundColor: colors.paper,
        border: `3px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: `6px 6px 0 ${colors.border}`,
        width: '100%',
        maxWidth: '340px',
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: colors.text,
          margin: '0 0 20px 0',
          textAlign: 'center',
        }}>
          Deposit Funds
        </h2>

        {/* QR Code */}
        <div style={{
          width: '176px',
          height: '176px',
          border: `3px solid ${colors.border}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          backgroundColor: '#fff',
          padding: '8px',
        }}>
          {walletAddress ? (
            <QRCodeSVG value={walletAddress} size={160} />
          ) : (
            <span style={{ color: colors.textMuted, fontWeight: 'bold', fontSize: '14px' }}>No wallet</span>
          )}
        </div>

        {/* Wallet Address */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: colors.backgroundSecondary,
          border: `2px solid ${colors.border}`,
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <span style={{
            flex: 1,
            fontSize: '12px',
            fontFamily: 'monospace',
            color: colors.textSecondary,
            wordBreak: 'break-all',
          }}>
            {walletAddress || 'No wallet found'}
          </span>
          <button
            onClick={copyAddress}
            style={{
              padding: '6px 12px',
              backgroundColor: copied ? '#22c55e' : colors.border,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: colors.backgroundSecondary,
            color: colors.text,
            border: `3px solid ${colors.border}`,
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: `2px 2px 0 ${colors.border}`,
          }}
        >
          Close
        </button>
      </div>
    </ModalOverlay>
  );
}

// Withdraw Modal
function WithdrawModal({ onClose, balance, colors, wallet, walletAddress, onSuccess }) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const amountNum = parseFloat(amount);
    if (!recipientAddress.trim()) {
      setError('Please enter a recipient address');
      return;
    }
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amountNum > balance) {
      setError('Insufficient balance');
      return;
    }

    // Validate recipient address
    let recipientPubkey;
    try {
      recipientPubkey = new PublicKey(recipientAddress.trim());
    } catch {
      setError('Invalid Solana address');
      return;
    }

    if (!wallet || !isSolanaWallet(wallet)) {
      setError('Wallet not available');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const senderPubkey = new PublicKey(walletAddress);
      const usdcMint = new PublicKey(USDC_MINT);

      // Get sender's USDC token account
      const senderTokenAccount = await getAssociatedTokenAddress(usdcMint, senderPubkey);

      // Get or create recipient's USDC token account
      const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, recipientPubkey);

      // Build instructions array
      const instructions = [];

      // Check if recipient token account exists
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch {
        // Create associated token account for recipient if it doesn't exist
        instructions.push(
          createAssociatedTokenAccountInstruction(
            senderPubkey,
            recipientTokenAccount,
            recipientPubkey,
            usdcMint
          )
        );
      }

      // Add transfer instruction (USDC has 6 decimals)
      const amountInSmallestUnit = Math.floor(amountNum * 1_000_000);
      instructions.push(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPubkey,
          amountInSmallestUnit
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Create VersionedTransaction (required by Dynamic embedded wallets)
      const messageV0 = new TransactionMessage({
        payerKey: senderPubkey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      // Sign with Dynamic wallet
      const signer = await wallet.getSigner();
      const signedTx = await signer.signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      console.log('Withdrawal successful:', signature);
      onSuccess?.(signature);
      onClose();
    } catch (err) {
      console.error('Withdrawal failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        backgroundColor: colors.paper,
        border: `3px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: `6px 6px 0 ${colors.border}`,
        width: '100%',
        maxWidth: '340px',
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: colors.text,
          margin: '0 0 20px 0',
          textAlign: 'center',
        }}>
          Withdraw Funds
        </h2>

        {/* Recipient Address Input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '6px',
          }}>
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="Solana address..."
            value={recipientAddress}
            onChange={(e) => { setRecipientAddress(e.target.value); setError(''); }}
            style={{
              width: '100%',
              padding: '12px',
              border: `3px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: colors.paper,
              color: colors.text,
            }}
          />
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '6px',
          }}>
            Amount
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            style={{
              width: '100%',
              padding: '12px',
              border: `3px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: colors.paper,
              color: colors.text,
            }}
          />
        </div>

        {/* Available Balance */}
        <div style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: '16px',
        }}>
          Available: <span style={{ fontWeight: 'bold', color: colors.text }}>${balance.toFixed(2)}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: colors.backgroundSecondary,
              color: colors.text,
              border: `3px solid ${colors.border}`,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `2px 2px 0 ${colors.border}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: isSending ? '#9ca3af' : '#f97316',
              color: '#fff',
              border: `3px solid ${colors.border}`,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isSending ? 'not-allowed' : 'pointer',
              boxShadow: `2px 2px 0 ${colors.border}`,
              opacity: isSending ? 0.7 : 1,
            }}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// Export Keys Modal with press-and-hold security
function ExportKeysModal({ onClose, onExport, colors }) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const HOLD_DURATION = 3000; // 3 seconds

  const startHold = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        // Completed hold
        setIsHolding(false);
        setHoldProgress(0);
        onExport();
        onClose();
      } else {
        holdTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    holdTimerRef.current = requestAnimationFrame(updateProgress);
  };

  const endHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        cancelAnimationFrame(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        backgroundColor: colors.paper,
        border: `3px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: `6px 6px 0 ${colors.border}`,
        width: '100%',
        maxWidth: '340px',
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#fef3c7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: `3px solid ${colors.border}`,
        }}>
          <svg width="32" height="32" fill="none" stroke="#f59e0b" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: colors.text,
          margin: '0 0 12px 0',
          textAlign: 'center',
        }}>
          Export Private Key
        </h2>

        {/* Warning Messages */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: `2px solid #f59e0b`,
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '13px',
            color: '#92400e',
            margin: '0 0 8px 0',
            fontWeight: 'bold',
          }}>
            Warning: Your private key grants full access to your wallet.
          </p>
          <ul style={{
            fontSize: '12px',
            color: '#92400e',
            margin: 0,
            paddingLeft: '16px',
          }}>
            <li style={{ marginBottom: '4px' }}>Never share it with anyone</li>
            <li style={{ marginBottom: '4px' }}>Store it in a secure location</li>
            <li>Anyone with this key can steal your funds</li>
          </ul>
        </div>

        {/* Hold to Reveal Button */}
        <div style={{ marginBottom: '12px' }}>
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isHolding ? '#dc2626' : '#ef4444',
              color: '#fff',
              border: `3px solid ${colors.border}`,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isHolding ? 'none' : `3px 3px 0 ${colors.border}`,
              transform: isHolding ? 'translate(3px, 3px)' : 'none',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
          >
            {/* Progress fill */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${holdProgress * 100}%`,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              transition: isHolding ? 'none' : 'width 0.2s',
            }} />

            {/* Button text */}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isHolding
                ? `Hold... ${Math.ceil((1 - holdProgress) * 3)}s`
                : 'Hold to Reveal Key (3s)'
              }
            </span>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: colors.backgroundSecondary,
            color: colors.text,
            border: `3px solid ${colors.border}`,
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: `2px 2px 0 ${colors.border}`,
          }}
        >
          Cancel
        </button>
      </div>
    </ModalOverlay>
  );
}

export default function WalletPage({ betSize, setBetSize }) {
  const { primaryWallet } = useDynamicContext();
  const { initExportProcess } = useEmbeddedReveal();
  const { colors } = useTheme();
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [solBalance, setSolBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Get wallet from Dynamic
  const walletAddress = primaryWallet?.address || null;

  // Handle export keys
  const handleExportKeys = () => {
    if (initExportProcess) {
      initExportProcess();
    } else {
      alert('Export not available for this wallet type');
    }
  };

  // Fetch USDC and SOL balances when wallet address is available
  useEffect(() => {
    async function loadBalances() {
      if (!walletAddress) {
        setUsdcBalance(null);
        setSolBalance(null);
        return;
      }

      setIsLoadingBalance(true);
      try {
        // Fetch both balances in parallel
        const [usdc, sol] = await Promise.all([
          fetchUsdcBalance(walletAddress),
          fetchSolBalance(walletAddress),
        ]);
        setUsdcBalance(usdc);
        setSolBalance(sol);
        console.log('USDC balance:', usdc, 'SOL balance:', sol);
      } catch (err) {
        console.error('Failed to fetch balances:', err);
        setUsdcBalance(0);
        setSolBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    }

    loadBalances();
  }, [walletAddress]);

  // Fetch transaction history when wallet address is available
  useEffect(() => {
    if (walletAddress) {
      setIsLoadingTransactions(true);
      fetchTransactionHistory(walletAddress).then(txs => {
        setTransactions(txs);
        setIsLoadingTransactions(false);
      });
    }
  }, [walletAddress]);

  // Use fetched balance, default to 0 if not loaded
  const balance = usdcBalance ?? 0;

  // Refresh balance function
  const refreshBalance = async () => {
    if (!walletAddress || isLoadingBalance) return;

    setIsLoadingBalance(true);
    try {
      // Refresh both balances in parallel
      const [usdc, sol] = await Promise.all([
        fetchUsdcBalance(walletAddress),
        fetchSolBalance(walletAddress),
      ]);
      setUsdcBalance(usdc);
      setSolBalance(sol);
      console.log('Balances refreshed - USDC:', usdc, 'SOL:', sol);
    } catch (err) {
      console.error('Failed to refresh balances:', err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handlePresetClick = (amount) => {
    setBetSize(amount);
    setCustomAmount('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (amount > 0 && amount <= balance) {
      setBetSize(amount);
      setCustomAmount('');
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'No wallet';

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 96px)',
        padding: '16px',
        gap: '12px',
        overflow: 'hidden',
      }}>
        {/* Balance Card */}
        <div
          style={{
            backgroundColor: colors.paper,
            border: `3px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: `4px 4px 0 ${colors.border}`,
            textAlign: 'center',
            flex: '0 0 auto',
          }}
        >
          <div style={{
            fontSize: '44px',
            fontWeight: 'bold',
            color: colors.text,
            lineHeight: 1,
            marginBottom: '10px',
          }}>
            {isLoadingBalance ? (
              <span style={{ fontSize: '24px', color: colors.textMuted }}>Loading...</span>
            ) : (
              `$${balance.toFixed(2)}`
            )}
          </div>
          {/* SOL balance for gas */}
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: '8px',
          }}>
            {isLoadingBalance ? (
              <span style={{ color: colors.textMuted }}>...</span>
            ) : (
              <span>{(solBalance ?? 0).toFixed(4)} SOL</span>
            )}
            <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: '6px' }}>(for gas)</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>USDC Balance</span>
            <button
              onClick={refreshBalance}
              disabled={isLoadingBalance}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: colors.paper,
                border: `2px solid ${colors.border}`,
                boxShadow: `1px 1px 0 ${colors.border}`,
                cursor: isLoadingBalance ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title="Refresh balance"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.text}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: isLoadingBalance ? 'spin 1s linear infinite' : 'none',
                }}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
          </div>

          <button
            onClick={copyAddress}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: colors.backgroundSecondary,
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: colors.textSecondary,
              marginBottom: '10px',
            }}
          >
            {truncatedAddress}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied && <span style={{ color: '#22c55e', fontSize: '11px' }}>Copied!</span>}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#22c55e',
            fontSize: '13px',
            fontWeight: 'bold',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
            }} />
            Connected
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          flex: '0 0 auto',
        }}>
          <button
            onClick={() => setShowDepositModal(true)}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#22c55e',
              color: '#fff',
              border: `3px solid ${colors.border}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `3px 3px 0 ${colors.border}`,
            }}
          >
            Deposit
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#f97316',
              color: '#fff',
              border: `3px solid ${colors.border}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `3px 3px 0 ${colors.border}`,
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Export Keys Button */}
        <button
          onClick={() => setShowExportModal(true)}
          disabled={!walletAddress}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: colors.backgroundSecondary,
            color: colors.text,
            border: `3px solid ${colors.border}`,
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: !walletAddress ? 'not-allowed' : 'pointer',
            boxShadow: `3px 3px 0 ${colors.border}`,
            opacity: !walletAddress ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Export Private Key
        </button>

        {/* Bet Size Section - Compact */}
        <div
          style={{
            backgroundColor: colors.paper,
            border: `3px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '14px',
            boxShadow: `4px 4px 0 ${colors.border}`,
            flex: '0 0 auto',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: colors.text,
              margin: 0,
            }}>
              Bet Amount
            </h2>
            <span style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#22c55e',
              backgroundColor: '#dcfce7',
              padding: '4px 10px',
              borderRadius: '6px',
            }}>
              Current: ${betSize}
            </span>
          </div>

          {/* Preset Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px',
            marginBottom: '10px',
          }}>
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetClick(amount)}
                style={{
                  padding: '10px 0',
                  backgroundColor: betSize === amount ? colors.border : colors.paper,
                  color: betSize === amount ? '#fff' : colors.text,
                  border: `3px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: betSize === amount ? 'none' : `2px 2px 0 ${colors.border}`,
                  transform: betSize === amount ? 'translate(2px, 2px)' : 'none',
                }}
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} style={{
            display: 'flex',
            gap: '6px',
          }}>
            <input
              type="number"
              placeholder="Custom..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: `3px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                outline: 'none',
                backgroundColor: colors.paper,
                color: colors.text,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#60a5fa',
                color: '#fff',
                border: `3px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: `2px 2px 0 ${colors.border}`,
              }}
            >
              Set
            </button>
          </form>
        </div>

        {/* Transaction History Section */}
        <div
          style={{
            backgroundColor: colors.paper,
            border: `3px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '14px',
            boxShadow: `4px 4px 0 ${colors.border}`,
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: colors.text,
            margin: '0 0 10px 0',
          }}>
            Transaction History
          </h2>

          <div style={{
            flex: 1,
            overflowY: 'auto',
          }}>
            {isLoadingTransactions ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: colors.textMuted,
                fontWeight: 'bold',
              }}>
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: colors.textMuted,
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
                <div style={{ fontWeight: 'bold' }}>No transactions yet</div>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => tx.signature && window.open(`https://solscan.io/tx/${tx.signature}`, '_blank')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: `1px solid ${colors.backgroundSecondary}`,
                    cursor: tx.signature ? 'pointer' : 'default',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: tx.type === 'deposit' ? '#dcfce7' : tx.type === 'bet' ? '#dbeafe' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke={tx.type === 'deposit' ? '#22c55e' : tx.type === 'bet' ? '#3b82f6' : '#dc2626'}
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      {tx.type === 'deposit' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      ) : tx.type === 'bet' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      )}
                    </svg>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: colors.text,
                    }}>
                      {tx.type === 'deposit' ? 'Deposit' : tx.type === 'bet' ? 'Bet Placed' : 'Withdrawal'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textMuted,
                    }}>
                      {formatDate(tx.date)}
                    </div>
                  </div>

                  {/* Amount & Link Icon */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: tx.type === 'deposit' ? '#22c55e' : tx.type === 'bet' ? '#3b82f6' : '#dc2626',
                      }}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: tx.status === 'completed' ? '#22c55e' : '#f59e0b',
                        textTransform: 'capitalize',
                      }}>
                        {tx.status}
                      </div>
                    </div>
                    {tx.signature && (
                      <svg width="14" height="14" fill="none" stroke={colors.textMuted} strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} walletAddress={walletAddress} colors={colors} />}
      {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} balance={balance} colors={colors} wallet={primaryWallet} walletAddress={walletAddress} onSuccess={() => refreshBalance()} />}
      {showExportModal && <ExportKeysModal onClose={() => setShowExportModal(false)} onExport={handleExportKeys} colors={colors} />}
    </>
  );
}
