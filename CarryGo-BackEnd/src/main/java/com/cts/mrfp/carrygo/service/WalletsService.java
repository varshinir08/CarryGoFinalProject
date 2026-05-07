package com.cts.mrfp.carrygo.service;

import com.cts.mrfp.carrygo.model.Transactions;
import com.cts.mrfp.carrygo.model.Users;
import com.cts.mrfp.carrygo.model.Wallets;
import com.cts.mrfp.carrygo.repository.TransactionsRepository;
import com.cts.mrfp.carrygo.repository.UsersRepository;
import com.cts.mrfp.carrygo.repository.WalletsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WalletsService {

    @Autowired
    private WalletsRepository walletsRepo;

    @Autowired
    private UsersRepository usersRepo;

    @Autowired
    private TransactionsRepository transactionsRepo;

    /** Returns the wallet, auto-creating one with 0 balance if it doesn't exist yet. */
    public Wallets getOrCreateWallet(Integer userId) {
        return walletsRepo.findByUserUserId(userId).orElseGet(() -> {
            Users user = usersRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            Wallets w = new Wallets();
            w.setUser(user);
            w.setBalance(0f);
            w.setLastUpdated(LocalDateTime.now());
            return walletsRepo.save(w);
        });
    }

    public Wallets getWalletByUserId(Integer userId) {
        return getOrCreateWallet(userId);
    }

    public Wallets updateBalance(Integer userId, Float amount) {
        Wallets wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance() + amount);
        wallet.setLastUpdated(LocalDateTime.now());
        return walletsRepo.save(wallet);
    }

    public Wallets topUp(Integer userId, Float amount) {
        Wallets wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance() + amount);
        wallet.setLastUpdated(LocalDateTime.now());
        walletsRepo.save(wallet);

        Transactions txn = new Transactions();
        txn.setWallet(wallet);
        txn.setType("CREDIT");
        txn.setAmount(amount);
        txn.setStatus("COMPLETED");
        txn.setCreatedAt(LocalDateTime.now());
        transactionsRepo.save(txn);

        return wallet;
    }

    /** Deducts amount from wallet. Allows booking even if balance is insufficient (goes negative). */
    public Wallets deduct(Integer userId, Float amount) {
        Wallets wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setLastUpdated(LocalDateTime.now());
        walletsRepo.save(wallet);

        Transactions txn = new Transactions();
        txn.setWallet(wallet);
        txn.setType("DEBIT");
        txn.setAmount(amount);
        txn.setStatus("COMPLETED");
        txn.setCreatedAt(LocalDateTime.now());
        transactionsRepo.save(txn);

        return wallet;
    }
}
