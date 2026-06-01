-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: plywood_database_for_comparison_update
-- ------------------------------------------------------
-- Server version	11.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `allow_leave_scalewise`
--

DROP TABLE IF EXISTS `allow_leave_scalewise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allow_leave_scalewise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contract_type` varchar(100) NOT NULL,
  `pay_scale` varchar(100) NOT NULL,
  `leave_type_id` bigint(20) NOT NULL,
  `no_of_leave_allowed` int(11) NOT NULL,
  `status` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `remarks` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_sn` int(11) DEFAULT NULL,
  `user_id` varchar(50) NOT NULL,
  `record_time` datetime NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `date_only` date GENERATED ALWAYS AS (cast(`record_time` as date)) STORED,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `record_time` (`record_time`)
) ENGINE=InnoDB AUTO_INCREMENT=435 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) NOT NULL,
  `opening_balance` bigint(20) NOT NULL,
  `created_at` varchar(100) DEFAULT cast(current_timestamp() as date),
  `account_no` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_details`
--

DROP TABLE IF EXISTS `bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_id` int(11) NOT NULL,
  `account_title` varchar(100) NOT NULL,
  `account_no` varchar(100) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status_on_off` varchar(100) DEFAULT 'On',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_notes`
--

DROP TABLE IF EXISTS `bank_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_title` varchar(255) NOT NULL,
  `note_description` text NOT NULL,
  `session_id` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(100) DEFAULT 'On',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_transactions`
--

DROP TABLE IF EXISTS `bank_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dates` varchar(100) NOT NULL,
  `bank_id` int(11) NOT NULL,
  `head_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_status` enum('In','Out') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bank_id` (`bank_id`),
  KEY `idx_head_id` (`head_id`),
  KEY `idx_dates` (`dates`),
  KEY `idx_transaction_status` (`transaction_status`)
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campuses`
--

DROP TABLE IF EXISTS `campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fee_group_id` int(11) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clinic_items`
--

DROP TABLE IF EXISTS `clinic_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinic_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) NOT NULL DEFAULT 0,
  `type` varchar(50) DEFAULT NULL,
  `price` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `lab_test_id` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commission_payments`
--

DROP TABLE IF EXISTS `commission_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` bigint(20) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `payment_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `salary_id` int(11) DEFAULT NULL,
  `created_by` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `invoice_no` (`invoice_no`),
  KEY `staff_id` (`staff_id`),
  KEY `idx_salary_id` (`salary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `counters`
--

DROP TABLE IF EXISTS `counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `counters` (
  `counter_name` varchar(50) NOT NULL,
  `last_value` int(11) NOT NULL,
  PRIMARY KEY (`counter_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_expenses`
--

DROP TABLE IF EXISTS `daily_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expense_date` text NOT NULL,
  `expense_head_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_expense_date` (`expense_date`(3072)),
  KEY `idx_expense_head_id` (`expense_head_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=264 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctor_name` varchar(50) NOT NULL,
  `department_id` bigint(20) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `specialization` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_posts`
--

DROP TABLE IF EXISTS `employee_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_post` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_record`
--

DROP TABLE IF EXISTS `employee_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_roles`
--

DROP TABLE IF EXISTS `employee_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_role` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_salary_records`
--

