-- Run this in phpMyAdmin (XAMPP) to create schema

CREATE DATABASE IF NOT EXISTS `bookvault` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `bookvault`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(64) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `fullName` VARCHAR(255) DEFAULT NULL,
  `gender` VARCHAR(16) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `businessName` VARCHAR(255) NOT NULL,
  `contactPerson` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `tin` VARCHAR(64) DEFAULT NULL,
  `businessType` VARCHAR(64) DEFAULT 'business',
  `monthlyFee` DECIMAL(12,2) DEFAULT 0,
  `startDate` DATE DEFAULT NULL,
  `status` VARCHAR(32) DEFAULT 'active',
  `lastPayment` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `billing_statements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_code` VARCHAR(64) NOT NULL,
  `clientId` INT NOT NULL,
  `clientName` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(32) DEFAULT 'pending',
  `billingPeriodStart` DATE,
  `billingPeriodEnd` DATE,
  `services_json` JSON,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



