use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Counter program called");

    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;

    let mut data = counter_account.try_borrow_mut_data()?;
    if data.len() < 8 {
        return Err(ProgramError::InvalidAccountData);
    }

    let current_value = u64::from_le_bytes(data[..8].try_into().unwrap());
    msg!("Current: {}", current_value);

    let new_value = current_value + 1;
    data[..8].copy_from_slice(&new_value.to_le_bytes());

    msg!("Updated to: {}", new_value);

    Ok(())
}