DROP TABLE IF EXISTS `employee_salary_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_salary_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_book_id` int(11) NOT NULL,
  `invoice_no` bigint(20) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_role_id` int(11) NOT NULL,
  `employee_post_id` int(11) NOT NULL,
  `pay_scale_id` bigint(20) NOT NULL,
  `for_the_month` varchar(100) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `additional_increments` decimal(10,2) NOT NULL,
  `house_rent` decimal(10,2) DEFAULT NULL,
  `second_shift_honorarium` decimal(10,2) NOT NULL DEFAULT 0.00,
  `previous_increments` decimal(10,2) DEFAULT NULL,
  `current_increment` decimal(10,2) DEFAULT NULL,
  `total_increments` decimal(10,2) GENERATED ALWAYS AS (`previous_increments` + `current_increment`) STORED,
  `previous_adhoc` decimal(10,2) DEFAULT NULL,
  `current_adhoc` decimal(10,2) DEFAULT NULL,
  `total_adhoc` decimal(10,2) GENERATED ALWAYS AS (`previous_adhoc` + `current_adhoc`) STORED,
  `security_deduct` decimal(10,2) DEFAULT NULL,
  `total_security_deduct` decimal(10,2) DEFAULT NULL,
  `loan_deduct` decimal(10,2) NOT NULL,
  `total_loan_deduct` decimal(10,2) NOT NULL,
  `graduity` decimal(10,2) DEFAULT NULL,
  `others_allownce` decimal(10,2) DEFAULT NULL,
  `dow` int(11) NOT NULL,
  `net_salary` decimal(10,2) DEFAULT NULL,
  `principal_allownce` bigint(20) NOT NULL DEFAULT 0,
  `medical_allownce` bigint(20) NOT NULL DEFAULT 0,
  `special_allownce` bigint(20) NOT NULL DEFAULT 0,
  `overtime` bigint(20) DEFAULT 0,
  `overtime_amount` decimal(10,2) DEFAULT 0.00,
  `income_tax` decimal(10,2) NOT NULL,
  `rebate` decimal(10,2) NOT NULL,
  `remaining` decimal(10,2) DEFAULT NULL,
  `pessi` decimal(10,2) NOT NULL,
  `eobi` decimal(10,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `campus_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `phone_no` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `employment_status` varchar(50) DEFAULT NULL,
  `cnic` varchar(50) DEFAULT NULL,
  `account_no` varchar(50) DEFAULT NULL,
  `employee_image` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense_head`
--

DROP TABLE IF EXISTS `expense_head`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_head` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `head_name` varchar(255) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_no` varchar(255) DEFAULT NULL,
  `head_id` bigint(20) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_type` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fee_groups`
--

DROP TABLE IF EXISTS `fee_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fee_group_name` varchar(100) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fee_head_details`
--

DROP TABLE IF EXISTS `fee_head_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_head_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shift` varchar(100) DEFAULT NULL,
  `fee_head_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `fee_group_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(50) NOT NULL DEFAULT 'On',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fee_vouchers`
--

DROP TABLE IF EXISTS `fee_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_vouchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` text NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `class_id` bigint(20) DEFAULT NULL,
  `section_id` bigint(20) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `for_the_month` varchar(200) NOT NULL,
  `fee_head` text NOT NULL,
  `total_amount_data` bigint(20) NOT NULL,
  `due_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `after_due_date_amount` bigint(20) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `arrears_not_cleared` text DEFAULT NULL,
  `arrears` bigint(20) DEFAULT 0,
  `campus_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `bank_details` text DEFAULT NULL,
  `advance_payments` varchar(100) DEFAULT NULL,
  `advance_status` varchar(100) DEFAULT NULL,
  `recieved_payment` bigint(20) DEFAULT 0,
  `payment_received_through_bank` text DEFAULT NULL,
  `scroll_no` bigint(20) DEFAULT NULL,
  `payment_date` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `first_advance_payment` bigint(20) DEFAULT 0,
  `bus_fee` bigint(20) DEFAULT 0,
  `arrears_gap` bigint(20) DEFAULT NULL,
  `arrear_gap_from_payable` bigint(20) DEFAULT NULL,
  `voucher_created_form` varchar(100) DEFAULT NULL,
  `is_arrear` varchar(100) DEFAULT NULL,
  `fine` bigint(20) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `first_arrear` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_for_the_month` (`for_the_month`)
) ENGINE=InnoDB AUTO_INCREMENT=30599 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `heads`
--

DROP TABLE IF EXISTS `heads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `head_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` bigint(20) NOT NULL,
  `item` bigint(20) NOT NULL,
  `price` varchar(50) NOT NULL,
  `quantity` varchar(50) NOT NULL,
  `discount` varchar(50) NOT NULL,
  `price_after_discount` decimal(10,2) DEFAULT 0.00,
  `phone_no` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `account_no` varchar(100) DEFAULT NULL,
  `gst` bigint(20) DEFAULT 0,
  `invoice_date` varchar(100) NOT NULL,
  `total` varchar(50) GENERATED ALWAYS AS (`price_after_discount` * `quantity`) STORED,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `rack_no` varchar(100) DEFAULT NULL,
  `return_unit` bigint(20) DEFAULT 0,
  `total_return_amount` bigint(20) DEFAULT 0,
  `status` varchar(100) NOT NULL,
  `age` varchar(100) DEFAULT NULL,
  `weight` varchar(100) DEFAULT NULL,
  `bp` varchar(100) DEFAULT NULL,
  `patient_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_invoice_item` (`item`)
) ENGINE=InnoDB AUTO_INCREMENT=1038 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice_payments`
--

