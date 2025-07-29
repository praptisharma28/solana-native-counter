const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  SystemProgram,
} = require('@solana/web3.js');
const borsh = require('borsh');
const fs = require('fs');

const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
const COUNTER_SIZE = 8;

(async () => {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

  const payer = Keypair.generate();
  await connection.requestAirdrop(payer.publicKey, 1e9);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const counter = Keypair.generate();

  const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: counter.publicKey,
    lamports,
    space: COUNTER_SIZE,
    programId: PROGRAM_ID,
  });

  const incrementIx = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: counter.publicKey, isSigner: false, isWritable: true },
    ],
    data: Buffer.alloc(0),
  });

  const tx = new Transaction().add(createAccountIx, incrementIx);
  await sendAndConfirmTransaction(connection, tx, [payer, counter]);

  const account = await connection.getAccountInfo(counter.publicKey);
  const data = account.data;
  const counterValue = Number(Buffer.from(data).readBigUInt64LE(0));
  console.log('Counter:', counterValue);
})();