DROP TABLE IF EXISTS `invoice_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_payments_invoice_no` (`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice_pharmacy`
--

DROP TABLE IF EXISTS `invoice_pharmacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_pharmacy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` bigint(20) NOT NULL,
  `stock_id` bigint(20) DEFAULT 0,
  `item` bigint(20) NOT NULL,
  `price` varchar(50) DEFAULT NULL,
  `quantity` varchar(50) NOT NULL,
  `discount` varchar(50) NOT NULL,
  `price_after_discount` decimal(10,2) DEFAULT 0.00,
  `phone_no` varchar(100) NOT NULL DEFAULT '0',
  `full_name` varchar(100) DEFAULT NULL,
  `account_no` varchar(100) DEFAULT NULL,
  `gst` bigint(20) DEFAULT 0,
  `invoice_date` varchar(100) NOT NULL,
  `total` varchar(255) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `rack_no` text DEFAULT NULL,
  `return_unit` bigint(20) DEFAULT 0,
  `total_return_amount` bigint(20) DEFAULT 0,
  `doctor_invoice_id` bigint(20) DEFAULT 0,
  `age` varchar(100) DEFAULT NULL,
  `patient_id` bigint(20) DEFAULT 0,
  `remaining_amount` bigint(20) DEFAULT 0,
  `advance` bigint(20) DEFAULT 0,
  `grand_total` bigint(20) DEFAULT NULL,
  `book_id` varchar(100) DEFAULT NULL,
  `delivery_date` varchar(100) DEFAULT NULL,
  `phone_no_type` varchar(100) NOT NULL,
  `stock_type` varchar(100) DEFAULT NULL,
  `invoice_type` varchar(100) DEFAULT NULL,
  `invoice_status` varchar(100) NOT NULL,
  `alert_date` varchar(100) DEFAULT NULL,
  `user_name` varchar(200) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `rent` bigint(20) DEFAULT 0,
  `staff_id` int(11) DEFAULT NULL,
  `commission_amount` decimal(10,2) DEFAULT 0.00,
  `appointment_date` varchar(100) DEFAULT NULL,
  `purchase_price_non_stock` varchar(100) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_invoice_stock_id` (`stock_id`),
  KEY `idx_invoice_item` (`item`),
  KEY `idx_phone_no` (`phone_no`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_invoice_date` (`invoice_date`),
  KEY `idx_type_date` (`invoice_type`,`invoice_date`),
  KEY `idx_invoice_status` (`invoice_status`),
  KEY `idx_alert_date` (`alert_date`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_ip_invoice_type` (`invoice_type`),
  KEY `idx_ip_alert_date` (`alert_date`),
  KEY `idx_ip_invoice_date` (`invoice_date`),
  KEY `idx_ip_appointment_date` (`appointment_date`),
  KEY `idx_ip_invoice_no` (`invoice_no`),
  KEY `idx_ip_phone_no` (`phone_no`),
  KEY `idx_ip_full_name` (`full_name`),
  KEY `idx_ip_type_date_no` (`invoice_type`,`invoice_date`,`invoice_no`)
) ENGINE=InnoDB AUTO_INCREMENT=1343 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `items` varchar(50) NOT NULL,
  `category` bigint(20) DEFAULT 0,
  `price` varchar(50) DEFAULT '0',
  `discount` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `unit_type` varchar(100) NOT NULL,
  `gst` bigint(20) DEFAULT 0,
  `manufacturer` varchar(100) NOT NULL,
  `medicine_type` varchar(100) DEFAULT NULL,
  `final_price` bigint(20) DEFAULT 0,
  `alert` bigint(20) DEFAULT 0,
  `stock_id` bigint(20) NOT NULL DEFAULT 0,
  `stock_type` varchar(100) NOT NULL,
  `barcode_no` varchar(200) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `item_purchase_price` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2730 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_test_heads`
--

DROP TABLE IF EXISTS `lab_test_heads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_test_heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lab_test_id` int(11) NOT NULL,
  `test_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ref_range` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `period` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_test_results`
--

DROP TABLE IF EXISTS `lab_test_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_test_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint(20) NOT NULL,
  `lab_test_id` bigint(20) NOT NULL,
  `results` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lab_test` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leave_type`
--

DROP TABLE IF EXISTS `leave_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leave_type` varchar(100) NOT NULL,
  `Status` varchar(100) NOT NULL DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `overtime`
--

DROP TABLE IF EXISTS `overtime`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `overtime` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `overtime_date` date DEFAULT NULL,
  `employee_id` bigint(20) DEFAULT NULL,
  `overtime_hours` bigint(20) DEFAULT NULL,
  `campus_id` bigint(20) DEFAULT NULL,
  `session_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paid_payments`
--

DROP TABLE IF EXISTS `paid_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paid_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paid_payments` bigint(20) NOT NULL,
  `created_at` text NOT NULL,
  `supplier_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_history`
--

DROP TABLE IF EXISTS `patient_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `patient_history` text DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mrNo` varchar(200) NOT NULL,
  `name` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `contact` varchar(100) NOT NULL,
  `husbandOrFatherName` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `relation` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mrNo` (`mrNo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pay_scale`
--

DROP TABLE IF EXISTS `pay_scale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pay_scale` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_type` varchar(100) DEFAULT NULL,
  `pay_scale` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pay_scale_wise_basic_salary`
--

DROP TABLE IF EXISTS `pay_scale_wise_basic_salary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pay_scale_wise_basic_salary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pay_scale_id` bigint(20) NOT NULL,
  `basic_salary` int(11) NOT NULL,
  `annual_increment` bigint(20) NOT NULL DEFAULT 0,
  `house_rent` bigint(20) NOT NULL DEFAULT 0,
  `user_id` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salary`
--

DROP TABLE IF EXISTS `salary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary` (
  `employee_id` bigint(20) NOT NULL,
  `attendance_days` int(11) NOT NULL,
  `pending` int(11) NOT NULL,
  `deduction` int(11) NOT NULL,
  `addition` int(11) NOT NULL,
  `for_the_month` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `school_categories`
--

DROP TABLE IF EXISTS `school_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `status` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_school_categories_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `school_employee_attendance`
--

DROP TABLE IF EXISTS `school_employee_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_employee_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `remarks` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `campus_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `session_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `school_employees`
--

DROP TABLE IF EXISTS `school_employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `register_no` varchar(50) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `employee_role_id` int(11) DEFAULT NULL,
  `employee_post_id` int(11) DEFAULT NULL,
  `pay_scale_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `cnic` varchar(100) DEFAULT NULL,
  `marital_status` varchar(100) DEFAULT NULL,
  `current_address` varchar(255) DEFAULT NULL,
  `permanent_address` varchar(255) DEFAULT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `work_shift` varchar(100) DEFAULT NULL,
  `second_shift_honorarium` decimal(10,2) NOT NULL DEFAULT 0.00,
  `employee_campus_id` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `profile_image` varchar(100) DEFAULT NULL,
  `soft_delete` varchar(100) NOT NULL DEFAULT 'On',
  `account_no` varchar(100) DEFAULT NULL,
  `security_deduction` decimal(10,2) NOT NULL DEFAULT 0.00,
  `security_no_of_installment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_security_deduction` decimal(10,2) NOT NULL DEFAULT 0.00,
  `campus_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `basic_salary` bigint(20) NOT NULL,
  `house_rent` bigint(20) NOT NULL,
  `additional_increments` bigint(20) NOT NULL,
  `total_security_deduct_from_salary` bigint(20) NOT NULL DEFAULT 0,
  `loan_deduction` decimal(10,2) NOT NULL,
  `loan_no_of_installment` decimal(10,2) NOT NULL,
  `total_loan_deduction` decimal(10,2) NOT NULL,
  `total_loan_deduct_from_salary` decimal(10,2) DEFAULT 0.00,
  `bus_charges` decimal(10,2) NOT NULL,
  `bus_status` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_name` varchar(50) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sections_section_name` (`section_name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `selected_categories_campuswise`
--

DROP TABLE IF EXISTS `selected_categories_campuswise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `selected_categories_campuswise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'On',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service_book`
--

DROP TABLE IF EXISTS `service_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_role_id` int(11) NOT NULL,
  `employee_post_id` int(11) NOT NULL,
  `pay_scale_id` int(11) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `house_rent` decimal(10,2) DEFAULT NULL,
  `second_shift_honorarium` decimal(10,2) NOT NULL DEFAULT 0.00,
  `additional_increment` decimal(10,2) DEFAULT NULL,
  `pessi` decimal(10,2) DEFAULT NULL,
  `eobi` decimal(10,2) DEFAULT NULL,
  `old_adhoc` decimal(10,2) DEFAULT NULL,
  `current_adhoc` decimal(10,2) DEFAULT NULL,
  `total_adhoc` bigint(20) NOT NULL,
  `increment_date` varchar(100) DEFAULT NULL,
  `previous_total_increments` decimal(10,2) DEFAULT NULL,
  `current_increment` bigint(20) DEFAULT NULL,
  `total_increment` bigint(20) NOT NULL,
  `total_net_salary` bigint(20) NOT NULL DEFAULT 0,
  `campus_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `job_type` varchar(100) NOT NULL,
  `remarks` varchar(100) DEFAULT NULL,
  `annual_increment_status` varchar(100) DEFAULT NULL,
  `adhoc_increment_status` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `entry_form` varchar(100) NOT NULL,
  `adhoc_percentage` bigint(20) NOT NULL DEFAULT 0,
  `medical_allownce` bigint(20) NOT NULL DEFAULT 0,
  `special_allownce` bigint(20) NOT NULL DEFAULT 0,
  `principal_allownce` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT 0.00,
  `commission_rate` decimal(5,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `date_joined` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnic` (`cnic`),
  KEY `idx_staff_name` (`name`),
  KEY `idx_staff_status` (`status`),
  KEY `idx_staff_cnic` (`cnic`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `staff_salary`
--

DROP TABLE IF EXISTS `staff_salary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_salary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `month` tinyint(4) NOT NULL COMMENT '1-12',
  `year` int(11) NOT NULL,
  `base_salary` decimal(10,2) NOT NULL DEFAULT 0.00,
  `allowances` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `bonuses` decimal(10,2) DEFAULT 0.00,
  `commission_included` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `payment_date` datetime NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_salary_month` (`staff_id`,`month`,`year`),
  CONSTRAINT `staff_salary_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) NOT NULL,
  `invoice_no` bigint(20) NOT NULL,
  `price` decimal(10,2) NOT NULL COMMENT 'this is actual price',
  `quantity` decimal(10,2) NOT NULL COMMENT 'this quantity is used in invoice',
  `purchase_price` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `price_option` varchar(50) NOT NULL,
  `discount_option` varchar(50) NOT NULL,
  `remarks` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `stock_date` varchar(100) NOT NULL,
  `packet_quantity` decimal(10,2) DEFAULT 0.00,
  `per_packet_quantity` decimal(10,2) DEFAULT 0.00,
  `selling_price` decimal(10,2) DEFAULT 0.00,
  `price_after_discount` decimal(10,2) DEFAULT 0.00,
  `after_discount_total` decimal(10,2) DEFAULT 0.00,
  `supplier_id` bigint(20) NOT NULL,
  `final_price` bigint(20) DEFAULT 0,
  `rack_no` varchar(100) DEFAULT NULL,
  `total_purchase_rate` bigint(20) DEFAULT 0,
  `allocated_quantity` decimal(10,2) DEFAULT 0.00,
  `date_of_expiry` varchar(100) DEFAULT NULL,
  `purchase_rate_calculate_per_tablet` decimal(10,2) DEFAULT 0.00,
  `stock_status` varchar(50) NOT NULL DEFAULT 'In Stock',
  `payment_status` varchar(100) DEFAULT NULL,
  `removed_expired_quantity` decimal(10,2) DEFAULT 0.00,
  `advance_payment` bigint(20) DEFAULT 0,
  `remaining_amount` bigint(20) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_stock_item_id` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=940 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `register_no` text DEFAULT NULL,
  `old_register_no` text DEFAULT NULL,
  `shift` varchar(50) DEFAULT NULL,
  `admission_date` date DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `cast` varchar(100) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `mother_tongue` varchar(50) DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `student_cnic` varchar(20) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `house_id` varchar(20) DEFAULT NULL,
  `club_id` varchar(20) DEFAULT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `relation` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `guardian_mobile_no` varchar(20) DEFAULT NULL,
  `guardian_address` text DEFAULT NULL,
  `guardian_cnic` varchar(20) DEFAULT NULL,
  `pl_no` varchar(50) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `student_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `father_cnic` varchar(100) DEFAULT NULL,
  `father_mobile_no` varchar(100) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `status_date` varchar(100) DEFAULT NULL,
  `slc_invoice_no` varchar(255) DEFAULT NULL,
  `status_on_off` varchar(100) DEFAULT 'On',
  `bus_fee` bigint(20) DEFAULT 0,
  `bus_status` varchar(100) DEFAULT NULL,
  `status_for_pendings` varchar(100) NOT NULL DEFAULT 'On',
  PRIMARY KEY (`id`),
  KEY `students_session_id_IDX` (`session_id`) USING BTREE,
  KEY `students_campus_id_IDX` (`campus_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=875 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supplier_ledger`
--

DROP TABLE IF EXISTS `supplier_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_ledger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT '',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `phone_no` varchar(100) DEFAULT NULL,
  `account_no` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `remaining_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `campus_id` bigint(20) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `user_id` bigint(20) DEFAULT NULL,
  `printer_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'plywood_database_for_comparison_update'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-01 16:05:42
