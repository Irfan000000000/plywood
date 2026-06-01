-- MariaDB dump 10.19-11.2.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: pos
-- ------------------------------------------------------
-- Server version	11.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
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
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `allow_leave_scalewise`
--

LOCK TABLES `allow_leave_scalewise` WRITE;
/*!40000 ALTER TABLE `allow_leave_scalewise` DISABLE KEYS */;
/*!40000 ALTER TABLE `allow_leave_scalewise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_details`
--

DROP TABLE IF EXISTS `bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `bank_details`
--

LOCK TABLES `bank_details` WRITE;
/*!40000 ALTER TABLE `bank_details` DISABLE KEYS */;
INSERT INTO `bank_details` VALUES
(16,2,'Nasheman Center','1213123123',16,'On','2024-07-29 06:20:53','2024-07-31 18:01:33','On');
/*!40000 ALTER TABLE `bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_notes`
--

DROP TABLE IF EXISTS `bank_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `bank_notes`
--

LOCK TABLES `bank_notes` WRITE;
/*!40000 ALTER TABLE `bank_notes` DISABLE KEYS */;
INSERT INTO `bank_notes` VALUES
(12,'Notes','<p>Bank Timing: 09AM to 05 PM</p>',1,16,8,'2024-07-18 17:24:41','2024-08-08 18:04:19','On');
/*!40000 ALTER TABLE `bank_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `banks`
--

LOCK TABLES `banks` WRITE;
/*!40000 ALTER TABLE `banks` DISABLE KEYS */;
INSERT INTO `banks` VALUES
(1,'Al Baraka Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(2,'Allied Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(3,'Askari Bank','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(4,'Bank Alfalah Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(5,'Bank Al-Habib Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(6,'BankIslami Pakistan Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(7,'City Bank','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(8,'Faysal Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(9,'Habib Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(10,'Habib Metropolitan Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(11,'JS Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(12,'MCB Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(13,'MCB Islamic Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(14,'Meezan Bank Limited','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(15,'National Bank of Pakistan','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(16,'Samba Bank','On','2024-07-10 06:00:48','2024-07-10 06:00:48'),
(17,'Bank of Punjab','On','2024-07-10 06:00:48','2024-07-10 06:00:48');
/*!40000 ALTER TABLE `banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campuses`
--

DROP TABLE IF EXISTS `campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campuses`
--

LOCK TABLES `campuses` WRITE;
/*!40000 ALTER TABLE `campuses` DISABLE KEYS */;
INSERT INTO `campuses` VALUES
(1,'Campus-1','On','2024-07-02 08:24:43'),
(2,'Campus-2','On','2024-07-02 08:24:43'),
(3,'Campus-3','On','2024-07-02 08:24:43'),
(4,'Campus-4','On','2024-07-02 08:24:43'),
(5,'Campus-5','On','2024-07-02 08:24:43'),
(6,'Campus-6','On','2024-07-02 08:24:43'),
(7,'Campus-7','On','2024-07-02 08:24:43'),
(8,'Campus-8','On','2024-07-02 08:24:43'),
(9,'Campus-9','On','2024-07-02 08:24:43'),
(10,'Campus-10','On','2024-07-02 08:24:43'),
(11,'Campus-11','On','2024-07-02 08:24:43'),
(12,'Campus-12','On','2024-07-02 08:24:43'),
(13,'Campus-13','On','2024-07-02 08:24:43'),
(14,'DGC','On','2024-07-02 08:24:43'),
(15,'Head Office','On','2024-07-02 08:53:19'),
(16,'Nasheman','On','2024-07-02 08:53:19');
/*!40000 ALTER TABLE `campuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(10,'Willsone',1,'2025-01-24 16:24:51'),
(11,'Pharma',1,'2025-01-24 16:24:51'),
(12,'Ortholife',1,'2025-01-27 17:14:14'),
(13,'Surgitex',1,'2025-01-27 17:14:18'),
(14,'Well Med',1,'2025-01-27 17:14:35'),
(15,'On Call',1,'2025-01-27 17:14:38'),
(16,'GSK',1,'2025-01-30 16:18:50');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES
(39,3,'Level 1',8,16,'On','2024-07-29 06:04:19','2024-07-30 10:50:52'),
(40,3,'Level 2',8,16,'On','2024-07-29 06:04:33','2024-07-30 10:50:52'),
(41,3,'Level 3',8,16,'On','2024-07-29 06:04:45','2024-07-30 10:50:52'),
(42,3,'Level 4',8,16,'On','2024-07-29 06:07:21','2024-07-30 10:50:52'),
(43,3,'Level 5',8,16,'On','2024-07-29 06:07:27','2024-07-30 10:50:52'),
(44,3,'Level 6',8,16,'On','2024-07-29 06:07:38','2024-07-30 10:50:52'),
(45,3,'Training A',8,16,'On','2024-07-29 06:08:03','2024-07-30 10:50:52'),
(46,3,'Traning B',8,16,'On','2024-07-29 06:08:11','2024-07-30 10:50:52'),
(47,3,'Nursery',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(48,3,'KG',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(49,3,'One',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(50,3,'Two',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(51,3,'Three',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(52,3,'Four',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(53,3,'Five',10,16,'On','2024-07-29 06:08:11','2024-07-31 09:40:31'),
(54,4,'Six',11,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(55,4,'Seven',11,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(56,4,'Eight',11,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(57,6,'Nine',11,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(58,6,'Tenth',11,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(59,8,'1st Year',12,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(60,8,'2nd Year',12,16,'On','2024-07-29 06:08:11','2024-08-01 05:26:16'),
(61,3,'VIC Class',9,16,'On','2024-07-29 06:08:11','2024-07-31 10:47:30'),
(62,3,'DPT (1st Year)',13,16,'On','2024-08-25 10:24:52','2024-08-25 10:24:52');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_posts`
--

DROP TABLE IF EXISTS `employee_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `employee_posts`
--

LOCK TABLES `employee_posts` WRITE;
/*!40000 ALTER TABLE `employee_posts` DISABLE KEYS */;
INSERT INTO `employee_posts` VALUES
(1,'Teacher','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(2,'PTI','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(3,'Account Clerk','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(6,'Principal','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(7,'Vice Principal','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(8,'Sweeper','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(9,'Aya','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(10,'Accountant','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(11,'Computer Operator','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(12,'Admin Supervisor','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(14,'Mali','On','2024-08-22 16:55:31','2024-08-26 16:39:49'),
(15,'Watch Man','On','2024-08-22 16:55:31','2024-08-26 16:39:49');
/*!40000 ALTER TABLE `employee_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_roles`
--

DROP TABLE IF EXISTS `employee_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `employee_roles`
--

LOCK TABLES `employee_roles` WRITE;
/*!40000 ALTER TABLE `employee_roles` DISABLE KEYS */;
INSERT INTO `employee_roles` VALUES
(1,'Administrator','On','2024-08-22 16:42:01','2024-08-22 16:51:42'),
(2,'Teacher','On','2024-08-22 16:42:01','2024-08-22 16:42:51'),
(4,'Others','On','2024-08-22 16:42:01','2024-08-22 16:42:01'),
(5,'Accountant','On','2024-08-22 16:42:01','2024-08-22 16:42:01'),
(6,'Librarian','On','2024-08-22 16:42:01','2024-08-22 16:42:01'),
(7,'Receptionist','On','2024-08-22 16:42:01','2024-08-22 16:42:01'),
(8,'Admin','On','2024-08-22 16:42:01','2024-08-22 16:51:42');
/*!40000 ALTER TABLE `employee_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_salary_records`
--

DROP TABLE IF EXISTS `employee_salary_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `employee_salary_records`
--

LOCK TABLES `employee_salary_records` WRITE;
/*!40000 ALTER TABLE `employee_salary_records` DISABLE KEYS */;
INSERT INTO `employee_salary_records` VALUES
(174,146,1000,103,8,1,14,'2024-10',10000.00,0.00,2500.00,5000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,31,17500.00,0,0,0,10,362.32,0.00,0.00,17862.32,0.00,0.00,'',16,8,'2024-10-03 12:45:34','2024-10-03 12:45:34',1);
/*!40000 ALTER TABLE `employee_salary_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES
(46,'IRFAN ZAFAR','2024-05-25','Male','03441207218','abc city lahore','Full Time','3423324234234','SDA23REFSDFDS','1716624522964.png',1),
(49,'irfan','2024-07-17','Male','03441207218','asdfasdfsf','Full Time','23402323443','234234234','1720248404738.png',1),
(50,'sdfsfsdf','2024-07-10','Male','23234234','sdfsdf','Full Time','234234324','234234423','Screenshot 2024-07-02 120018.png',1);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_head`
--

DROP TABLE IF EXISTS `expense_head`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `expense_head`
--

LOCK TABLES `expense_head` WRITE;
/*!40000 ALTER TABLE `expense_head` DISABLE KEYS */;
INSERT INTO `expense_head` VALUES
(25,'Electricity Bill','On','2024-04-03 18:30:07','2024-05-10 17:37:08'),
(26,'Gas Bill','On','2024-04-04 15:46:23','2024-04-04 15:46:23'),
(28,'Test 1','On','2024-04-04 15:46:38','2024-04-04 15:46:38'),
(30,'Electricity Bill','On','2024-04-03 18:30:07','2024-05-10 17:37:08'),
(31,'Gas Bill','On','2024-04-04 15:46:23','2024-04-04 15:46:23'),
(104,'Test 1','On','2024-04-04 15:46:38','2024-04-04 15:46:38'),
(105,'Electricity Bill','On','2024-04-03 18:30:07','2024-05-10 17:37:08'),
(106,'Gas Bill','On','2024-04-04 15:46:23','2024-04-04 15:46:23'),
(107,'Test 1','On','2024-04-04 15:46:38','2024-04-04 15:46:38'),
(108,'Electricity Bill','On','2024-04-03 18:30:07','2024-05-10 17:37:08'),
(109,'Gas Bill','On','2024-04-04 15:46:23','2024-04-04 15:46:23'),
(110,'Test 1','On','2024-04-04 15:46:38','2024-04-04 15:46:38'),
(111,'Electricity Bill','On','2024-04-03 18:30:07','2024-05-10 17:37:08'),
(112,'Gas Bill','On','2024-04-04 15:46:23','2024-04-04 15:46:23'),
(113,'Test 1','On','2024-04-04 15:46:38','2024-04-04 15:46:38'),
(114,'Electricity Bill','Off','2024-04-03 18:30:07','2024-05-11 07:25:23'),
(118,'Gas Bill','On','2024-04-04 15:46:23','2024-04-04 15:46:23');
/*!40000 ALTER TABLE `expense_head` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES
(5,'10000',25,2500.00,'','2024-05-10 14:47:42','2024-05-10 14:47:42','Online'),
(6,'10000',26,2500.00,'','2024-05-10 14:47:42','2024-05-10 14:47:42','Online'),
(7,'10000',28,2500.00,'','2024-05-10 14:47:42','2024-05-10 14:47:42','Online');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_groups`
--

DROP TABLE IF EXISTS `fee_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `fee_groups`
--

LOCK TABLES `fee_groups` WRITE;
/*!40000 ALTER TABLE `fee_groups` DISABLE KEYS */;
INSERT INTO `fee_groups` VALUES
(3,'ID Department_HIC Junior_VIC',16,'On','2024-07-29 05:58:47','2024-08-01 05:27:22'),
(4,'HIC Senior 6 to 8',16,'On','2024-07-29 05:59:47','2024-08-01 05:22:38'),
(6,'HIC Senior 9 to 10',16,'On','2024-07-29 06:00:27','2024-08-01 05:22:38'),
(8,'HIC Senior 1st Year & 2nd Year',16,'On','2024-07-29 06:00:45','2024-08-01 05:22:38'),
(10,'test',16,'Off','2024-08-13 16:55:38','2024-08-25 08:30:05');
/*!40000 ALTER TABLE `fee_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_head_details`
--

DROP TABLE IF EXISTS `fee_head_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `fee_head_details`
--

LOCK TABLES `fee_head_details` WRITE;
/*!40000 ALTER TABLE `fee_head_details` DISABLE KEYS */;
INSERT INTO `fee_head_details` VALUES
(30,'Morning',5,1,3,500,16,'2024-08-01 05:09:01','2024-08-10 19:27:19','On'),
(31,'Morning',5,2,3,700,16,'2024-08-01 05:09:28','2024-08-01 05:09:28','On'),
(32,'Morning',5,1,4,800,16,'2024-08-01 05:27:42','2024-08-01 05:27:42','On'),
(33,'Morning',5,2,4,1000,16,'2024-08-01 05:27:54','2024-08-01 05:27:54','On'),
(34,'Morning',5,1,6,1000,16,'2024-08-01 05:28:11','2024-08-01 05:28:11','On'),
(35,'Morning',5,2,6,1200,16,'2024-08-01 05:28:27','2024-08-01 05:28:27','On'),
(36,'Morning',5,1,8,1200,16,'2024-08-01 05:29:33','2024-08-01 05:29:33','On'),
(37,'Morning',5,2,8,1500,16,'2024-08-01 05:29:45','2024-08-01 05:29:45','On'),
(38,'Morning',5,9,3,250,16,'2024-08-01 07:19:00','2024-08-01 07:19:00','On'),
(39,'Morning',5,9,4,400,16,'2024-08-01 07:19:24','2024-08-01 07:19:24','On'),
(40,'Morning',5,9,6,500,16,'2024-08-01 07:19:45','2024-08-01 07:19:45','On'),
(41,'Morning',5,9,8,600,16,'2024-08-01 07:20:05','2024-08-10 22:51:59','On'),
(42,'Morning',5,10,3,350,16,'2024-08-01 07:20:28','2024-08-01 07:20:28','On'),
(43,'Morning',5,10,4,500,16,'2024-08-01 07:20:52','2024-08-01 07:20:52','On'),
(44,'Morning',5,14,3,0,16,'2024-08-01 08:19:59','2024-08-01 08:19:59','On'),
(45,'Morning',5,15,3,100,16,'2024-08-01 08:22:23','2024-08-01 08:22:23','On'),
(46,'Morning',5,16,3,300,16,'2024-08-01 08:22:40','2024-08-01 08:22:40','On'),
(47,'Morning',5,17,3,400,16,'2024-08-01 08:22:50','2024-08-01 08:22:50','On'),
(48,'Morning',5,14,4,0,16,'2024-08-01 08:23:26','2024-08-01 08:23:26','On'),
(49,'Morning',5,15,4,100,16,'2024-08-01 08:23:38','2024-08-01 08:23:38','On'),
(50,'Morning',5,16,4,300,16,'2024-08-01 08:23:51','2024-08-01 08:23:51','On'),
(51,'Morning',5,17,4,400,16,'2024-08-01 08:24:04','2024-08-01 08:24:04','On'),
(52,'Morning',5,14,6,0,16,'2024-08-01 08:24:29','2024-08-01 08:24:29','On'),
(53,'Morning',5,15,6,100,16,'2024-08-01 08:24:50','2024-08-01 08:24:50','On'),
(54,'Morning',5,16,6,300,16,'2024-08-01 08:25:01','2024-08-01 08:25:01','On'),
(55,'Morning',5,17,6,400,16,'2024-08-01 08:25:11','2024-08-01 08:25:11','On'),
(56,'Morning',5,14,8,0,16,'2024-08-01 08:26:27','2024-08-01 08:26:27','On'),
(57,'Morning',5,15,8,100,16,'2024-08-01 08:26:35','2024-08-01 08:26:35','On'),
(58,'Morning',5,16,8,300,16,'2024-08-01 08:26:47','2024-08-01 08:26:47','On'),
(59,'Morning',5,17,8,400,16,'2024-08-01 08:26:55','2024-08-01 08:26:55','On'),
(60,'Morning',5,10,6,600,16,'2024-08-05 08:12:25','2024-08-05 08:12:25','On'),
(61,'Morning',13,1,3,2000,16,'2024-08-09 05:10:24','2024-08-29 06:23:49','On'),
(62,'Morning',13,2,3,2000,16,'2024-08-09 05:11:24','2024-08-29 06:24:10','On'),
(63,'Morning',13,8,3,2000,16,'2024-08-09 05:15:58','2024-08-29 06:24:17','On'),
(64,'Morning',13,9,3,2000,16,'2024-08-09 05:16:42','2024-08-29 06:24:21','On'),
(65,'Morning',13,10,3,2000,16,'2024-08-09 05:18:09','2024-08-29 06:24:24','On'),
(66,'Morning',13,14,3,2000,16,'2024-08-09 05:18:09','2024-08-29 06:24:32','On'),
(67,'Morning',13,15,3,2000,16,'2024-08-09 05:18:09','2024-08-29 06:24:34','On'),
(68,'Morning',13,16,3,2000,16,'2024-08-09 05:18:09','2024-08-29 06:24:40','On'),
(69,'Morning',13,17,3,2000,16,'2024-08-09 05:18:09','2024-08-29 06:24:43','On'),
(70,'Morning',13,1,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:07','On'),
(71,'Morning',13,2,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:08','On'),
(72,'Morning',13,8,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:16','On'),
(73,'Morning',13,9,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:18','On'),
(74,'Morning',13,10,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:27','On'),
(75,'Morning',13,14,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:30','On'),
(76,'Morning',13,15,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:35','On'),
(77,'Morning',13,16,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:42','On'),
(78,'Morning',13,17,4,2000,16,'2024-08-09 05:22:13','2024-08-29 06:24:44','On'),
(79,'Morning',13,1,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:07','On'),
(80,'Morning',13,2,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:11','On'),
(81,'Morning',13,8,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:13','On'),
(82,'Morning',13,9,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:22','On'),
(83,'Morning',13,10,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:23','On'),
(84,'Morning',13,14,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:31','On'),
(85,'Morning',13,15,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:33','On'),
(86,'Morning',13,16,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:36','On'),
(87,'Morning',13,17,6,2000,16,'2024-08-09 05:25:13','2024-08-29 06:24:45','On'),
(88,'Morning',13,1,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:06','On'),
(89,'Morning',13,2,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:12','On'),
(90,'Morning',13,8,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:14','On'),
(91,'Morning',13,9,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:20','On'),
(92,'Morning',13,10,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:26','On'),
(93,'Morning',13,14,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:29','On'),
(94,'Morning',13,15,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:33','On'),
(95,'Morning',13,16,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:37','On'),
(96,'Morning',13,17,8,2000,16,'2024-08-09 05:26:28','2024-08-29 06:24:46','On'),
(98,'Morning',14,1,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:24:58','On'),
(99,'Morning',14,2,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:04','On'),
(100,'Morning',14,8,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:12','On'),
(101,'Morning',14,9,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:13','On'),
(102,'Morning',14,10,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:16','On'),
(103,'Morning',14,14,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:25','On'),
(104,'Morning',14,15,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:28','On'),
(105,'Morning',14,16,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:36','On'),
(106,'Morning',14,17,3,100,16,'2024-08-09 05:29:08','2024-08-29 06:25:38','On'),
(107,'Morning',14,1,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:00','On'),
(108,'Morning',14,2,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:06','On'),
(109,'Morning',14,8,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:11','On'),
(110,'Morning',14,9,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:15','On'),
(111,'Morning',14,10,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:18','On'),
(112,'Morning',14,14,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:24','On'),
(113,'Morning',14,15,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:29','On'),
(114,'Morning',14,16,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:32','On'),
(115,'Morning',14,17,4,100,16,'2024-08-09 05:31:01','2024-08-29 06:25:37','On'),
(116,'Morning',14,1,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:02','On'),
(117,'Morning',14,2,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:03','On'),
(118,'Morning',14,8,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:07','On'),
(119,'Morning',14,9,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:15','On'),
(120,'Morning',14,10,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:19','On'),
(121,'Morning',14,14,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:22','On'),
(122,'Morning',14,15,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:26','On'),
(123,'Morning',14,16,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:35','On'),
(124,'Morning',14,17,6,100,16,'2024-08-09 05:32:28','2024-08-29 06:25:37','On'),
(125,'Morning',14,1,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:24:55','On'),
(126,'Morning',14,2,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:05','On'),
(127,'Morning',14,8,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:08','On'),
(128,'Morning',14,9,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:14','On'),
(129,'Morning',14,10,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:17','On'),
(130,'Morning',14,14,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:23','On'),
(131,'Morning',14,15,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:27','On'),
(132,'Morning',14,16,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:31','On'),
(133,'Morning',14,17,8,100,16,'2024-08-09 05:34:43','2024-08-29 06:25:41','On'),
(134,'Morning',15,1,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:15','On'),
(135,'Morning',15,2,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:21','On'),
(136,'Morning',15,8,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:23','On'),
(137,'Morning',15,9,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:28','On'),
(138,'Morning',15,10,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:32','On'),
(139,'Morning',15,14,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:41','On'),
(140,'Morning',15,15,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:43','On'),
(141,'Morning',15,16,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:50','On'),
(142,'Morning',15,17,3,200,16,'2024-08-09 05:35:40','2024-08-29 06:26:54','On'),
(144,'Morning',15,1,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:13','On'),
(145,'Morning',15,2,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:20','On'),
(146,'Morning',15,8,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:27','On'),
(147,'Morning',15,9,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:31','On'),
(148,'Morning',15,10,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:35','On'),
(149,'Morning',15,14,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:40','On'),
(150,'Morning',15,15,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:44','On'),
(151,'Morning',15,16,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:46','On'),
(152,'Morning',15,17,4,200,16,'2024-08-09 05:37:14','2024-08-29 06:26:55','On'),
(153,'Morning',15,1,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:14','On'),
(154,'Morning',15,2,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:19','On'),
(155,'Morning',15,8,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:26','On'),
(156,'Morning',15,9,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:29','On'),
(157,'Morning',15,10,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:33','On'),
(158,'Morning',15,14,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:39','On'),
(159,'Morning',15,15,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:42','On'),
(160,'Morning',15,16,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:47','On'),
(161,'Morning',15,17,6,200,16,'2024-08-09 05:37:56','2024-08-29 06:26:52','On'),
(162,'Morning',15,1,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:16','On'),
(163,'Morning',15,2,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:17','On'),
(164,'Morning',15,8,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:22','On'),
(165,'Morning',15,9,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:29','On'),
(166,'Morning',15,10,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:34','On'),
(167,'Morning',15,14,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:37','On'),
(168,'Morning',15,15,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:45','On'),
(169,'Morning',15,16,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:51','On'),
(170,'Morning',15,17,8,200,16,'2024-08-09 05:39:28','2024-08-29 06:26:53','On');
/*!40000 ALTER TABLE `fee_head_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_vouchers`
--

DROP TABLE IF EXISTS `fee_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `fee_vouchers`
--

LOCK TABLES `fee_vouchers` WRITE;
/*!40000 ALTER TABLE `fee_vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heads`
--

DROP TABLE IF EXISTS `heads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `head_name` varchar(100) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heads`
--

LOCK TABLES `heads` WRITE;
/*!40000 ALTER TABLE `heads` DISABLE KEYS */;
INSERT INTO `heads` VALUES
(5,'Tuition Fee',16,'On','2024-07-10 10:39:22','2024-07-30 16:10:24'),
(7,'Student Fund',16,'On','2024-07-23 05:24:22','2024-07-30 16:10:24'),
(13,'Admission Fee',16,'On','2024-08-09 05:08:52','2024-08-09 05:08:52'),
(14,'Sports Fee',16,'On','2024-08-09 05:08:58','2024-08-09 05:08:58'),
(15,'Exam Fee',16,'On','2024-08-09 05:09:02','2024-08-09 05:09:02');
/*!40000 ALTER TABLE `heads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` bigint(20) NOT NULL,
  `item` bigint(20) NOT NULL,
  `price` varchar(50) NOT NULL,
  `quantity` varchar(50) NOT NULL,
  `discount` varchar(50) NOT NULL,
  `price_after_discount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `type` varchar(100) NOT NULL,
  `army_no` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `rank` varchar(100) DEFAULT NULL,
  `unit` varchar(100) DEFAULT NULL,
  `stock_id` bigint(20) DEFAULT 0,
  `gst` bigint(20) DEFAULT 0,
  `invoice_date` varchar(100) DEFAULT NULL,
  `total` varchar(50) GENERATED ALWAYS AS (`price_after_discount` * `quantity`) STORED,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=308 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `items` varchar(50) NOT NULL,
  `category` bigint(20) DEFAULT 0,
  `price` varchar(50) NOT NULL,
  `discount` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `rack_no` varchar(100) DEFAULT NULL,
  `formula` varchar(100) DEFAULT NULL,
  `unit_type` varchar(100) NOT NULL,
  `gst` bigint(20) DEFAULT 0,
  `manufacturer` varchar(100) DEFAULT NULL,
  `medicine_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=439 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES
(89,'Panadol',16,'0','0','2025-02-09 10:29:25','10','-','No',18,'',NULL),
(90,'Calpol',16,'0','0','2025-02-09 10:29:25','10','-','No',18,'',NULL),
(91,'cap combiviar 400mg',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(92,'lowplat 75 mg tab',11,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(93,'somogel ',20,'','','2025-02-09 10:29:25','-','-','Gram',0,'',NULL),
(94,'bupicaine sp inj',21,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(95,'abdominal -sponge',22,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(96,'ketamine inj ',22,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(97,'Extor 5/80 mg Tab',24,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(98,'Combiviar 200mg Cap ',27,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(99,'Abdominal Sponge ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(100,'Mecobal 500mg Inj ',25,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(101,'Osnate-D Tab ',29,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(102,'Methycobal 500mg Inj ',30,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(103,'Neurobion Tab ',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(104,'Gabica 75mg Cap ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(106,'Xecpt 10mg Tab ',18,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(107,'Covam 10/160mg Tab ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(108,' Conaz  Lotion 60ml',34,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(109,'Pulmanol 120ml Syp ',35,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(110,'Toot Siah 120ml Syp',36,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(111,'Sitaglumet 50/1000mg Tab ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(112,'Rovista 10mg Tab ',38,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(113,'Nogerd 50mg Tab ',39,'0','0','2025-02-09 10:29:25','-','-','No',0,'Helix ',NULL),
(114,'Knee Brace ',41,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(115,'Enterogermina 2B Amp',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(116,'Empaglimenp- 12.5/1000mg Tab ',43,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(117,'Primulot-N Tab ',44,'0','0','2025-02-09 10:29:25','-','-','No',0,'Bayer ',NULL),
(118,'Taravocort 10gm Cream ',44,'0','0','2025-02-09 10:29:25','-','-','No',0,'Bayer ',NULL),
(119,'Tiovair 18Mcg Cap',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(120,'GTN 0.2% Ointment ',46,'0','0','2025-02-09 10:29:25','-','-','No',0,'Salam Pharma ',NULL),
(121,'Arinac  120ml Syp',20,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(122,'Tres- Orix 120ml Syp',17,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(123,'Claforan 0.5Gm Inj',42,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sanofi ',NULL),
(124,'Fefolvit  Cap ',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(125,'Nospa- Forte Tab ',42,'0','0','2025-02-09 10:29:25','','-','No',0,'Sanofi ',NULL),
(126,'Lipiget 20mg Tab ',NULL,'0','0','2025-02-09 10:29:25','-','-','No',0,'-','medicine'),
(127,'Surbex- Z Tab ',NULL,'0','0','2025-02-09 10:29:25','-','-','No',0,'-','medicine'),
(128,'Acefyl 120ml Syp',NULL,'0','0','2025-02-09 10:29:25','-','-','No',0,'-','medicine'),
(129,'Corex-D 120ml Syp',NULL,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'-','disposable'),
(130,'Indrop-D 200000IU',52,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Neutro Pharma',NULL),
(131,'Rifixa 550mg Tab',53,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ferozsons',NULL),
(132,'Cyclogest Passery 200mg Tab ',22,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(133,'Gravibinan 1ml Inj ',44,'','','2025-02-09 10:29:25','-','-','ml',0,'Bayer ',NULL),
(134,'Danzen DS Tab ',39,'0','0','2025-02-09 10:29:25','-','-','No',0,'Helix ',NULL),
(135,'M-Silreta 50/1000mg Tab ',56,'0','0','2025-02-09 10:29:25','-','-','No',0,'Amsons',NULL),
(136,'Rivotril 0.5mg Tab ',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(137,'Flux 20mg Cap ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(138,'Zoldip 15mg Tab ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(139,'Vidaylin- L 120ml Syp',20,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(140,'Hydrozole 20 gm Cream',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(141,'Colic Drops ',57,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Brick',NULL),
(142,'Motililum 120ml Syp',59,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Aspin ',NULL),
(143,'Panadol Drops ',16,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(144,'Gaviscon 120ml Syp',60,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Reckitt',NULL),
(145,'Artem 60ml Syp',37,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Hilton',NULL),
(146,'Xyloaid with - Adr 2% Inj',61,'0','0','2025-02-09 10:29:25','-','-','ml',0,'BH',NULL),
(147,'I.V - Cannula 24 No',62,'0','0','2025-02-09 10:29:25','-','-','No',0,'Master',NULL),
(148,'Dobutamine Inj',23,'0','0','2025-02-09 10:29:25','','-','ml',0,'',NULL),
(149,'Xyloaid 2% Inj',61,'0','0','2025-02-09 10:29:25','','-','ml',0,'BH',NULL),
(150,'Kestine 10mg Tab ',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(151,'Zeegap 75mg Cap',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(152,'Skilax 30ml Drops',17,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(153,'Gonadil - F Cap',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(154,'Letrowrd 2.5mg Tab ',64,'0','0','2025-02-09 10:29:25','-','-','No',0,'Welwrd',NULL),
(155,'Femtoll- D Sachet ',67,'0','0','2025-02-09 10:29:25','-','-','No',0,'Faisons',NULL),
(156,'Vibramycin 100mg Cap ',51,'0','0','2025-02-09 10:29:25','-','-','No',0,'Pfizer',NULL),
(157,'Epival 500mgTab ',20,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(158,'Tonoflex- P Tab ',68,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sami ',NULL),
(159,'Airtal 100mg Tab ',17,'0','0','2025-02-09 10:29:25','','-','No',0,'',NULL),
(160,'Enziclor M/W',69,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Platinum',NULL),
(161,'HCV - Kit ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(162,'Prolene Mash 6/11',70,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ethicon',NULL),
(163,'Adalat L/A Tab ',44,'0','0','2025-02-09 10:29:25','-','-','No',0,'Bayer ',NULL),
(164,'CTG Roll',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(165,'ECG Roll',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(166,'Claforan 0.25mg Inj',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(167,'Enflor Sachet ',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(168,'Entamizole 90ml',20,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(169,'Sani Plast ',73,'0','0','2025-02-09 10:29:25','-','-','No',0,'Uniferoz',NULL),
(170,'25% Dextrose ',75,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Outsuka',NULL),
(171,'Three Way Stopper with Tail ',77,'0','0','2025-02-09 10:29:25','-','-','No',0,'China ',NULL),
(172,'Streptokinase 1500000IU',20,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(173,'Cefim DS Syp ',68,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Sami ',NULL),
(174,'Xynosine Nosal Spary Adult',78,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Zafa ',NULL),
(175,'Avsar 5/160mg Tab ',18,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(176,'Deramovate 20gm Cream ',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(177,'Dermovate 20gm Ointment ',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(178,'Piriton 4mg Tab ',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(179,'Scabion Lotiion ',79,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Atco',NULL),
(180,'Calamine Lotion',80,'0','0','2025-02-09 10:29:25','-','-','No',0,'Jawa ',NULL),
(181,'Xeltrol 10mg Tab ',42,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sanofi ',NULL),
(182,'Thyroxine 50mg Tab ',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(183,'Sitamet 50/1000mg Tab',35,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(184,'Zeegap 100mg Cap ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(185,'Sofvasc 10mg Tab ',10,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(186,'Actim 2.5mg Tab ',68,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sami ',NULL),
(187,'Xaltide Inhaler 100/50mcg',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(188,'Tryptanol 25mg Tab',82,'0','0','2025-02-09 10:29:25','-','-','No',0,'OBS',NULL),
(189,'Dulan 30mg Cap ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(190,'Eziday 50mg Tab',86,'0','0','2025-02-09 10:29:25','-','-','No',0,'Werrick',NULL),
(191,'Muconyl 60ml Syp',61,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'BH',NULL),
(192,'Neo- Mercazole 5mg Tab',88,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ray Pharma',NULL),
(193,'Dijex -MP 120ml Syp',89,'0','0','2025-02-09 10:29:25','-','','ml',0,'Abbott',NULL),
(194,'Ventilator Filter ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(195,'Ventilator Circit Peads ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(196,'Mannitol 500ml Inj',90,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Enzon',NULL),
(197,'dopamine 40mg Inj',21,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(198,'Dimpa MXR 12.5/1000mg Tab',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(199,'Concor 2.5mg Tab',NULL,'0','0','2025-02-09 10:29:25','-','-','No',0,'Rifa Pharma','medicine'),
(200,'Baclin 10mg Tab ',92,'0','0','2025-02-09 10:29:25','-','-','No',0,'Rifa Pharma','medicine'),
(201,'Glucostrips ',93,'0','0','2025-02-09 10:29:25','-','-','No',0,'Oncall',NULL),
(202,'Cadla 0.5mg Tab',95,'0','0','2025-02-09 10:29:25','-','-','No',0,'Macter',NULL),
(203,'Bon- One Tab',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(204,'Carveda 6.25mg Tab ',53,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ferozsons',NULL),
(205,'Sacvan 50mg Tab ',18,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(206,'Dapa 10mg Tab ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(207,'Vastartal MR 35mg Tab ',97,'0','0','2025-02-09 10:29:25','-','-','No',0,'Servier',NULL),
(208,'Epiliron 25mg Tab ',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(209,'Ranola 500mg Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(210,'Daonil 5mg Tab ',42,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sanofi ',NULL),
(211,'Disprin Tab',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(212,'Extor 5/160mg Tab',24,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(213,'Ganaton 50mg ',89,'0','0','2025-02-09 10:29:25','-','-','No',0,'Abbott',NULL),
(214,'Covam Plus 10/160 /12.5mg Tab',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(215,'Coversyl 4mg Tab',97,'0','0','2025-02-09 10:29:25','-','-','No',0,'Servier',NULL),
(216,'Coferb 120ml Syp',30,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(217,'Coferb Plus 120ml Syp',30,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(218,'Evion 400mg Cap',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(219,'Envepe 10mg Tab ',98,'0','0','2025-02-09 10:29:25','-','-','No',0,'RG Pharma',NULL),
(220,'Onset 8mg Tab ',82,'0','0','2025-02-09 10:29:25','-','-','No',0,'OBS',NULL),
(221,'Onset 4ml Inj',82,'0','0','2025-02-09 10:29:25','-','-','No',0,'OBS',NULL),
(222,'Onseron 25ml Syp',99,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Indux',NULL),
(223,'Septran DS Tab',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(224,'Vildomet 50/1000mg Tab',43,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(225,'Advant 8mg Tab ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(226,'Dulan 60mg Cap',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(227,'Levopride 50mg Tab',100,'0','0','2025-02-09 10:29:25','-','-','No',0,'Pacifac',NULL),
(228,'Ramipace 5mg Tab ',18,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(229,'Colofac 135mg Tab ',89,'0','0','2025-02-09 10:29:25','-','-','No',0,'Abbott',NULL),
(230,'Brotin 2.5mg Tab ',102,'0','0','2025-02-09 10:29:25','-','-','No',0,'Shaigan',NULL),
(231,'KCL (Potassium Choloride)',75,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Outsuka',NULL),
(232,'Cran Max Sachit ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(233,'Otosporin 5ml Ear Drops ',16,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(234,'Citralka 120ml Syp',104,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'LCI',NULL),
(235,'Calpol 6 plus Syp',16,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(236,'Ulcenil 120ml Syp',106,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Siza Pharma',NULL),
(237,'Aminoleban 500ml Inj',107,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Otsuka',NULL),
(238,'Vorif 100mg Tab',53,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ferozsons',NULL),
(239,'Lipirex 20mg Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(240,'Librax Dragees 5mg Tab ',108,'0','0','2025-02-09 10:29:25','-','-','No',0,'Meda ',NULL),
(241,'Softin 10mg Tab',86,'0','0','2025-02-09 10:29:25','-','-','No',0,'Werrick',NULL),
(242,'Paraxyl CR 12.5mg  Tab ',35,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(243,'Neoprox 500mg Tab',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(244,'Dicloran Emugel  ',68,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sami ',NULL),
(245,'Spinal Needle 25G ',110,'0','0','2025-02-09 10:29:25','-','-','No',0,'B-Braun',NULL),
(246,'Mepore Dressing',111,'0','0','2025-02-09 10:29:25','-','-','No',0,'Health Care ',NULL),
(247,'Citolin 30ml Syp',112,'0','0','2025-02-09 10:29:25','-','-','No',0,'Global',NULL),
(248,'Umbilica 10gm gell',79,'0','0','2025-02-09 10:29:25','-','-','No',0,'Atco',NULL),
(249,'Qalsium D Tab',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(250,'Cutis Lotion',79,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Atco',NULL),
(251,'Dot-S Tab ',114,'0','0','2025-02-09 10:29:25','-','-','No',0,'Oscar',NULL),
(252,'Comforta 10mg Tab ',115,'0','0','2025-02-09 10:29:25','-','-','No',0,'MAQ ',NULL),
(253,'Lalap 50mg Tab ',116,'0','0','2025-02-09 10:29:25','-','-','No',0,'Genix ',NULL),
(254,'Ivermite 6mg Tab',79,'0','0','2025-02-09 10:29:25','-','-','No',0,'Atco',NULL),
(255,'Triforge 5/160/12.5mg Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(256,'Diampa 10mg Tab ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(257,'Dulan 30 mg Cap',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(258,'Lipiget 10mg Tab',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(259,'Empaa MXR 12.5/1000mg Tab',117,'0','0','2025-02-09 10:29:25','-','-','No',0,'Horizon',NULL),
(260,'Cartigen Tab',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(261,'Iberet Folic 500mg Tab',89,'0','0','2025-02-09 10:29:25','-','-','No',0,'Abbott',NULL),
(262,'Empaa 25mg Tab',117,'0','0','2025-02-09 10:29:25','-','-','No',0,'Horizon',NULL),
(263,'Amaryl 2mg Tab ',49,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(264,'Travatan 2.5ml Eye Drops',118,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Novartis',NULL),
(265,'2Blink Eye Drops',119,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Santa',NULL),
(266,'Vildomet 50/500mg Tab',43,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(267,'Rast 10mg Tab ',121,'0','0','2025-02-09 10:29:25','-','-','No',0,'Tabros',NULL),
(268,'Moxiget 400mg /250ml Infusion ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(269,'Claforan 1gm Inj',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(270,'Paeds Solution 500ml',90,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Enzon',NULL),
(271,'Ansaid 100mg Tab',51,'0','0','2025-02-09 10:29:25','-','-','No',0,'Pfizer',NULL),
(272,'Vagibact Vaginal 40gm Cream ',25,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'',NULL),
(273,'TobraDex 5ml Eye Drops',123,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Alcon',NULL),
(274,'Norsaline-P Nasal 30ml Drops',79,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Atco',NULL),
(275,'Lerace 60ml Syp',30,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(276,'Lerace 30ml Syp',30,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(277,'Carveda 12.5mg Tab',53,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ferozsons',NULL),
(278,'Gravinate 50mg Tab ',24,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(279,'Travogen 10gm Cream ',44,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'Bayer ',NULL),
(280,'Polyfax 6gm Eye Oinement ',16,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'',NULL),
(281,'Solifen 5mg Tab ',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(282,'Solifen 10mg Tab',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(283,'Calzem 30mg Tab ',125,'0','0','2025-02-09 10:29:25','-','-','No',0,'Maple Pharma',NULL),
(284,'Provate-G 15 Gm Cream',128,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'Saffron',NULL),
(285,'Zyloric 100mg Tab',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(286,'FML 5ml Eye Drops',130,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Allergan ',NULL),
(287,'Methachlor 5ml Eye Drops',132,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Remington',NULL),
(288,'Xenglumet 12.5/500mg Tab ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(289,'Concor 5mg  Tab',NULL,'0','0','2025-02-09 10:29:25','-','-','No',0,'Rifa Pharma','medicine'),
(290,'Cardace 5mg tab',78,'0','0','2025-02-09 10:29:25','-','-','No',0,'Zafa ',NULL),
(291,'Drate 70mg tab',24,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(292,'Neogab 100mg cap',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(293,'Ibnate 150mg tab',116,'0','0','2025-02-09 10:29:25','-','-','No',0,'Genix ',NULL),
(294,'Macnaz 10gm Oral gel',135,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'Opal Pharma',NULL),
(295,'Nasal Prong Neonate ',77,'0','0','2025-02-09 10:29:25','-','-','No',0,'China ',NULL),
(296,'Vitamin-K 1ml Inj',23,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(297,'Hydralazine Tab',78,'0','0','2025-02-09 10:29:25','-','-','No',0,'Zafa ',NULL),
(298,'Ivaset 5mg Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(299,'Abhayrab (Rabies Vaccine)',104,'0','0','2025-02-09 10:29:25','-','-','ml',0,'LCI',NULL),
(300,'Nitronal 10ml Inj',136,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Pohl Boskamp',NULL),
(301,'Phenobarbitone 2ml Inj',23,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(302,'Phenergan',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(303,'Protamin Sulphate Inj',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(304,'Haemaccel 500ml Inj',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(305,'Amiodarone 2ml Inj',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(306,'Terlip 1mg Inj',33,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(307,'Calan 2ml Inj',24,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(308,'Wrist Brace Large Size',40,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(309,'Nevanac 5ml Eye Drops ',123,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Alcon',NULL),
(310,'Monitor 2.5mg Tab ',86,'0','0','2025-02-09 10:29:25','-','-','No',0,'Werrick',NULL),
(311,'Rigex 10mg Tab',29,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(312,'Trimetabol 120ml Syp',68,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Sami ',NULL),
(313,'Guaddle Airway Paeds ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(314,'Suction Catheter 8FR',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(315,'NG Tube 8FR',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(316,'NG Tube 16FR',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(317,'Face Mask ',62,'0','0','2025-02-09 10:29:25','-','-','No',0,'Master',NULL),
(318,'Imatat (Tetnus TT) Inj',55,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(319,'Nitromint Patch ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(320,'Guaddle Airway Green',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(321,'Guaddle Airway (Yellwo)',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(322,'NG Tube 12FR',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(323,'Disp Syringe 20cc ',62,'0','0','2025-02-09 10:29:25','-','-','No',0,'Master',NULL),
(324,'Silk 3/0',70,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ethicon',NULL),
(325,'Philadelphia Collar ',40,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(326,'Foleys Catheter 8FR',137,'0','0','2025-02-09 10:29:25','-','-','No',0,'life Care',NULL),
(327,'Foleys Catheter 10FR',137,'0','0','2025-02-09 10:29:25','-','-','No',0,'life Care',NULL),
(328,'Foleys Catheter 12FR',137,'0','0','2025-02-09 10:29:25','-','-','No',0,'life Care',NULL),
(329,'Foleys Catheter 14FR',137,'0','0','2025-02-09 10:29:25','-','-','No',0,'life Care',NULL),
(330,'Magnesium Sulphate 10ml Inj',78,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Zafa ',NULL),
(331,'Verapamil Inj',23,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(332,'Tegaderm Dressing ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(333,'Alchol Swab ',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(334,'Epigran 5ml Inj',79,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Atco',NULL),
(335,'CVP Line 12FR',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(336,'Digoxin 2ml Inj',23,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(337,'Thermometers',137,'0','0','2025-02-09 10:29:25','-','-','No',0,'life Care',NULL),
(338,'Cefstar 500mg Inj',61,'0','0','2025-02-09 10:29:25','-','-','ml',0,'BH',NULL),
(339,'Ucefore 500mg Inj',138,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Advin Pharma',NULL),
(340,'Cefstar 1gm Inj',61,'0','0','2025-02-09 10:29:25','-','-','ml',0,'BH',NULL),
(341,'Acylex 10gm Cream',53,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'Ferozsons',NULL),
(342,'Deprox 20mg Cap',144,'0','0','2025-02-09 10:29:25','-','-','No',0,'IDI Pharma',NULL),
(343,'Daflon 500mg Tab',97,'0','0','2025-02-09 10:29:25','-','-','No',0,'Servier',NULL),
(344,'Rashnil 50gm Cream',20,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'',NULL),
(345,'Arinac  Forte Tab',20,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(346,'Lodopin 5mg Tab',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(347,'Lacolep 50mg Tab',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(348,'Aldactone 100mg Tab',24,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(349,'Breekey 200mg Tab',68,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sami ',NULL),
(350,'Cefim 30ml Syp',30,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(351,'Onset Drop',82,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'OBS',NULL),
(352,'Cefeget 30ml Syp',33,'0','0','2025-02-09 10:29:25','-','-','ml',0,'',NULL),
(353,'No-Spa 40mg Tab',42,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sanofi ',NULL),
(354,'Citolin 500gm Tab',112,'0','0','2025-02-09 10:29:25','-','-','No',0,'Global',NULL),
(355,'Qusel 25mg Tab',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(356,'Xcept 10mg Tab',18,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(357,'Dignity Sheet',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(358,'Disp Protoscope (Paeds Size)',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(359,'Digas 20ml Drops ',146,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Medics',NULL),
(360,'Duphaston 10mg Tab',20,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(361,'Paedi-Care 500ml Liquid ',147,'0','0','2025-02-09 10:29:25','-','-','No',0,'Woodwords ',NULL),
(362,'Clycin-T 30ml Lotion',102,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Shaigan',NULL),
(363,'Calamox 156.25mg 90ml Syp',148,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Bosch',NULL),
(364,'Xynosine CF Nasal Drops',78,'0','0','2025-02-09 10:29:25','-','-','No',0,'Zafa ',NULL),
(365,'T -Day 90ml Syp',68,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Sami ',NULL),
(366,'Terbisil 125mg Tab',128,'0','0','2025-02-09 10:29:25','-','-','No',0,'Saffron',NULL),
(367,'Cremaffin 120ml Syp',20,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(368,'Bamifix 600mg Tab',149,'0','0','2025-02-09 10:29:25','-','-','No',0,'Chiesi Pharma',NULL),
(369,'Coferb 20ml Droops',30,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(370,'Ponstan Forte Tab',51,'0','0','2025-02-09 10:29:25','-','-','No',0,'Pfizer',NULL),
(371,'Mucolator 200mg Sachit',20,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(372,'A Max Drops',151,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Matrix ',NULL),
(373,'NG Tube 14FR',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(374,'Nasal - Prong (Paeds)',23,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(375,'Uceforce 1gm Inj',138,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Advin Pharma',NULL),
(376,'Polysling Adult Size ',40,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(377,'Aminophyllin 10ml ',61,'0','0','2025-02-09 10:29:25','-','-','ml',0,'BH',NULL),
(378,'Knee Brace Large Size',40,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(379,'Rapicort 5mg Tab',121,'0','0','2025-02-09 10:29:25','-','-','No',0,'Tabros',NULL),
(380,'Myteka 4mg  Sachit ',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(381,'Rapicort 120ml Syp',121,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Tabros',NULL),
(382,'Caricef 30ml Syp',68,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Sami ',NULL),
(383,'Softin 60ml Syp ',86,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Werrick',NULL),
(384,'Diampa 25 mg Tab',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(385,'Misar-H 40/12.5mg Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(386,'Tiovair -F Cap',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(387,'I.Con 100mg Cap',53,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ferozsons',NULL),
(388,'Terbiderm 10gm Cream',79,'0','0','2025-02-09 10:29:25','-','-','Gram',0,'Atco',NULL),
(389,'ITP 50mg Tab',68,'0','0','2025-02-09 10:29:25','-','-','No',0,'Sami ',NULL),
(390,'Imodium 2mg cap',59,'0','0','2025-02-09 10:29:25','-','-','No',0,'Aspin ',NULL),
(391,'Quibron- T /SR 300mg Tab',16,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(392,'Calan 80mg Tab',24,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(393,'Claforan 0.5mg Inj',42,'0','0','2025-02-09 10:29:25','-','-','ml',0,'Sanofi ',NULL),
(394,'ORS Sachit',153,'0','0','2025-02-09 10:29:25','-','-','No',0,'Indus',NULL),
(395,'Seretide 25/225mcg Inhaler ',16,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(396,'Hitop 50mg Tab',30,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(397,'Suction Tube with younker',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(398,'Triforge 10/160/12.5mg  Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(399,'Pelton -V Tab',112,'0','0','2025-02-09 10:29:25','-','-','No',0,'Global',NULL),
(400,'Cytopan 75mg Tab',33,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(401,'Provate -S 30ml Lotion',128,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Saffron',NULL),
(402,'Jovit Tab',102,'0','0','2025-02-09 10:29:25','-','-','No',0,'Shaigan',NULL),
(403,'Renitec 5mg Tab',82,'0','0','2025-02-09 10:29:25','-','-','No',0,'OBS',NULL),
(404,'Lodopin 10mg Tab',32,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(405,'Epiban 5mg Tab',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(406,'Citanew 10mg Tab',30,'0','0','2025-02-09 10:29:25','','-','No',0,'',NULL),
(407,'Brivera 120ml Syp',39,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Helix ',NULL),
(408,'Epitoin 120ml Syp',154,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Adamjee ',NULL),
(409,'Brufen DS 90ml Syp',20,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'',NULL),
(410,'Caflam 50mg Tab',118,'0','0','2025-02-09 10:29:25','-','-','No',0,'Novartis',NULL),
(411,'ID Bracelet Adult Size',137,'0','0','2025-02-09 10:29:25','-','-','No',0,'life Care',NULL),
(412,'Nitrofurantoin 100mg Tab',155,'0','0','2025-02-09 10:29:25','-','-','No',0,'Glitz',NULL),
(413,'Revolizer Device',17,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(414,'Vicryl 3/0 70cm',70,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ethicon',NULL),
(415,'Vicryl 4/0 70cm',70,'0','0','2025-02-09 10:29:25','-','-','No',0,'Ethicon',NULL),
(416,'Naloxo-X 1ml Inj',156,'0','0','2025-02-09 10:29:25','-','-','No',0,'Bajwa',NULL),
(417,'Loprissor 5ml Inj',23,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(418,'Eziday 25mg Tab',86,'0','0','2025-02-09 10:29:25','-','-','No',0,'Werrick',NULL),
(419,'Co-Dorzal 5ml Eye Drops',119,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Santa',NULL),
(420,'Valtec 80mg Tab',121,'0','0','2025-02-09 10:29:25','-','-','No',0,'Tabros',NULL),
(421,'Simbrinza 5ml Eye Drops',118,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Novartis',NULL),
(422,'Xalacom 2.5ml Eye Drops',51,'0','0','2025-02-09 10:29:25','-','-','Bottle',0,'Pfizer',NULL),
(423,'Sitamet 50/500mg Tab',35,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(424,'Cytotrexate 10mg tab',21,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(425,'Sulvorid 25mg tab',43,'0','0','2025-02-09 10:29:25','-','-','No',0,'',NULL),
(426,'Gempid 600mg Tab',79,'0','0','2025-02-09 10:29:25','-','-','No',0,'Atco',NULL),
(428,'Disp Syringe 10ml/CC',0,'0','0','2025-02-09 10:29:25','-','-','No',18,'Medicare','disposable'),
(429,'Aldomet 250mg Tab',0,'0','0','2025-02-09 10:29:25','-','Methydopa (USP)','No',0,'Searle',NULL),
(430,'Leflox 500mg Tab',0,'0','0','2025-02-09 10:29:25','-','Levofloxacin','No',0,'Getz',NULL),
(431,'Focin Ultra Sachet ',0,'0','0','2025-02-09 10:29:25','-','Fosfomycin Trometamol','No',0,'Tabros',NULL),
(435,'testeteat',NULL,'0','0','2025-02-15 05:20:21','10','-','No',30,'s','medicine'),
(436,'testsdsfsdsd',NULL,'0','0','2025-02-15 14:22:21','10','abc','No',0,'abc','medicine'),
(437,'Baclin 10mg Tab ',0,'0','0','2025-02-18 17:31:14','10','ABC','No',0,'test','medicine'),
(438,'etest',0,'0','0','2025-02-18 18:28:22','10','ABC','No',0,'Rifa Pharma','medicine');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_type`
--

DROP TABLE IF EXISTS `leave_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `leave_type`
--

LOCK TABLES `leave_type` WRITE;
/*!40000 ALTER TABLE `leave_type` DISABLE KEYS */;
INSERT INTO `leave_type` VALUES
(1,'Casual Leave','On','2024-08-22 05:28:49','2024-08-22 05:28:49'),
(2,'Medical  Leave','On','2024-08-22 05:28:49','2024-08-22 05:33:23'),
(4,'Short Leave','On','2024-08-22 05:28:49','2024-08-22 05:30:57');
/*!40000 ALTER TABLE `leave_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `overtime`
--

DROP TABLE IF EXISTS `overtime`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `overtime`
--

LOCK TABLES `overtime` WRITE;
/*!40000 ALTER TABLE `overtime` DISABLE KEYS */;
INSERT INTO `overtime` VALUES
(1,'2024-09-01',103,10,16,1,'2024-10-01 15:23:32','2024-10-02 07:11:44'),
(2,'2024-10-01',103,10,16,1,'2024-10-01 15:23:32','2024-10-01 15:23:32');
/*!40000 ALTER TABLE `overtime` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pay_scale`
--

DROP TABLE IF EXISTS `pay_scale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `pay_scale`
--

LOCK TABLES `pay_scale` WRITE;
/*!40000 ALTER TABLE `pay_scale` DISABLE KEYS */;
INSERT INTO `pay_scale` VALUES
(14,'Regular','PS-1','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(15,'Contract','PS-1','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(16,'Daily Wages','PS-1','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(17,'Regular','PS-2','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(18,'Contract','PS-2','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(19,'Daily Wages','PS-2','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(20,'Regular','PS-3','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(21,'Contract','PS-3','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(22,'Daily Wages','PS-3','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(23,'Regular','PS-4','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(24,'Contract','PS-4','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(25,'Daily Wages','PS-4','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(26,'Regular','PS-5','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(27,'Contract','PS-5','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(28,'Daily Wages','PS-5','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(29,'Regular','PS-6','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(30,'Contract','PS-6','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(31,'Daily Wages','PS-6','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(32,'Regular','PS-7','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(33,'Contract','PS-7','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(34,'Daily Wages','PS-7','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(35,'Regular','PS-8','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(36,'Contract','PS-8','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(37,'Daily Wages','PS-8','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(38,'Regular','PS-9','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(39,'Contract','PS-9','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(40,'Daily Wages','PS-9','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(41,'Regular','PS-10','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(42,'Contract','PS-10','On','2024-08-29 05:20:48','2024-08-29 05:20:48'),
(43,'Daily Wages','PS-10','On','2024-08-29 05:20:48','2024-08-29 05:20:48');
/*!40000 ALTER TABLE `pay_scale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pay_scale_wise_basic_salary`
--

DROP TABLE IF EXISTS `pay_scale_wise_basic_salary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pay_scale_wise_basic_salary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pay_scale_id` bigint(100) NOT NULL,
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
-- Dumping data for table `pay_scale_wise_basic_salary`
--

LOCK TABLES `pay_scale_wise_basic_salary` WRITE;
/*!40000 ALTER TABLE `pay_scale_wise_basic_salary` DISABLE KEYS */;
INSERT INTO `pay_scale_wise_basic_salary` VALUES
(5,14,6000,400,1500,8,'2024-09-02 07:18:05','2024-10-07 06:50:01'),
(6,17,7000,500,2437,8,'2024-09-02 07:21:50','2024-10-07 07:01:40'),
(7,20,8000,600,2250,8,'2024-09-02 07:22:14','2024-10-07 07:01:47'),
(8,23,10000,700,2438,8,'2024-09-02 07:22:43','2024-10-07 07:01:54'),
(9,26,15000,800,2625,8,'2024-09-02 07:23:10','2024-10-07 07:02:07'),
(10,29,20000,900,0,8,'2024-09-02 07:23:37','2024-10-07 06:56:24'),
(11,32,25000,1200,4200,8,'2024-09-02 07:24:43','2024-10-07 07:02:19'),
(12,35,35000,1200,5250,8,'2024-09-02 07:25:39','2024-10-07 07:36:37'),
(13,38,57500,1500,0,8,'2024-09-02 07:26:29','2024-10-07 07:02:32'),
(14,15,16000,800,0,8,'2024-09-02 07:36:40','2024-09-02 07:36:40'),
(15,18,18000,1000,0,8,'2024-09-02 07:37:42','2024-09-02 07:37:42'),
(16,21,22000,1200,0,8,'2024-09-02 07:38:23','2024-09-02 07:38:23'),
(17,24,25000,1400,0,8,'2024-09-02 07:39:11','2024-09-02 07:39:11'),
(18,27,27000,1600,0,8,'2024-09-02 07:39:39','2024-09-02 07:39:39'),
(19,30,35000,1800,0,8,'2024-09-02 07:40:00','2024-09-02 07:40:00'),
(20,33,40000,2000,0,8,'2024-09-02 07:40:23','2024-09-02 07:40:23'),
(21,36,65000,2400,0,8,'2024-09-02 07:40:42','2024-09-02 07:40:42'),
(22,39,75000,3000,0,8,'2024-09-02 07:41:02','2024-09-02 07:41:02'),
(23,42,90000,5000,0,8,'2024-09-02 07:42:39','2024-09-02 07:42:39');
/*!40000 ALTER TABLE `pay_scale_wise_basic_salary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary`
--

DROP TABLE IF EXISTS `salary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `salary`
--

LOCK TABLES `salary` WRITE;
/*!40000 ALTER TABLE `salary` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_categories`
--

DROP TABLE IF EXISTS `school_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `school_categories`
--

LOCK TABLES `school_categories` WRITE;
/*!40000 ALTER TABLE `school_categories` DISABLE KEYS */;
INSERT INTO `school_categories` VALUES
(1,'POF','On','2024-07-03 07:43:29'),
(2,'NON POF','On','2024-07-03 07:43:29'),
(3,'POF HALF','On','2024-07-03 07:43:29'),
(4,'POF FULL','On','2024-07-03 07:43:29'),
(5,'SSES 1st CHILD','On','2024-07-03 07:43:29'),
(6,'SSES 2nd CHILD','On','2024-07-03 07:43:29'),
(7,'SSES 3rd CHILD','On','2024-07-03 07:43:29'),
(8,'Orphans','On','2024-07-03 07:43:29'),
(9,'Sibling POF','On','2024-07-03 07:43:29'),
(10,'Sibling NPOF','On','2024-07-03 07:43:29'),
(14,'Orphan 0','On','2024-07-03 07:43:29'),
(15,'Orphan 100','On','2024-07-03 07:43:29'),
(16,'Orphan 300','On','2024-07-03 07:43:29'),
(17,'Orphan 400','On','2024-07-03 07:43:29');
/*!40000 ALTER TABLE `school_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_employee_attendance`
--

DROP TABLE IF EXISTS `school_employee_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `school_employee_attendance`
--

LOCK TABLES `school_employee_attendance` WRITE;
/*!40000 ALTER TABLE `school_employee_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `school_employee_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_employees`
--

DROP TABLE IF EXISTS `school_employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `school_employees`
--

LOCK TABLES `school_employees` WRITE;
/*!40000 ALTER TABLE `school_employees` DISABLE KEYS */;
INSERT INTO `school_employees` VALUES
(108,'01','2008-02-01',8,6,35,'Mrs. Sajeela Rani','Asad Mehmood','-','-','Female','2024-10-01','0','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010033585440010',0.00,0.00,0.00,16,8,35000,5250,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 07:43:07','2024-10-07 07:43:07'),
(109,'02','1992-10-10',8,7,32,'Mrs. Yasmin Shahid','-','-','-','Female','2024-10-02','3740658965872','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032996130011',0.00,0.00,0.00,16,8,25000,4200,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 08:04:36','2024-10-07 08:04:36'),
(110,'03','2019-07-03',2,1,27,'Nosheen Kazmi','Safdar Hussain','-','-','Female','2024-10-01','3710320326736','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010059390390010',0.00,0.00,0.00,16,8,19900,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 08:16:16','2024-10-07 08:16:16'),
(111,'04','2019-07-03',2,1,27,'Maria Bibi','-','-','-','Male','2024-10-22','23424234','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010034943710029',0.00,0.00,0.00,16,8,19900,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 08:21:07','2024-10-07 08:21:07'),
(112,'05','2001-01-10',2,1,26,'Saima Waheed','-','-','-','Male','2024-10-22','23424234','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032996630015',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'Off','2024-10-07 08:28:35','2024-10-07 08:47:35'),
(113,'06','2010-03-24',2,1,26,'Mrs. Momina Mazhar','-','-','-','Female','2024-10-02','3740615592394','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010026105050018',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 08:43:07','2024-10-07 08:43:07'),
(114,'07','2005-09-01',2,1,26,'Mrs. Nadia Butt','Aziz Ur Rehman Butt','-','-','Female','2024-10-02','3740615467458','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032996810012',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 08:55:28','2024-10-07 08:55:28'),
(115,'08','2010-03-24',2,1,26,'Rehana Javed','Muhammad Javed','-','-','Female','2024-10-01','3740120485518','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010025809130017',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:01:25','2024-10-07 09:01:25'),
(116,'09','2011-12-01',2,1,26,'Mrs. Imrozia Abid','Abid Asghar','-','-','Female','2024-10-02','6110117091370','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032995210011',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:06:42','2024-10-07 09:06:42'),
(117,'10','2004-09-01',2,1,26,'Mrs. Yasmin Akram','Muhammad Bashir','-','-','Female','2024-10-03','374061515760','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032996380012',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:13:18','2024-10-07 09:13:18'),
(118,'11','2016-08-11',2,1,27,'Ms Sadia Parveen','Yousaf Ali','-','-','Female','2024-10-02','7340608866020','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010035316670017',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:25:26','2024-10-07 09:25:26'),
(119,'12','2016-08-11',2,1,27,'Ms. Kanwal Latif','Abdul Latif','-','-','Female','2024-10-09','3740617315054','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010039006070017',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:30:50','2024-10-07 09:30:50'),
(120,'13','2016-08-11',2,1,27,'Ms. Yumna Riaz','Riaz Ahmed','-','-','Female','2024-10-02','3740608866020','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010039006150011',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:38:08','2024-10-07 09:38:08'),
(121,'14','2010-06-21',2,1,26,'Mrs. Irum Shehzadi','Ikhlaq Ahmed','-','-','Female','2024-10-02','3740615454088','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010012901440028',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:44:40','2024-10-07 09:44:40'),
(122,'15','2016-08-11',2,1,27,'Ms. Sadia Javed','Muhammad Javed Mirza','-','-','Female','2024-10-03','3740643060144','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010033569830013',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:49:17','2024-10-07 09:49:17'),
(123,'16','2018-01-01',2,1,27,'Ms. Qurrat Ul Ain','Qasim Ali','-','-','Female','2024-10-02','3740641202738','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010050192960016',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 09:53:57','2024-10-07 09:53:57'),
(124,'17','2020-06-01',2,1,27,'Ms. Fozia Tariq','Muhammad Tariq','-','-','Female','2024-10-02','374052582158','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010067834630011',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 10:08:25','2024-10-07 10:08:25'),
(125,'18','2011-09-05',2,1,26,'Mrs. Ameera Usmani','Afaq Ahmed Usmani','-','-','Female','2024-10-03','7340615901448','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032996970010',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 10:15:12','2024-10-07 10:15:12'),
(126,'19','2014-09-24',2,1,26,'Safia Shaheen','-','-','-','Female','2024-10-02','13424234','Married','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010032997000016',0.00,0.00,0.00,16,8,15000,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 10:19:26','2024-10-07 10:19:26'),
(127,'20','2019-03-07',2,1,27,'Ms. Ayesha Kanwal','Hamid Ali Khan','-','-','Female','2024-10-01','21464234','Single','-','-','-','-','Morning',0.00,NULL,'On','','On','ABL-0010059150220011',0.00,0.00,0.00,16,8,19100,2625,0,0,0.00,0.00,0.00,0.00,0.00,'0','2024-10-07 10:22:49','2024-10-07 10:22:49');
/*!40000 ALTER TABLE `school_employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES
(8,'ID Department',16,'On','2024-07-29 05:49:13','2024-07-30 10:51:46'),
(9,'VIC Department',16,'On','2024-07-29 05:49:29','2024-07-30 10:51:46'),
(10,'HIC Junior',16,'On','2024-07-29 05:49:42','2024-07-30 10:51:46'),
(11,'HIC Senior',16,'On','2024-07-29 05:49:49','2024-07-30 10:51:46'),
(12,'College HIC',16,'On','2024-07-29 05:49:59','2024-07-30 10:51:46'),
(13,'-',16,'On','2024-07-29 05:49:59','2024-07-30 10:51:46');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `selected_categories_campuswise`
--

DROP TABLE IF EXISTS `selected_categories_campuswise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `selected_categories_campuswise`
--

LOCK TABLES `selected_categories_campuswise` WRITE;
/*!40000 ALTER TABLE `selected_categories_campuswise` DISABLE KEYS */;
INSERT INTO `selected_categories_campuswise` VALUES
(38,1,16,'On','2024-07-30 16:11:41','2024-07-30 16:11:41'),
(39,2,16,'On','2024-07-30 16:11:41','2024-07-30 16:11:41'),
(45,3,16,'Off','2024-07-30 16:11:41','2024-08-09 05:12:28'),
(46,4,16,'Off','2024-07-30 16:11:41','2024-08-09 05:12:30'),
(47,8,16,'On','2024-08-01 07:02:36','2024-08-01 07:02:36'),
(48,9,16,'On','2024-08-01 07:02:36','2024-08-01 07:02:36'),
(49,10,16,'On','2024-08-01 07:08:33','2024-08-01 07:08:33'),
(50,14,16,'On','2024-08-01 08:18:16','2024-08-01 08:18:16'),
(51,15,16,'On','2024-08-01 08:18:16','2024-08-01 08:18:16'),
(52,16,16,'On','2024-08-01 08:18:16','2024-08-01 08:18:16'),
(53,17,16,'On','2024-08-01 08:18:16','2024-08-01 08:18:16');
/*!40000 ALTER TABLE `selected_categories_campuswise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_book`
--

DROP TABLE IF EXISTS `service_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `service_book`
--

LOCK TABLES `service_book` WRITE;
/*!40000 ALTER TABLE `service_book` DISABLE KEYS */;
INSERT INTO `service_book` VALUES
(146,103,8,1,14,10000.00,2500.00,5000.00,0.00,0.00,0.00,0.00,0.00,0,'2024-10-01',0.00,0,0,17500,16,12,'Regular',NULL,'','','2024-10-01 06:21:01','2024-10-01 06:21:01','employee_form',0,0,0,0),
(151,108,8,6,35,35000.00,5250.00,0.00,0.00,0.00,370.00,9500.00,12250.00,21750,'2024-10-07',21008.00,1500,210081500,109388,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 07:43:07','2024-10-07 07:47:46','employee_form',0,5250,10000,10000),
(152,109,8,7,32,25000.00,4200.00,0.00,0.00,0.00,0.00,7600.00,8750.00,16350,'2024-10-07',23400.00,1200,24600,79350,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 08:04:36','2024-10-07 08:04:36','employee_form',0,4200,5000,0),
(153,110,2,1,27,19900.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',0.00,723,723,37778,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 08:16:16','2024-10-07 08:16:16','employee_form',0,2625,0,0),
(154,111,2,1,27,19900.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',0.00,723,723,37778,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 08:21:07','2024-10-07 08:21:07','employee_form',0,2625,0,0),
(155,112,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',16100.00,800,16100800,53055,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 08:28:35','2024-10-07 08:47:35','employee_form',0,2625,4000,0),
(156,113,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',11990.00,800,12790,47945,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 08:43:07','2024-10-07 08:43:07','employee_form',0,2625,3000,0),
(157,114,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',15640.00,800,16440,51595,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 08:55:28','2024-10-07 08:55:28','employee_form',0,2625,3000,0),
(158,115,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',11990.00,800,12790,47945,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 09:01:25','2024-10-07 09:01:25','employee_form',0,2625,3000,0),
(159,116,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',11346.00,800,12146,46301,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 09:06:42','2024-10-07 09:06:42','employee_form',0,2625,2000,0),
(160,117,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',16100.00,800,16900,53055,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 09:13:18','2024-10-07 09:13:18','employee_form',0,2625,4000,0),
(161,118,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',2779.00,800,3579,39834,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 09:25:26','2024-10-07 09:25:26','employee_form',0,2625,0,0),
(162,119,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',2779.00,800,3579,39834,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 09:30:50','2024-10-07 09:30:50','employee_form',0,2625,0,0),
(163,120,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',2779.00,800,3579,39834,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 09:38:08','2024-10-07 09:38:08','employee_form',0,2625,0,0),
(164,121,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',6879.00,800,7679,39834,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 09:44:40','2024-10-07 09:44:40','employee_form',0,2625,0,0),
(165,122,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',2779.00,800,3579,39834,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 09:49:17','2024-10-07 09:49:17','employee_form',0,2625,0,0),
(166,123,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',1666.00,800,2466,38721,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 09:53:57','2024-10-07 09:53:57','employee_form',0,2625,0,0),
(167,124,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',0.00,800,800,37055,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 10:08:25','2024-10-07 10:08:25','employee_form',0,2625,0,0),
(168,125,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',11090.00,800,11890,46045,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 10:15:12','2024-10-07 10:15:12','employee_form',0,2625,2000,0),
(169,126,2,1,26,15000.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',8385.00,800,9185,43340,16,8,'Regular',NULL,'annual_increment','adhoc_increment','2024-10-07 10:19:26','2024-10-07 10:19:26','employee_form',0,2625,2000,0),
(170,127,2,1,27,19100.00,2625.00,0.00,0.00,0.00,370.00,4775.00,7500.00,12275,'2024-10-07',723.00,800,1523,37778,16,8,'Contract',NULL,'annual_increment','adhoc_increment','2024-10-07 10:22:49','2024-10-07 10:22:49','employee_form',0,2625,0,0);
/*!40000 ALTER TABLE `service_book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES
(1,'2024-2025','On','2024-07-02 08:55:50'),
(2,'2025-2026','Off','2024-07-02 08:55:50'),
(3,'2026-2027','Off','2024-07-02 08:55:50'),
(4,'2027-2028','Off','2024-07-02 08:55:50'),
(5,'2028-2029','Off','2024-07-02 08:55:50'),
(6,'2023-2024','Off','2024-07-02 08:55:50');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `price` decimal(10,2) NOT NULL COMMENT 'this is actual price',
  `quantity` decimal(10,2) NOT NULL COMMENT 'this quantity is used in invoice',
  `discount` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `price_option` varchar(50) NOT NULL,
  `discount_option` varchar(50) NOT NULL,
  `remarks` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `date_of_expiry` varchar(100) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT 0.00,
  `packet_quantity` decimal(10,2) DEFAULT 0.00,
  `per_packet_quantity` decimal(10,2) DEFAULT 0.00,
  `selling_price` decimal(10,2) DEFAULT 0.00,
  `price_after_discount` decimal(10,2) DEFAULT 0.00,
  `after_discount_total` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES
(158,1001,126,2.00,100.00,0.00,200.00,'current','current','test','2025-02-08 16:53:26','2025-02-01',150.00,1.00,100.00,200.00,2.00,200.00),
(159,1001,129,1.00,100.00,0.00,100.00,'current','current','test','2025-02-08 16:53:26','2025-02-08',160.00,1.00,100.00,100.00,1.00,100.00),
(160,1001,127,50.00,100.00,0.00,5000.00,'current','current','test','2025-02-08 16:53:26','2025-02-08',140.00,100.00,1.00,50.00,50.00,5000.00),
(161,1001,128,150.00,100.00,0.00,15000.00,'current','current','test','2025-02-08 16:53:26','2025-02-08',170.00,100.00,1.00,150.00,150.00,15000.00),
(162,1002,126,6.00,10.00,0.00,60.00,'current','current','','2025-02-15 07:30:42','2025-02-28',150.00,1.00,10.00,60.00,6.00,60.00),
(172,1003,200,5.00,10.00,0.00,50.00,'current','current','','2025-02-18 17:33:14','',150.00,1.00,10.00,50.00,5.00,50.00),
(173,1003,289,0.50,10.00,0.00,5.00,'current','current','','2025-02-18 17:33:14','',150.00,1.00,10.00,5.00,0.50,5.00),
(174,1003,244,1.00,10.00,0.00,10.00,'current','current','','2025-02-18 17:33:14','',150.00,1.00,10.00,10.00,1.00,10.00),
(175,1004,428,10.00,10.00,0.00,100.00,'current','current','-','2025-02-18 18:24:14','2025-02-26',100.00,1.00,10.00,100.00,10.00,100.00),
(176,1005,438,10.00,1.00,0.00,10.00,'current','current','','2025-02-18 18:29:17','',150.00,1.00,1.00,10.00,10.00,10.00),
(177,1006,127,10.00,1.00,0.00,10.00,'current','current','','2025-02-18 19:04:32','',150.00,1.00,1.00,10.00,10.00,10.00);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES
(1,'REG-1000','-','Morning','1970-01-01','Aiza Abid','Female',39,8,'1970-01-01','-','-','-','-','House # G-124 St 16 Phase 3 Officers Colony Wah Cantt','House # G-124 St 16 Phase 3 Officers Colony Wah Cantt','0334-9540182','-',2,'','','Abid Shahzad','Father','-','0334-9540182','House # G-124 St 16 Phase 3 Officers Colony Wah Cantt','-','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','-','0334-9540182','Abid Shahzad','','','On',200,'On','On'),
(2,'REG-1001','-','Morning','1970-01-01','M. Awais Sadiq','Male',39,8,'1970-01-01','-','-','-','-','Flat # 58/383 Laiq Ali Chowk, Wah','Flat # 58/383 Laiq Ali Chowk, Wah','0314-5556850','-',2,'','','M. Siddiq','Father','-','0314-5556850','Flat # 58/383 Laiq Ali Chowk, Wah','-','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','-','0314-5556850','M. Siddiq','','','On',0,'Off','On'),
(3,'REG-1002','','Morning',NULL,'Haider Shahzad','Male',39,8,NULL,'','','','','Qtr. # (25G/51)','Qtr. # (25G/51)','0302-5088381','',1,'','','M. Shahzad','','','0302-5088381','','','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','','0302-5088381','M. Shahzad','','','On',0,'','On'),
(4,'REG-1003','','Morning',NULL,'Mahum Hussain','Female',39,8,NULL,'','','','','Mohalla Mashriqi abad Faisal Shaheed Road, Taxil','Mohalla Mashriqi abad Faisal Shaheed Road, Taxil','0302-8776760','',2,'','','M. Hussain','','','0302-8776760','','','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','','0302-8776760','M. Hussain','','','On',0,'','On'),
(6,'REG-1005','','Morning',NULL,'Rowza Emaan','Female',39,8,NULL,'','','','','Butt house Hussainabad, Nawababad Taxila','Butt house Hussainabad, Nawababad Taxila','0314-6405501','',1,'','','M. Shafiq','','','0314-6405501','','','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','','0314-6405501','M. Shafiq','','','On',0,'','On'),
(7,'REG-1006','','Morning',NULL,'Saim Awan','Male',39,8,NULL,'','','','','18G 657 Wah Cantt','18G 657 Wah Cantt','0334-5343878','',1,'','','Basharat Mahmood','','','0334-5343878','','','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','','0334-5343878','Basharat Mahmood','','','On',100,'On','On'),
(8,'REG-1007','','Morning',NULL,'Skhawat Paracha','Male',39,8,NULL,'','','','','H No. CB 160 Ali Street Lane no 4 Nawababad, Wah','H No. CB 160 Ali Street Lane no 4 Nawababad, Wah','0313-4404575','',2,'','','Zahoor Paracha','','','0313-4404575','','','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','','0313-4404575','Zahoor Paracha','','','On',0,'','On'),
(9,'REG-1008','','Morning',NULL,'Abdul Wahab','Male',39,8,NULL,'','','','','Buddhoo, daak khana khas, Gudwal, Wah Cantt','Buddhoo, daak khana khas, Gudwal, Wah Cantt','0326-5410625','',2,'','','Shakeel Ahmad','','','0326-5410625','','','','','','','2024-07-31 11:09:52','2024-08-12 08:14:51',1,16,8,'New Admission','','0326-5410625','Shakeel Ahmad','','','On',200,'On','On'),
(10,'REG-1009','','Morning',NULL,'ABDUL NAFAY','Male',40,8,NULL,'','','','','25/F - 141 POF WAHCANTT','25/F - 141 POF WAHCANTT','0300-7066008 ','',1,'','','MUHAMMAD ILYAS','','','0300-7066008 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-7066008 ','MUHAMMAD ILYAS','','','On',100,'On','On'),
(11,'REG-1010','','Morning',NULL,'WAHAB HAIDER','Male',40,8,NULL,'','','','','CB-194 MUSLIMABAD ASKARI CHOWK NEAR GADWAL FAC BARRIER 4 WAH CANTT','CB-194 MUSLIMABAD ASKARI CHOWK NEAR GADWAL FAC BARRIER 4 WAH CANTT','0346-5172513','',2,'','','MUSHTAQ KAZMI','','','0346-5172513','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-5172513','MUSHTAQ KAZMI','','','On',200,'On','On'),
(12,'REG-1011','','Morning',NULL,'SAMAD REHMAN','Male',40,8,NULL,'','','','','19 HC / 679 POF WAH CANTT','19 HC / 679 POF WAH CANTT','0307-8175527','',1,'','','AZIZ UR REHMAN','','','0307-8175527','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-8175527','AZIZ UR REHMAN','','','On',100,'On','On'),
(13,'REG-1012','','Morning',NULL,'HAMID RAZA','Male',40,8,NULL,'','','','','CB 264 CHACHI MOHALLA NEAR G.T ROAD TAXILA','CB 264 CHACHI MOHALLA NEAR G.T ROAD TAXILA','0317-5085346','',2,'','','MUSHTAQ HUSSAIN','','','0317-5085346','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0317-5085346','MUSHTAQ HUSSAIN','','','On',200,'On','On'),
(14,'REG-1013','','Morning',NULL,'ZEESHAN HAIDER','Male',40,8,NULL,'','','','','','','0304-1333308','',2,'','','MUHAMMAD ILYAS','','','0304-1333308','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0304-1333308','MUHAMMAD ILYAS','','','On',0,'','On'),
(16,'REG-1015','','Morning',NULL,'MUHAMMAD IBAD KHAN','Male',40,8,NULL,'','','','','H# 9 GULSHAN E RAZA COLONY NEAR IMAMBARGAH DARBAR.E.KAREEMI GT ROAD WAH CANTT','H# 9 GULSHAN E RAZA COLONY NEAR IMAMBARGAH DARBAR.E.KAREEMI GT ROAD WAH CANTT','0300-5124129','',2,'','','JAFFAR DAUD KHAN','','','0300-5124129','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5124129','JAFFAR DAUD KHAN','','','On',0,'','On'),
(17,'REG-1016','-','Morning','1970-01-01','SAIM KHAN','Male',40,8,'1970-01-01','-','-','-','-','C-42 , B-8, G WAH CANTT','C-42 , B-8, G WAH CANTT','0334-5343878','-',1,'','','BASHARAT MEHMOOD ','Father','-','0334-5343878','C-42 , B-8, G WAH CANTT','-','-','-','-','','2024-07-31 11:09:52','2024-08-28 06:31:18',1,16,8,'Struck Off','-','0334-5343878','BASHARAT MEHMOOD ','2024-08-28 11:31:18','','On',100,'On','On'),
(18,'REG-1017','','Morning',NULL,'ALLAHBAKSH','Male',40,8,NULL,'','','','','STREET NO 1 MOHALLAH SHAHEEDABAD NEAR G.T ROAD WAH CANTT','STREET NO 1 MOHALLAH SHAHEEDABAD NEAR G.T ROAD WAH CANTT','0346-4565100','',1,'','','MUHAMMMAD NAWAZ','','','0346-4565100','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-4565100','MUHAMMMAD NAWAZ','','','On',100,'On','On'),
(19,'REG-1018','','Morning',NULL,'M AYYAN','Male',40,8,NULL,'','','','','QUARTER NO 1-F / 75 POF WAH CANTT','QUARTER NO 1-F / 75 POF WAH CANTT','0311-1685085','',1,'','','AYYAZ KHAN','','','0311-1685085','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0311-1685085','AYYAZ KHAN','','','On',100,'On','On'),
(20,'REG-1020','','Morning',NULL,'ABBAS AHMED','Male',40,8,NULL,'','','','','D-673 LALARUKH WAH CANTT','D-673 LALARUKH WAH CANTT','0334-5436379','',2,'','','AAMIR AHMED','','','0334-5436379','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0334-5436379','AAMIR AHMED','','','On',200,'On','On'),
(21,'REG-1021','','Morning',NULL,'MUHAMMAD HASEEB','Male',40,8,NULL,'','','','','H-117 - 15-G POF WAH CANTT','H-117 - 15-G POF WAH CANTT','0346-5638251','',1,'','','M ZAHEER','','','0346-5638251','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-5638251','M ZAHEER','','','On',100,'On','On'),
(22,'REG-1022','','Morning',NULL,'MUBASHARA ESHAL ','Female',40,8,NULL,'','','','','H# 350 SECTOR 18,G  WAH CANTT','H# 350 SECTOR 18,G  WAH CANTT','0309-5531578','',1,'','','ABDUL GHAFFAR','','','0309-5531578','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0309-5531578','ABDUL GHAFFAR','','','On',100,'On','On'),
(23,'REG-1023','','Morning',NULL,'Zainab Abbas','Female',40,8,NULL,'','','','','New City Phase 2 St# 20 House # 54','New City Phase 2 St# 20 House # 54','0322-5433192','',2,'','','Ghazanfar Abbas','','','0322-5433192','','','','','','','2024-07-31 11:09:52','2024-08-09 13:04:28',1,16,8,'New Admission','','0322-5433192','Ghazanfar Abbas','','','On',0,'','On'),
(24,'REG-1024','','Morning',NULL,'Mujtaba Ahmed ','Male',40,8,NULL,'','','','','Qtr # 2-F / 131 POF Wah Cantt','Qtr # 2-F / 131 POF Wah Cantt','0345-5388968','',2,'','','Zahoor Ahmad','','','0345-5388968','','','','','','','2024-07-31 11:09:52','2024-08-09 13:04:45',1,16,8,'New Admission','','0345-5388968','Zahoor Ahmad','','','On',200,'On','On'),
(25,'REG-1025','','Morning',NULL,'Abdullah Qadeer','Male',41,8,NULL,'','','','','H# 16 EV 108 POF WAH CANTT','H# 16 EV 108 POF WAH CANTT','0345-5993205','',1,'','','ABDUL QADEER','','','0345-5993205','','','','','','','2024-07-31 11:09:52','2024-08-10 06:26:37',1,16,8,'Promoted','','0345-5993205','ABDUL QADEER','','','On',0,'','On'),
(26,'REG-1026','','Morning',NULL,'Tayab Muneer','Male',41,8,NULL,'','','','','H# 8 MOHALLAH AZIZPURA WAH MODEL TOWN','H# 8 MOHALLAH AZIZPURA WAH MODEL TOWN','0318-5618677','',2,'','','MUNEER AHMED','','','0318-5618677','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-5618677','MUNEER AHMED','','','On',200,'On','On'),
(27,'REG-1027','','Morning',NULL,'Eman Iqra Sultan','Female',41,8,NULL,'','','','','MOHALLAH  AZIZPURA STREET NO 22, H#23','MOHALLAH  AZIZPURA STREET NO 22, H#23','0313-5854845','',1,'','','SULTAN ','','','0313-5854845','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-5854845','SULTAN ','','','On',100,'On','On'),
(28,'REG-1028','','Morning',NULL,'Nayab Zara','Female',41,8,NULL,'','','','','H# CB 981 STREEET NO 3 RIASATABAD WAH CANTT','H# CB 981 STREEET NO 3 RIASATABAD WAH CANTT','0348-1501861','',2,'','','ABDUL GHANI','','','0348-1501861','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0348-1501861','ABDUL GHANI','','','On',200,'On','On'),
(29,'REG-1029','','Morning',NULL,'Rehan Ali ','Male',41,8,NULL,'','','','','PIND BOHTIMOR','PIND BOHTIMOR','0312-5172160','',2,'','','SAJJAD HUSSAIN','','','0312-5172160','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-5172160','SAJJAD HUSSAIN','','','On',200,'On','On'),
(30,'REG-1030','','Morning',NULL,'Azan Ali','Male',41,8,NULL,'','','','','CB-244 MUNEERABAD WAH CANTT','CB-244 MUNEERABAD WAH CANTT','0314-5165583','',1,'','','ARSHAD MEHMOOD','','','0314-5165583','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0314-5165583','ARSHAD MEHMOOD','','','On',100,'On','On'),
(31,'REG-1031','','Morning',NULL,'Hassan Mustafa','Male',41,8,NULL,'','','','','Q# 18 , 1018 LAIQ ALI CHOWK WAH CANTT','Q# 18 , 1018 LAIQ ALI CHOWK WAH CANTT','0313-5211550','',1,'','','HUSNAIN SHAH','','','0313-5211550','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-5211550','HUSNAIN SHAH','','','On',100,'On','On'),
(32,'REG-1032','','Morning',NULL,'M. Usman','Male',41,8,NULL,'','','','','GULISTAN COLONY 8276 WAH CANTT','GULISTAN COLONY 8276 WAH CANTT','0318-9007997','',2,'','','M NASEEM','','','0318-9007997','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-9007997','M NASEEM','','','On',0,'','On'),
(33,'REG-1033','','Morning',NULL,'M. Wasif Ali','Male',41,8,NULL,'','','','','CB-43 STREET NO 2 KHANABAD','CB-43 STREET NO 2 KHANABAD','0347-9064900','',2,'','','KHUDA DAD','','','0347-9064900','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0347-9064900','KHUDA DAD','','','On',200,'On','On'),
(34,'REG-1034','','Morning',NULL,'Fiza Sadia','Female',41,8,NULL,'','','','','Q# 2F 159 POF WAH CANTT','Q# 2F 159 POF WAH CANTT','0308-4885508','',1,'','','ASIM FAROOQ','','','0308-4885508','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-4885508','ASIM FAROOQ','','','On',100,'On','On'),
(35,'REG-1035','','Morning',NULL,'Farhat Noor','Female',41,8,NULL,'','','','','21 AREA FLAT NO 12 POF WAH CANTT','21 AREA FLAT NO 12 POF WAH CANTT','0300-5333214','',2,'','','NOOR MUHAMMAD','','','0300-5333214','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5333214','NOOR MUHAMMAD','','','On',200,'On','On'),
(36,'REG-1036','','Morning',NULL,'M. Shameer Awan','Male',41,8,NULL,'','','','','CB-14 STREET NO 12 LALAZAR COLONY','CB-14 STREET NO 12 LALAZAR COLONY','0301-5542024','',2,'','','M SHAHBAZ AWAN','','','0301-5542024','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0301-5542024','M SHAHBAZ AWAN','','','On',200,'On','On'),
(37,'REG-1037','','Morning',NULL,'Musa Wajid','Female',41,8,NULL,'','','','','H# 1 STREET NO 36 MUHALLAH GHARBI','H# 1 STREET NO 36 MUHALLAH GHARBI','0302-5519797','',2,'','','WAJID ALI','','','0302-5519797','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0302-5519797','WAJID ALI','','','On',0,'','On'),
(38,'REG-1038','','Morning',NULL,'Abdullah ','Male',41,8,NULL,'','','','','22-G 663 POF WAH CANTT','22-G 663 POF WAH CANTT','0325-8343625','',1,'','','GHULAM ASHRAF','','','0325-8343625','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0325-8343625','GHULAM ASHRAF','','','On',100,'On','On'),
(39,'REG-1039','','Morning',NULL,'Zainab Gul','Female',41,8,NULL,'','','','','Village Bohti Mor Post Office Hassanabdal Tehsil Taxila Distt Rawalpindi','Village Bohti Mor Post Office Hassanabdal Tehsil Taxila Distt Rawalpindi','0310-5691411','',2,'','','Raja Faheem Jabbar','','','0310-5691411','','','','','','','2024-07-31 11:09:52','2024-08-09 13:05:05',1,16,8,'New Admission','','0310-5691411','Raja Faheem Jabbar','','','On',200,'On','On'),
(40,'REG-1040','','Morning',NULL,'Abdur Rehman','Male',42,8,NULL,'','','','','CB 53 GULSHAN COLONY WAH CANTT','CB 53 GULSHAN COLONY WAH CANTT','0332-5253938','',2,'','','M TARIQ','','','0332-5253938','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0332-5253938','M TARIQ','','','On',0,'','On'),
(41,'REG-1041','','Morning',NULL,'Usman Ahmed','Male',42,8,NULL,'','','','','H# 14/8, STREET 5 MADINA TOWN GADWAL','H# 14/8, STREET 5 MADINA TOWN GADWAL','0313-0524823','',2,'','','FAIZ AHMED','','','0313-0524823','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-0524823','FAIZ AHMED','','','On',200,'On','On'),
(42,'REG-1042','','Morning',NULL,'Abdul Moiz','Male',42,8,NULL,'','','','','MOHALLAH GHARBI POST OFFICE LOHSAR SHARFOO WAH CANTT','MOHALLAH GHARBI POST OFFICE LOHSAR SHARFOO WAH CANTT','0316-5354262','',2,'','','M WAQAR','','','0316-5354262','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0316-5354262','M WAQAR','','','On',200,'On','On'),
(43,'REG-1043','','Morning',NULL,'Sana Ullah','Male',42,8,NULL,'','','','','FLAT 75 / 25 ANWAR CHOWK WAH CANTT','FLAT 75 / 25 ANWAR CHOWK WAH CANTT','0334-5089272','',2,'','','KHALEEQ UR REHMAN','','','0334-5089272','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0334-5089272','KHALEEQ UR REHMAN','','','On',0,'','On'),
(44,'REG-1044','','Morning',NULL,'M. Arslan Zaheer','Male',42,8,NULL,'','','','','LOHSAR SHARFOO MOHALLAH SHOUKATABAD WAH CANTT','LOHSAR SHARFOO MOHALLAH SHOUKATABAD WAH CANTT','0300-5304436','',2,'','','M ZAHEER','','','0300-5304436','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5304436','M ZAHEER','','','On',200,'On','On'),
(45,'REG-1045','','Morning',NULL,'Hareem Fatima','Female',42,8,NULL,'','','','','H# 6 STREET NO 2 L BLOCK NEW CITY PHASE 2 WAH CANTT','H# 6 STREET NO 2 L BLOCK NEW CITY PHASE 2 WAH CANTT','0333-5454191','',2,'','','M NAEEM','','','0333-5454191','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-5454191','M NAEEM','','','On',0,'','On'),
(46,'REG-1046','','Morning',NULL,'Sayam Ali','Male',42,8,NULL,'','','','','PIND BOHTIMOR  NEAR POST OFFICE HASSANABDAL','PIND BOHTIMOR  NEAR POST OFFICE HASSANABDAL','0312-5172160','',2,'','','SAJJAD HUSSAIN','','','0312-5172160','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-5172160','SAJJAD HUSSAIN','','','On',200,'On','On'),
(47,'REG-1047','','Morning',NULL,'M. Umer','Male',42,8,NULL,'','','','','H# 513 FAHAD TOWN MOHALLAH ABDULLAHABAD OPPOSITE ROYALSON HOTEL','H# 513 FAHAD TOWN MOHALLAH ABDULLAHABAD OPPOSITE ROYALSON HOTEL','0335-9059184','',2,'','','M ROHTAS','','','0335-9059184','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0335-9059184','M ROHTAS','','','On',0,'','On'),
(48,'REG-1048','','Morning',NULL,'Umme Habiba','Female',42,8,NULL,'','','','','H# 33 STREET 9 FAISAL TOWN PHASE 1 WAH CANTT','H# 33 STREET 9 FAISAL TOWN PHASE 1 WAH CANTT','0332-5033076','',1,'','','M ZAHEER','','','0332-5033076','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0332-5033076','M ZAHEER','','','On',0,'','On'),
(49,'REG-1049','','Morning',NULL,'Qaria Mohsin','Female',42,8,NULL,'','','','','MALIKATTA MUHAMMAD QUAID-E-AZAM COLONY NAWABABAD NEAR SAIFULLAH','MALIKATTA MUHAMMAD QUAID-E-AZAM COLONY NAWABABAD NEAR SAIFULLAH','0336-5111907','',1,'','','M MOHSIN','','','0336-5111907','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0336-5111907','M MOHSIN','','','On',100,'On','On'),
(50,'REG-1050','','Morning',NULL,'Ali Raza','Male',42,8,NULL,'','','','','H# 11-C AMALTAS ROAD WAH CANTT','H# 11-C AMALTAS ROAD WAH CANTT','0343-5941804','',1,'','','M ASHRAF','','','0343-5941804','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0343-5941804','M ASHRAF','','','On',100,'On','On'),
(51,'REG-1051','','Morning',NULL,'Ahmed Raza','Male',42,8,NULL,'','','','','18-G 657 POF WAH CANTT','18-G 657 POF WAH CANTT','0334-5343878','',1,'','','BASHARAT MEHMOOD','','','0334-5343878','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0334-5343878','BASHARAT MEHMOOD','','','On',100,'On','On'),
(52,'REG-1052','','Morning',NULL,'Subhan Kiyani','Male',42,8,NULL,'','','','','MUHABBATABAD KASHMIR COLONY NEAR BARRIER 2 WAH CANTT','MUHABBATABAD KASHMIR COLONY NEAR BARRIER 2 WAH CANTT','0314-5813050','',1,'','','SAJID MEHMOOD','','','0314-5813050','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0314-5813050','SAJID MEHMOOD','','','On',100,'On','On'),
(53,'REG-1053','','Morning',NULL,'Emaan Bibi','Female',42,8,NULL,'','','','','26 AREA NEAR POST OFFICE GADWAL WAH CANTT','26 AREA NEAR POST OFFICE GADWAL WAH CANTT','0307-5048427','',2,'','','IMRAN ALI','','','0307-5048427','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-5048427','IMRAN ALI','','','On',200,'On','On'),
(54,'REG-1054','','Morning',NULL,'Jaweria Rehman','Female',42,8,NULL,'','','','','22-G / 863 POF WAH CANTT','22-G / 863 POF WAH CANTT','0306-1138377','',1,'','','FAIZ UR REHMAN','','','0306-1138377','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0306-1138377','FAIZ UR REHMAN','','','On',100,'On','On'),
(55,'REG-1055','','Morning',NULL,'Shazain Sarwar','Male',42,8,NULL,'','','','','2F/151 POF WAH CANTT','2F/151 POF WAH CANTT','0334-5092421','',1,'','','SHAHID SARWAR','','','0334-5092421','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0334-5092421','SHAHID SARWAR','','','On',0,'','On'),
(56,'REG-1056','','Morning',NULL,'FIZZA SHOUKAT','Female',43,8,NULL,'','','','','Q# 18-G 559 POF WAH CANTT','Q# 18-G 559 POF WAH CANTT','0316-5759072','',1,'','','SHOUKAT HAYYAT','','','0316-5759072','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0316-5759072','SHOUKAT HAYYAT','','','On',100,'On','On'),
(57,'REG-1057','-','Morning','1970-01-01','ABROO BATOOL','Female',43,8,'1970-01-01','-','-','-','-','20-G / 510 POF WAH CANTT','20-G / 510 POF WAH CANTT','0346-5956218','-',1,'','','MOHSIN ALI SHAH','Father','-','0346-5956218','20-G / 510 POF WAH CANTT','-','-','-','-','','2024-07-31 11:09:52','2024-08-28 06:50:07',1,16,8,'Struck Off','-','0346-5956218','MOHSIN ALI SHAH','2024-08-28 11:50:07','','On',100,'On','On'),
(58,'REG-1058','','Morning',NULL,'FARZANA MAZHAR','Female',43,8,NULL,'','','','','H# E457 WAHDAT COLONY TAXILA','H# E457 WAHDAT COLONY TAXILA','0320-0980375','',2,'','','MAZHAR SADDIQU','','','0320-0980375','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0320-0980375','MAZHAR SADDIQU','','','On',200,'On','On'),
(59,'REG-1059','','Morning',NULL,'WAREESHA MUDASSER','Female',43,8,NULL,'','','','','H# 671 STREET NO 31 SECTOR A FAISAL TOWN TAXILA WAH CANTT','H# 671 STREET NO 31 SECTOR A FAISAL TOWN TAXILA WAH CANTT','0303-5560180','',2,'','','MUDASSER SHAH','','','0303-5560180','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0303-5560180','MUDASSER SHAH','','','On',0,'','On'),
(60,'REG-1060','','Morning',NULL,'SADEEM QASIM','Male',43,8,NULL,'','','','','ST# 2 MOHALLAH HOSPITAL SHANE SYEDIAN UMER FAROOQ TAXILA','ST# 2 MOHALLAH HOSPITAL SHANE SYEDIAN UMER FAROOQ TAXILA','0331-5431092','',2,'','','M QASIM','','','0331-5431092','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0331-5431092','M QASIM','','','On',0,'','On'),
(61,'REG-1061','','Morning',NULL,'ABDUL REHMAN MASOOD','Male',43,8,NULL,'','','','','ST# 6 MOHALLA EID GAH CHOUTI RAILWAY PHATAK TAXILA','ST# 6 MOHALLA EID GAH CHOUTI RAILWAY PHATAK TAXILA','0300-5008038','',2,'','','MASOOD AKHTER','','','0300-5008038','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5008038','MASOOD AKHTER','','','On',0,'','On'),
(62,'REG-1062','','Morning',NULL,'FOZAN AHMED','Male',43,8,NULL,'','','','','Q# 21-E / 56POF WAH CANTT','Q# 21-E / 56POF WAH CANTT','0345-1518851','',1,'','','M ASLAM AFTAB','','','0345-1518851','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0345-1518851','M ASLAM AFTAB','','','On',100,'On','On'),
(63,'REG-1063','','Morning',NULL,'AZAN ALI','Male',43,8,NULL,'','','','','SAREH MADHU POST OFFICE SANGJANI ISLAMBAD','SAREH MADHU POST OFFICE SANGJANI ISLAMBAD','0311-5232841','',2,'','','MUDASSER HUSSAIN','','','0311-5232841','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0311-5232841','MUDASSER HUSSAIN','','','On',0,'','On'),
(64,'REG-1064','-','Morning','1970-01-01','MANSOOR KHAN ','Male',45,8,'1970-01-01','-','-','-','-','CB-66 ST#15 SHAHWALI COLONY WAH CANTT','CB-66 ST#15 SHAHWALI COLONY WAH CANTT','0334-5029394','-',2,'','','RAHMZAD','Father','-','0334-5029394','CB-66 ST#15 SHAHWALI COLONY WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0334-5029394','RAHMZAD','','','On',200,'On','On'),
(65,'REG-1065','-','Morning','1970-01-01','ABDUL REHMAN ','Male',45,8,'1970-01-01','-','-','-','-','HIT GATE # 5 H# CB - 126/B MOHALLAH BILAL COLONY TAXILA WAH CANTT','HIT GATE # 5 H# CB - 126/B MOHALLAH BILAL COLONY TAXILA WAH CANTT','0340-0013662','-',2,'','','SHABBIR AHMED','Father','-','0340-0013662','HIT GATE # 5 H# CB - 126/B MOHALLAH BILAL COLONY TAXILA WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-28 07:05:23',1,16,8,'Promoted','-','0340-0013662','SHABBIR AHMED',NULL,NULL,'On',0,'Off','On'),
(66,'REG-1066','-','Morning','1970-01-01','AHMED ALI ARIF','Male',45,8,'1970-01-01','-','-','-','-','Q# 27-F / 125 POF WAH CANTT','Q# 27-F / 125 POF WAH CANTT','0333-5421225','-',1,'','','MUHAMMAD ARIF ','Father','-','0333-5421225','Q# 27-F / 125 POF WAH CANTT','-','-','--','-','','2024-07-31 11:09:52','2024-08-28 07:01:28',1,16,8,'Promoted','-','0333-5421225','MUHAMMAD ARIF ',NULL,NULL,'On',100,'On','On'),
(68,'REG-1068','','Morning',NULL,'UMER GHAFOOR','Male',43,8,NULL,'','','','','18-G 1/38 POF WAH CANTT','18-G 1/38 POF WAH CANTT','0308-5282162','',1,'','','ABDUL GHAFOOR','','','0308-5282162','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-5282162','ABDUL GHAFOOR','','','On',100,'On','On'),
(69,'REG-1069','','Morning',NULL,'HASNAIN MAZHAR','Male',43,8,NULL,'','','','','22-F / 546 POF WAH CANTT','22-F / 546 POF WAH CANTT','0346-5710457','',1,'','','MAZHAR HASNAIN','','','0346-5710457','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-5710457','MAZHAR HASNAIN','','','On',100,'On','On'),
(70,'REG-1070','','Morning',NULL,'AYYAN FAROOQ','Male',43,8,NULL,'','','','','H# A 160 ST# 3 NEW GULISTAN COLONY WAH CANTT','H# A 160 ST# 3 NEW GULISTAN COLONY WAH CANTT','0300-7471920','',2,'','','MUHAMMAD FAROOQ','','','0300-7471920','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-7471920','MUHAMMAD FAROOQ','','','On',0,'','On'),
(71,'REG-1071','','Morning',NULL,'ABDULLAH SALEEM','Male',44,8,NULL,'','','','','16-G/ 831 POF WAH CANTT','16-G/ 831 POF WAH CANTT','0319-5375110','',1,'','','M SALEEM','','','0319-5375110','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0319-5375110','M SALEEM','','','On',100,'On','On'),
(72,'REG-1072','-','Morning','1970-01-01','M AWAIS','Male',44,8,'1970-01-01','-','-','-','-','23 G /72 POF WAH CANTT','23 G /72 POF WAH CANTT','0344-1585495','-',9,'','','M SHAKEEL','Father','-','0344-1585495','23 G /72 POF WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0344-1585495','M SHAKEEL','','','On',100,'On','On'),
(73,'REG-1073','','Morning',NULL,'AALIYAN MEHMOOD','Male',44,8,NULL,'','','','','2-F/ 35 POF WAH CANTT','2-F/ 35 POF WAH CANTT','0316-8323036 ','',1,'','','QAISAR MEHMOOD','','','0316-8323036','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0316-8323036 ','QAISAR MEHMOOD','','','On',100,'On','On'),
(74,'REG-1074','','Morning',NULL,'HASSAN NAZEER','Male',44,8,NULL,'','','','','18-H / 1797 POF WAH CANTT','18-H / 1797 POF WAH CANTT','0304-5401778','',1,'','','M NAZEER','','','0304-5401778','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0304-5401778','M NAZEER','','','On',100,'On','On'),
(75,'REG-1075','','Morning',NULL,'MOIZ YASIR','Male',44,8,NULL,'','','','','18-H / 1475 POF WAH CANTT','18-H / 1475 POF WAH CANTT','0310-5517183 ','',1,'','','YASIR NASEEM','','','0310-5517183','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0310-5517183 ','YASIR NASEEM','','','On',100,'On','On'),
(76,'REG-1076','','Morning',NULL,'M. FEHR HASHMI','Male',44,8,NULL,'','','','','10 EV- 87 POF WAH CANTT','10 EV- 87 POF WAH CANTT','0335-9974580','',1,'','','ANSAR ABBAS','','','0335-9974580','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0335-9974580','ANSAR ABBAS','','','On',100,'On','On'),
(77,'REG-1077','','Morning',NULL,'ABDUL RAFAY JAWAD','Male',44,8,NULL,'','','','','21-E / 65 POF WAH CANTT','21-E / 65 POF WAH CANTT','0318-0974610','',1,'','','ABDUL JABBAR','','','0318-0974610','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-0974610','ABDUL JABBAR','','','On',100,'On','On'),
(78,'REG-1078','','Morning',NULL,'M YOUSAF','Male',44,8,NULL,'','','','','H-D 42 ST# 4 KOHISTAN ENCLAVE WAH CANTT','H-D 42 ST# 4 KOHISTAN ENCLAVE WAH CANTT','0300-5167905','',2,'','','M YAQOOB','','','0300-5167905','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5167905','M YAQOOB','','','On',200,'On','On'),
(79,'REG-1079','','Morning',NULL,'ALIYAN ZAHEER','Male',44,8,NULL,'','','','','MALIM TOWN ST# 7 BANNI MOHALLAH TAXILA','MALIM TOWN ST# 7 BANNI MOHALLAH TAXILA','0322-5350198 ','',1,'','','M ZAHEER','','','0322-5350198','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0322-5350198 ','M ZAHEER','','','On',0,'','On'),
(80,'REG-1080','','Morning',NULL,'M JAZIM MEER','Male',44,8,NULL,'','','','','NEHAR STOP AYYUBIA TOWN ST# 6 TAXILA','NEHAR STOP AYYUBIA TOWN ST# 6 TAXILA','0302-5768098','',2,'','','AMIR GHAYYAS MEER','','','0302-5768098','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0302-5768098','AMIR GHAYYAS MEER','','','On',0,'','On'),
(81,'REG-1081','','Morning',NULL,'DUA EMAN','Female',44,8,NULL,'','','','','BOHTIMOR SHADAB TOWN GADWAL','BOHTIMOR SHADAB TOWN GADWAL','0318-5826368','',2,'','','MUHAMMAD IJAZ','','','0318-5826368','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-5826368','MUHAMMAD IJAZ','','','On',200,'On','On'),
(82,'REG-1082','','Morning',NULL,'ALI RAZA','Male',44,8,NULL,'','','','','25 AREA - D / 3 DHAMRA ROAD POF WAH CANTT','25 AREA - D / 3 DHAMRA ROAD POF WAH CANTT','0302-6364881 ','',1,'','','ABBAS ALI','','','0302-6364881','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0302-6364881 ','ABBAS ALI','','','On',100,'On','On'),
(83,'REG-1083','','Morning',NULL,'AFTAB RASHID','Male',44,8,NULL,'','','','','MOHALLAH HUSSAINABD, A/C WAH NEAR RAILWAY GODAM TAXILA','MOHALLAH HUSSAINABD, A/C WAH NEAR RAILWAY GODAM TAXILA','0318-5208924 ','',2,'','','M RASHID','','','0318-5208924','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-5208924 ','M RASHID','','','On',200,'On','On'),
(85,'REG-1085','','Morning',NULL,'MAHNOOR CHOUDHRY','Female',44,8,NULL,'','','','','B-188 GULISTAN COLONY WAH CANTT','B-188 GULISTAN COLONY WAH CANTT','0320-5599525','',2,'','','M FAYYAZ','','','0320-5599525','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0320-5599525','M FAYYAZ','','','On',0,'','On'),
(86,'REG-1086','','Morning',NULL,'IMTISHAM DANISH','Male',45,8,NULL,'','','','','4-H / 181 POF WAH CANTT','4-H / 181 POF WAH CANTT','0300-0112850 ','',1,'','','M RAFI QAMAR','','','0300-0112850 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-0112850 ','M RAFI QAMAR','','','On',100,'On','On'),
(87,'REG-1087','-','Morning','1970-01-01','WASEEM ALI','Male',45,8,'1970-01-01','-','-','-','-','26-G / 68 POF WAH CANTT','26-G / 68 POF WAH CANTT','0317-1539609','-',10,'','','M AZAM','Father','-','0317-1539609','26-G / 68 POF WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0317-1539609','M AZAM','','','On',0,'Off','On'),
(89,'REG-1089','','Morning',NULL,'EMAAN FATIMA','Female',45,8,NULL,'','','','','21-FV / 234 POF WAH CANTT','21-FV / 234 POF WAH CANTT','0333-5442462','',1,'','','M SHAKIL','','','0333-5442462','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-5442462','M SHAKIL','','','On',100,'On','On'),
(90,'REG-1090','-','Morning','1970-01-01','EHTISHAM AHMED ','Male',45,8,'1970-01-01','-','-','-','-','4-G 181 POF WAH CANTT','4-G 181 POF WAH CANTT','0301-3016657','-',1,'','','MUKHTAR AHMED','Father','-','0301-3016657','4-G 181 POF WAH CANTT','-','-','-','-','','2024-07-31 11:09:52','2024-08-28 07:34:33',1,16,8,'Struck Off','-','0301-3016657','MUKHTAR AHMED','2024-08-28 12:34:33','','On',100,'On','On'),
(91,'REG-1091','-','Morning','1970-01-01','ARSLAN KARAR','Male',45,8,'1970-01-01','-','-','-','-','5 FV / 35 POF WAH CANTT','5 FV / 35 POF WAH CANTT','0314-5067126 ','-',1,'','','KARAR HUSSAIN','Father','-','0314-5067126 ','5 FV / 35 POF WAH CANTT','-','-','-','-','','2024-07-31 11:09:52','2024-08-28 07:33:32',1,16,8,'Struck Off','-','0314-5067126 ','KARAR HUSSAIN','2024-08-28 12:33:32','','On',100,'On','On'),
(92,'REG-1092','','Morning',NULL,'M ZULQARNAIN','Male',45,8,NULL,'','','','','18-G / 1279 POF WAH CANTT','18-G / 1279 POF WAH CANTT','0346-9855876','',1,'','','M ZAKIR','','','0346-9855876','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-9855876','M ZAKIR','','','On',100,'On','On'),
(93,'REG-1093','','Morning',NULL,'ABBAS ALI','Male',45,8,NULL,'','','','','15-G / 148 POF WAH CANTT','15-G / 148 POF WAH CANTT','0346-8851101','',1,'','','ASIF HASSAN ','','','0346-8851101','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-8851101','ASIF HASSAN ','','','On',100,'On','On'),
(94,'REG-1094','','Morning',NULL,'USMAN FAISAL','Male',45,8,NULL,'','','','','18-G / 905 POF WAH CANTT','18-G / 905 POF WAH CANTT','0322-5076462','',1,'','','M FAISAL','','','0322-5076462','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0322-5076462','M FAISAL','','','On',100,'On','On'),
(95,'REG-1095','','Morning',NULL,'MUBARA KHAN','Female',45,8,NULL,'','','','','20-H / 847 POF WAH CANTT','20-H / 847 POF WAH CANTT','0336-1154639','',1,'','','ABDUL MAJEED KHAN','','','0336-1154639','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0336-1154639','ABDUL MAJEED KHAN','','','On',100,'On','On'),
(96,'REG-1096','','Morning',NULL,'SUMMAN MUSHTAQ','Male',45,8,NULL,'','','','','14-G / 07','14-G / 07','0306-1983892','',1,'','','MUSHTAQ MASEH','','','0306-1983892','','','','','','','2024-07-31 11:09:52','2024-08-10 06:27:27',1,16,8,'Promoted','','0306-1983892','MUSHTAQ MASEH','','','On',100,'On','On'),
(97,'REG-1097','','Morning',NULL,'MUZAMMIL AHMED','Male',45,8,NULL,'','','','','7EV/ 40 POF WAH CANTT','7EV/ 40 POF WAH CANTT','0300-5070245','',1,'','','M AFZAL KHAN','','','0300-5070245','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5070245','M AFZAL KHAN','','','On',100,'On','On'),
(98,'REG-1098','-','Morning','1970-01-01','Sanoor Awan','Male',45,8,'1970-01-01','-','-','-','-','18-G / 1145 POF WAH CANTT','18-G / 1145 POF WAH CANTT','0311-8265747','-',9,'','','M Sajjad','Father','-','0311-8265747','18-G / 1145 POF WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-10 06:27:31',1,16,8,'Promoted','-','0311-8265747','M Sajjad','','','On',50,'On','On'),
(99,'REG-1099','','Morning',NULL,'Saad Farooq','Male',45,8,NULL,'','','','','H# CB 178 ST# 03 JINNAH ROAD LALAZAR COLONY WAH CANTT','H# CB 178 ST# 03 JINNAH ROAD LALAZAR COLONY WAH CANTT','0313-0875968','',2,'','','Umer Farooq','','','0313-0875968','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-0875968','Umer Farooq','','','On',200,'On','On'),
(100,'REG-1100','','Morning',NULL,'ABDUL MANAN','Male',45,8,NULL,'','','','','H # 16 F / 190 POF WAH CANTT','H # 16 F / 190 POF WAH CANTT','0300-9811460','',2,'','','RAJA INAM-UL-HAQ','','','0300-9811460','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-9811460','RAJA INAM-UL-HAQ','','','On',200,'On','On'),
(101,'REG-1101','','Morning',NULL,'M TALHA ','Male',45,8,NULL,'','','','','H # CB -575/B BARRIER 2 MOHALLAH SHAHIDABAD NEAR DAWN PUBLIC SCHOOL WAH CANTT','H # CB -575/B BARRIER 2 MOHALLAH SHAHIDABAD NEAR DAWN PUBLIC SCHOOL WAH CANTT','0308-5499893','',2,'','','M QADEER','','','0308-5499893','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-5499893','M QADEER','','','On',200,'On','On'),
(102,'REG-1102','','Morning',NULL,'M TAYYAB','Male',45,8,NULL,'','','','','H # 65 ST # 4 GULBERG COLONY WAH CANTT','H # 65 ST # 4 GULBERG COLONY WAH CANTT','0308-5925720','',1,'','','M MEHERBAN','','','0308-5925720','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-5925720','M MEHERBAN','','','On',100,'On','On'),
(103,'REG-1103','','Morning',NULL,'M DANIYAL','Male',45,8,NULL,'','','','','H # CB -244 ST # 2 ISMAILABAD WAH CANTT','H # CB -244 ST # 2 ISMAILABAD WAH CANTT','0308-5075578','',2,'','','IFTIKHAR HUSSAIN','','','0308-5075578','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-5075578','IFTIKHAR HUSSAIN','','','On',200,'On','On'),
(104,'REG-1104','','Morning',NULL,'OBAID ALI','Male',45,8,NULL,'','','','','H # CB - 244 ST 32 ISMAILABAD WAH CANTT','H # CB - 244 ST 32 ISMAILABAD WAH CANTT','0332-5053640 ','',1,'','','MEER GUL','','','0332-5053640 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0332-5053640 ','MEER GUL','','','On',100,'On','On'),
(105,'REG-1105','-','Morning','1970-01-01','M REHAN','Male',45,8,'1970-01-01','-','-','-','-','MOHALLAH GHEELA KHURD GALI USTAD WALI MAIN BAZAR TAXILA','MOHALLAH GHEELA KHURD GALI USTAD WALI MAIN BAZAR TAXILA','0309-2934699','-',2,'','','SHEIKH MERAJUDDIN','Father','-','0309-2934699','MOHALLAH GHEELA KHURD GALI USTAD WALI MAIN BAZAR TAXILA','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0309-2934699','SHEIKH MERAJUDDIN','','','On',0,'Off','On'),
(106,'REG-1106','','Morning',NULL,'FARHAN ALI','Male',45,8,NULL,'','','','','H#  LANE #12 KOHSAR COLONY PHASE-II TAXILA','H#  LANE #12 KOHSAR COLONY PHASE-II TAXILA','0321-5258367','',1,'','','SADIQ HUSSAIN','','','0321-5258367','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0321-5258367','SADIQ HUSSAIN','','','On',100,'On','On'),
(107,'REG-1107','-','Morning','1970-01-01','AMNA BIBI','Female',45,8,'1970-01-01','-','-','-','-','H# CB -305 ST #5 BARRIER NO-02 WAH CANTT TAXILA','H# CB -305 ST #5 BARRIER NO-02 WAH CANTT TAXILA','0318-5186624','-',14,'','','SARFRAZ AHMAD ','Father','-','0318-5186624','H# CB -305 ST #5 BARRIER NO-02 WAH CANTT TAXILA','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0318-5186624','SARFRAZ AHMAD ','','','On',0,'Off','On'),
(108,'REG-1108','','Morning',NULL,'MUHAMMAD HASSNAIN','Male',45,8,NULL,'','','','','20-G 568 POFs Wah Cantt','20-G 568 POFs Wah Cantt','0346-8785584','',1,'','','MIR MUHAMMAD','','','0346-8785584','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-8785584','MIR MUHAMMAD','','','On',100,'On','On'),
(109,'REG-1109','-','Morning','1970-01-01','M WAQAS','Male',45,8,'1970-01-01','-','-','-','-','H# P-7 ST# 18 NEAR NAMERA MASJID ','H# P-7 ST# 18 NEAR NAMERA MASJID ','0315-6733662 ','-',14,'','','M AMREED','Father','-','0315-6733662 ','H# P-7 ST# 18 NEAR NAMERA MASJID ','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0315-6733662 ','M AMREED','','','On',0,'Off','On'),
(112,'REG-1112','','Morning',NULL,'ABDULLAH ARSHAD','Male',45,8,NULL,'','','','','H# 783 B-BLOCK MULTI GARDENS B-17','H# 783 B-BLOCK MULTI GARDENS B-17','0333-5369033 ','',2,'','','ARSHAD NAWAZ','','','0333-5369033 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-5369033 ','ARSHAD NAWAZ','','','On',0,'','On'),
(113,'REG-1113','','Morning',NULL,'HAIDER ALI','Male',45,8,NULL,'','','','','MOHALLAH HUSSAINABAD MAIN JALAL ROAD TAXILA','MOHALLAH HUSSAINABAD MAIN JALAL ROAD TAXILA','0336-5344826 ','',2,'','','ABDUL RAHEEM','','','0336-5344826 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0336-5344826 ','ABDUL RAHEEM','','','On',200,'On','On'),
(114,'REG-1114','','Morning',NULL,'SHOAIB NAWAZ','Male',45,8,NULL,'','','','','H# 26-G / 23 POF WAH CANTT','H# 26-G / 23 POF WAH CANTT','0343-5447740','',1,'','','M NAWAZ','','','0343-5447740','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0343-5447740','M NAWAZ','','','On',100,'On','On'),
(115,'REG-1115','-','Morning','1970-01-01','UMER FAROOQ','Male',44,8,'1970-01-01','-','-','-','-','H#  A-164 GULISTAN COLONY WAH CANTT','H#  A-164 GULISTAN COLONY WAH CANTT','0333-5218399 ','-',2,'','','ARSHAD FAROOQ','Father','-','0333-5218399 ','H#  A-164 GULISTAN COLONY WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-28 07:12:18',1,16,8,'Promoted','-','0333-5218399 ','ARSHAD FAROOQ',NULL,NULL,'On',0,'Off','On'),
(116,'REG-1116','','Morning',NULL,'AHMED ARYAN','Male',45,8,NULL,'','','','','H# 22-G / 609 POF WAH CANTT','H# 22-G / 609 POF WAH CANTT','0316-1734335','',1,'','','MANSOOR AHMED','','','0316-1734335','','','','','','','2024-07-31 11:09:52','2024-08-10 06:27:31',1,16,8,'Promoted','','0316-1734335','MANSOOR AHMED','','','On',100,'On','On'),
(117,'REG-1117','','Morning',NULL,'MOHIB ALI','Male',45,8,NULL,'','','','','H# 26-G /380 POF WAH CANTT','H# 26-G /380 POF WAH CANTT','0303-5921939','',1,'','','LIAQAT ALI','','','0303-5921939','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0303-5921939','LIAQAT ALI','','','On',100,'On','On'),
(118,'REG-1118','-','Morning','1970-01-01','SHAHMEER SOHAIL','Male',44,8,'1970-01-01','-','-','-','-','H# CB-140 GULSHAN COLONY WAH CANTT','H# CB-140 GULSHAN COLONY WAH CANTT','0315-5761823 ','-',2,'','','SOHAIL ANJUM','Father','-','0315-5761823 ','H# CB-140 GULSHAN COLONY WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0315-5761823 ','SOHAIL ANJUM','','','On',200,'On','On'),
(119,'REG-1119','-','Morning','1970-01-01','RAFAY ALI','Male',45,8,'1970-01-01','-','-','-','-','H# A-185 MASHRIKABAD TAXILA','H# A-185 MASHRIKABAD TAXILA','0313-5410945','-',15,'','','IKHLAQ AHMED','Father','-','0313-5410945','H# A-185 MASHRIKABAD TAXILA','-','','','','','2024-07-31 11:09:52','2024-08-10 06:27:31',1,16,8,'Promoted','-','0313-5410945','IKHLAQ AHMED','','','On',0,'Off','On'),
(120,'REG-1120','','Morning',NULL,'SOHAIB SAQIB','Male',45,8,NULL,'','','','','H# CB-221 NEW GADWAL ','H# CB-221 NEW GADWAL ','0301-8548129','',2,'','','KHUBAIB SAQIB','','','0301-8548129','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0301-8548129','KHUBAIB SAQIB','','','On',0,'','On'),
(121,'REG-1121','','Morning',NULL,'HAIDER ALI','Male',45,8,NULL,'','','','','MOHALLAH MEHMOODABAD ST# SALEEM KHAN ','MOHALLAH MEHMOODABAD ST# SALEEM KHAN ','0315-1529594','',2,'','','MUDASSAR HASSAN','','','0315-1529594','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0315-1529594','MUDASSAR HASSAN','','','On',200,'On','On'),
(122,'REG-1122','','Morning',NULL,'RAFAY SHAHZAD','Male',45,8,NULL,'','','','','H# 18-G /1145 POF WAH CANTT','H# 18-G /1145 POF WAH CANTT','0314-5992993','',1,'','','M SAJJAD','','','0314-5992993','','','','','','','2024-07-31 11:09:52','2024-08-10 06:27:31',1,16,8,'Promoted','','0314-5992993','M SAJJAD','','','On',100,'On','On'),
(124,'REG-1124','','Morning',NULL,'Ammar Bin Tahir','Male',47,10,NULL,'','','','','SB Nawaz Tabassum CB 390 Near Awan Chowk Lalazar 02 Wah CAntt','SB Nawaz Tabassum CB 390 Near Awan Chowk Lalazar 02 Wah CAntt','0346-7225556','',2,'','','Tahir Hussain','','','0346-7225556','','','','','','','2024-07-31 11:09:52','2024-08-09 13:05:39',1,16,8,'New Admission','','0346-7225556','Tahir Hussain','','','On',200,'On','On'),
(126,'REG-1126','','Morning',NULL,'Muhammad Essa','Male',47,10,NULL,'','','','','Village Bohti Pind The Taxila Distt Rwp','Village Bohti Pind The Taxila Distt Rwp','0318-5647578','',2,'','','Nazakat Hussain','','','0318-5647578','','','','','','','2024-07-31 11:09:52','2024-08-09 13:06:37',1,16,8,'New Admission','','0318-5647578','Nazakat Hussain','','','On',0,'','On'),
(127,'REG-1127','','Morning',NULL,'Salar Awan','Male',47,10,NULL,'','','','','Johd Attock','Johd Attock','0312-1583658','',2,'','','Abdul Manan','','','0312-1583658','','','','','','','2024-07-31 11:09:52','2024-08-09 13:07:12',1,16,8,'New Admission','','0312-1583658','Abdul Manan','','','On',0,'','On'),
(129,'REG-1129','-','Morning','1970-01-01','Zohaib Shoaib Bhatti','Male',47,10,'1970-01-01','-','-','-','-','Bhatti House Ghattia Road Ahmed Nagar Wah Cantt','Bhatti House Ghattia Road Ahmed Nagar Wah Cantt','0310-5049607','-',10,'','','Shoaib Khalid','Father','-','0310-5049607','Bhatti House Ghattia Road Ahmed Nagar Wah Cantt','-','','','','','2024-07-31 11:09:52','2024-08-09 13:06:57',1,16,8,'New Admission','-','0310-5049607','Shoaib Khalid','','','On',200,'On','On'),
(130,'REG-1130','','Morning',NULL,'Huma Hafeez','Female',47,10,NULL,'','','','','A-159 P.M Colony Wah Cantt','A-159 P.M Colony Wah Cantt','0315-6610673','',1,'','','Abdul Hafeez','','','0315-6610673','','','','','','','2024-07-31 11:09:52','2024-08-09 13:12:04',1,16,8,'New Admission','','0315-6610673','Abdul Hafeez','','','On',0,'','On'),
(132,'REG-1132','','Morning',NULL,'Maria BiBi','Female',47,10,NULL,'','','','','P.O.Box Nikku Taxila','P.O.Box Nikku Taxila','0314-3504923','',2,'','','Asif Khan','','','0314-3504923','','','','','','','2024-07-31 11:09:52','2024-08-09 13:11:08',1,16,8,'New Admission','','0314-3504923','Asif Khan','','','On',200,'On','On'),
(134,'REG-1134','','Morning',NULL,'Azan Ali','Male',47,10,NULL,'','','','','P.O Box Bahthar, Pind Bhadar Fateh Jang','P.O Box Bahthar, Pind Bhadar Fateh Jang','0311-0998200','',2,'','','Muhammad Sajid','','','0311-0998200','','','','','','','2024-07-31 11:09:52','2024-08-09 13:09:37',1,16,8,'New Admission','','0311-0998200','Muhammad Sajid','','','On',0,'','On'),
(135,'REG-1135','','Morning',NULL,'Minahil','Female',47,10,NULL,'','','','','St#2 H#653 Nawababad','St#2 H#653 Nawababad','0314-5439937','',2,'','','Habib-Ur-Rehman','','','0314-5439937','','','','','','','2024-07-31 11:09:52','2024-08-09 13:10:41',1,16,8,'New Admission','','0314-5439937','Habib-Ur-Rehman','','','On',0,'','On'),
(139,'REG-1139','','Morning',NULL,'MASEERA ANAS','Female',48,10,NULL,'','','','','NEW CITY PHASE 2 BLOCK-A ST# - 7 H# 61-A','NEW CITY PHASE 2 BLOCK-A ST# - 7 H# 61-A','0342-6009403','',2,'','','HAFIZ ANAS OMER','','','0342-6009403','','','','','','','2024-07-31 11:09:52','2024-08-09 13:35:27',1,16,8,'Promoted','','0342-6009403','HAFIZ ANAS OMER','','','On',200,'On','On'),
(140,'REG-1140','-','Morning','1970-01-01','ZARA MUUDASSIR SHAH','Female',48,10,'1970-01-01','-','-','-','-','FAISAL TOWN A-BLOCK STREET 29 H# 671','FAISAL TOWN A-BLOCK STREET 29 H# 671','0303-5560180','-',10,'','','MUDASSIR SHAH','Father','-','0303-5560180','FAISAL TOWN A-BLOCK STREET 29 H# 671','-','','','','','2024-07-31 11:09:52','2024-08-09 13:33:59',1,16,8,'Promoted','-','0303-5560180','MUDASSIR SHAH','','','On',0,'On','On'),
(141,'REG-1141','','Morning',NULL,'M ZIA UR REHMAN ','Male',48,10,NULL,'','','','','H# CB-447/5 LALAZAR COLONY WAH CANTT','H# CB-447/5 LALAZAR COLONY WAH CANTT','0334-7315856','',2,'','','SADAQAT ALI','','','0334-7315856','','','','','','','2024-07-31 11:09:52','2024-08-09 13:34:44',1,16,8,'Promoted','','0334-7315856','SADAQAT ALI','','','On',200,'On','On'),
(142,'REG-1142','','Morning',NULL,'M SAQLAIN','Male',48,10,NULL,'','','','','LOHSAR SHARFOO WAH MOHALLAH GHARBI NEAR HAJI KARYANA STORE','LOHSAR SHARFOO WAH MOHALLAH GHARBI NEAR HAJI KARYANA STORE','0311-5363632','',2,'','','BILAL KHALID','','','0311-5363632','','','','','','','2024-07-31 11:09:52','2024-08-09 13:35:50',1,16,8,'Promoted','','0311-5363632','BILAL KHALID','','','On',200,'On','On'),
(143,'REG-1143','-','Morning','1970-01-01','HANIA NOOR','Female',47,10,'1970-01-01','-','-','-','-','-','-','0340-9549912','-',10,'','','IMTIAZ AHMED','Father','-','0340-9549912','-','-','','','','','2024-07-31 11:09:52','2024-08-28 08:46:12',1,16,8,'New Admission','-','0340-9549912','IMTIAZ AHMED',NULL,NULL,'On',200,'On','On'),
(144,'REG-1144','','Morning',NULL,'RAMEEN','Female',48,10,NULL,'','','','','NASEEM TOWN SECTOR - B HOUSE D-5 HARIPUR ','NASEEM TOWN SECTOR - B HOUSE D-5 HARIPUR ','0325-5089004','',2,'','','AMEER ZADA','','','0325-5089004','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0325-5089004','AMEER ZADA','','','On',0,'','On'),
(145,'REG-1145','-','Morning','1970-01-01','AREEDA KHAN','Female',48,10,'1970-01-01','-','-','-','-','H# B/129 NEAR CHEENA MARKET GULISTAN COLONY WAH CANTT','H# B/129 NEAR CHEENA MARKET GULISTAN COLONY WAH CANTT','0301-5057273','-',10,'','','AYAZ KHAN','Father','-','0301-5057273','H# B/129 NEAR CHEENA MARKET GULISTAN COLONY WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 13:32:12',1,16,8,'Promoted','-','0301-5057273','AYAZ KHAN','','','On',0,'On','On'),
(146,'REG-1146','','Morning',NULL,'HASNAIN AHMED','Male',48,10,NULL,'','','','','MOHALLAH SADIQABAD ST# 7 , H# 4 THATTHA KHALIL ROAD TAXILA','MOHALLAH SADIQABAD ST# 7 , H# 4 THATTHA KHALIL ROAD TAXILA','0319-5821748','',2,'','','WAQAS AHMED','','','0319-5821748','','','','','','','2024-07-31 11:09:52','2024-08-09 13:31:49',1,16,8,'Promoted','','0319-5821748','WAQAS AHMED','','','On',0,'','On'),
(147,'REG-1147','','Morning',NULL,'Muhammad SAIM','Male',48,10,NULL,'','','','','MOHALLAH SADIQABAD ST# 7 , H# 1 THATTHA KHALIL ROAD TAXILA','MOHALLAH SADIQABAD ST# 7 , H# 1 THATTHA KHALIL ROAD TAXILA','0332-5186087','',2,'','','AWAIS MEHMOOD','','','0332-5186087','','','','','','','2024-07-31 11:09:52','2024-08-09 13:34:11',1,16,8,'Promoted','','0332-5186087','AWAIS MEHMOOD','','','On',0,'','On'),
(148,'REG-1148','','Morning',NULL,'ESHAL FATIMA','Female',48,10,NULL,'','','','','CB-421 H# 1 ST# 2 JINNAH COLONY WAH CANTT','CB-421 H# 1 ST# 2 JINNAH COLONY WAH CANTT','0334-0114338','',2,'','','M MUBASHIR','','','0334-0114338','','','','','','','2024-07-31 11:09:52','2024-08-09 13:33:00',1,16,8,'Promoted','','0334-0114338','M MUBASHIR','','','On',200,'On','On'),
(149,'REG-1149','-','Morning','1970-01-01','KONAIN ALI','Male',48,10,'1970-01-01','-','-','-','-','MUGHAL HOUSE KHUBAIB ST# NEAR LAL KHAN MARKET SADAT COLONY','MUGHAL HOUSE KHUBAIB ST# NEAR LAL KHAN MARKET SADAT COLONY','0333-7704598','-',10,'','','HAMEED AHMED','Father','-','0333-7704598','MUGHAL HOUSE KHUBAIB ST# NEAR LAL KHAN MARKET SADAT COLONY','-','','','','','2024-07-31 11:09:52','2024-08-09 13:33:17',1,16,8,'Promoted','-','0333-7704598','HAMEED AHMED','','','On',200,'On','On'),
(150,'REG-1150','','Morning',NULL,'FATIMA ALI','Female',48,10,NULL,'','','','','H# 4G/ 292 NEAR BARRIER POF WAH CANTT','H# 4G/ 292 NEAR BARRIER POF WAH CANTT','0322-5280206','',1,'','','IRSHAD ALI','','','0322-5280206','','','','','','','2024-07-31 11:09:52','2024-08-09 13:33:30',1,16,8,'Promoted','','0322-5280206','IRSHAD ALI','','','On',100,'On','On'),
(151,'REG-1151','','Morning',NULL,'MANAHIL WASEEM','Female',48,10,NULL,'','','','','MOHALLAH FAQEERABAD NEAR LABMEEL STOP SULTANPUR','MOHALLAH FAQEERABAD NEAR LABMEEL STOP SULTANPUR','0340-0543880 ','',2,'','','WASEEM AKRAM','','','0340-0543880 ','','','','','','','2024-07-31 11:09:52','2024-08-09 13:35:10',1,16,8,'Promoted','','0340-0543880 ','WASEEM AKRAM','','','On',200,'On','On'),
(152,'REG-1152','','Morning',NULL,'WAREESHA TUFAIL','Female',48,10,NULL,'','','','','H# 19/1 , 26 AREA NEW GUDWAL SABZAZAAR COLONY WAH CANTT','H# 19/1 , 26 AREA NEW GUDWAL SABZAZAAR COLONY WAH CANTT','0326-5336686','',2,'','','TUFAIL ALI','','','0326-5336686','','','','','','','2024-07-31 11:09:52','2024-08-09 13:32:47',1,16,8,'Promoted','','0326-5336686','TUFAIL ALI','','','On',200,'On','On'),
(153,'REG-1153','-','Morning','1970-01-01','ABDUL RAFAY','Male',48,10,'1970-01-01','-','-','-','-','H# 156/2 RASHID MINHAS ROADLALARUKH WAH CANTT','H# 156/2 RASHID MINHAS ROADLALARUKH WAH CANTT','0314-5560091','-',10,'','','AQEEL AHMED','Father','-','0314-5560091','H# 156/2 RASHID MINHAS ROADLALARUKH WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0314-5560091','AQEEL AHMED','','','On',200,'On','On'),
(154,'REG-1154','','Morning',NULL,'ANAYA NOOR','Female',48,10,NULL,'','','','','H# 572 MUNIRBABD SABRI STREET WAH CANTT','H# 572 MUNIRBABD SABRI STREET WAH CANTT','0309-5130113','',2,'','','M TARIQ','','','0309-5130113','','','','','','','2024-07-31 11:09:52','2024-08-09 13:34:25',1,16,8,'Promoted','','0309-5130113','M TARIQ','','','On',200,'On','On'),
(155,'REG-1155','-','Morning','1970-01-01','M. BAQIR ALI','Male',48,10,'1970-01-01','-','-','-','-','Mohallah Ayat Shahi Taxila','Mohallah Ayat Shahi Taxila','0315-5721296','-',10,'','','Akhter Abbas','Father','-','0315-5721296','Mohallah Ayat Shahi Taxila','-','','','','','2024-07-31 11:09:52','2024-08-09 13:43:58',1,16,8,'New Admission','-','0315-5721296','Akhter Abbas','','','On',0,'On','On'),
(156,'REG-1156','','Morning',NULL,'ABRISH YOUSEF','Female',49,10,NULL,'','','','','H# 22-G / 692 POF WAH CANTT','H# 22-G / 692 POF WAH CANTT','0311-5332760','',1,'','','M YOUSEF','','','0311-5332760','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0311-5332760','M YOUSEF','','','On',100,'On','On'),
(157,'REG-1157','-','Morning','1970-01-01','AYAN KHALIL','Male',49,10,'1970-01-01','-','-','-','-','H# 1281 MOHALLAH ISLAMPURA HASSANABDAL','H# 1281 MOHALLAH ISLAMPURA HASSANABDAL','0315-5538138','-',2,'','','ABDUL KHALIL','Father','-','0315-5538138','H# 1281 MOHALLAH ISLAMPURA HASSANABDAL','-','','','','','2024-07-31 11:09:52','2024-08-10 13:28:16',1,16,8,'Promoted','-','0315-5538138','ABDUL KHALIL','','','On',200,'On','On'),
(158,'REG-1158','-','Morning','1970-01-01','GHULAM-E-MUSTAFA','Male',50,10,'1970-01-01','-','-','-','-','H# 102 MOHALLAH ISLAMPURA HASSANABDAL','H# 102 MOHALLAH ISLAMPURA HASSANABDAL','0319-3142965','-',10,'','','KHURRAM SHEHZAD','Father','-','0319-3142965','H# 102 MOHALLAH ISLAMPURA HASSANABDAL','-','','','','','2024-07-31 11:09:52','2024-08-28 09:06:40',1,16,8,'Promoted','-','0319-3142965','KHURRAM SHEHZAD',NULL,NULL,'On',200,'On','On'),
(159,'REG-1159','','Morning',NULL,'HUMZA','Male',49,10,NULL,'','','','','H# 102 MOHALLAH ISLAMPURA HASSANABDAL','H# 102 MOHALLAH ISLAMPURA HASSANABDAL','0319-3142965','',2,'','','KHURRAM SHEHZAD','','','0319-3142965','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0319-3142965','KHURRAM SHEHZAD','','','On',200,'On','On'),
(160,'REG-1160','-','Morning','1970-01-01','SANAAN AHMED','Male',49,10,'1970-01-01','-','-','-','-','H# 27-E / 200 WAH CANTT','H# 27-E / 200 WAH CANTT','0300-8069241','-',1,'','','IFTIKHAR AHMED','Father','-','0300-8069241','H# 27-E / 200 WAH CANTT','-','-','-','-','','2024-07-31 11:09:52','2024-08-10 15:03:37',1,16,8,'Promoted','-','0300-8069241','IFTIKHAR AHMED','','','On',0,'Off','On'),
(161,'REG-1161','-','Morning','1970-01-01','M ZAIN','Male',49,10,'1970-01-01','-','-','-','-','H # 37 PHASE -II ST# 05 NEW CITY','H # 37 PHASE -II ST# 05 NEW CITY','0347-0536802','-',2,'','','NASIR MEHMOOD','Father','-','0347-0536802','H # 37 PHASE -II ST# 05 NEW CITY','-','','','','','2024-07-31 11:09:52','2024-08-10 15:16:27',1,16,8,'Promoted','-','0347-0536802','NASIR MEHMOOD','','','On',0,'Off','On'),
(162,'REG-1162','','Morning',NULL,'M ANEES','Male',49,10,NULL,'','','','','H# NA. CB-1698 MOHALLAH GHARBI LOHSAR SHARFOO WAH CANTT','H# NA. CB-1698 MOHALLAH GHARBI LOHSAR SHARFOO WAH CANTT','0321-5077651','',2,'','','QAZAFI MEHMOOD','','','0321-5077651','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0321-5077651','QAZAFI MEHMOOD','','','On',200,'On','On'),
(163,'REG-1163','','Morning',NULL,'MINAHIL FATIMA','Female',49,10,NULL,'','','','','VILLAGE CHAKRA BAKRA P.O BOX HASSAR DISTT ATTOCK','VILLAGE CHAKRA BAKRA P.O BOX HASSAR DISTT ATTOCK','0342-5316050','',2,'','','AMJAD ALI','','','0342-5316050','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0342-5316050','AMJAD ALI','','','On',200,'On','On'),
(164,'REG-1164','','Morning',NULL,'MINAHIL BHATTI','Female',49,10,NULL,'','','','','H# CB-286 LALAZAR COLONY WAH CANTT','H# CB-286 LALAZAR COLONY WAH CANTT','0306-0889911','',2,'','','ZAIN AFZAL','','','0306-0889911','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0306-0889911','ZAIN AFZAL','','','On',200,'On','On'),
(165,'REG-1165','-','Morning','1970-01-01','SHAYAN AHMED','Male',50,10,'1970-01-01','-','-','-','-','H# F-155 25 AREA WAH CANTT','H# F-155 25 AREA WAH CANTT','0318-2615359','-',1,'','','ANWAR-UL-HAQ','Father','-','0318-2615359','H# F-155 25 AREA WAH CANTT','-','-','-','-','','2024-07-31 11:09:52','2024-08-28 09:07:17',1,16,8,'Promoted','-','0318-2615359','ANWAR-UL-HAQ',NULL,NULL,'On',100,'On','On'),
(166,'REG-1166','','Morning',NULL,'ANAYA SHOAIB','Female',49,10,NULL,'','','','','NEAR BARRIER 3 GATIYA ROAD BHATTI HOUSE AHMED NAGAR WAH CANTT','NEAR BARRIER 3 GATIYA ROAD BHATTI HOUSE AHMED NAGAR WAH CANTT','0307-9926977','',2,'','','SHOAIB KHALID','','','0307-9926977','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-9926977','SHOAIB KHALID','','','On',200,'On','On'),
(167,'REG-1167','-','Morning','1970-01-01','MINAHIL EMAAN','Female',50,10,'1970-01-01','-','-','-','-','NEW CITY PHASE 1 ST # 24 POF WAH CANTT','NEW CITY PHASE 1 ST # 24 POF WAH CANTT','0347-5554541','-',2,'','','KHALIL AKHTAR','Father','-','0347-5554541','NEW CITY PHASE 1 ST # 24 POF WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-28 09:02:03',1,16,8,'Promoted','-','0347-5554541','KHALIL AKHTAR',NULL,NULL,'On',200,'On','On'),
(168,'REG-1168','','Morning',NULL,'AYESHA NOOR','Female',49,10,NULL,'','','','','LALAZAR GALI AMEER MUAWIA MASJID NAZD FAROOQ-E-AZAM WAH CANTT','LALAZAR GALI AMEER MUAWIA MASJID NAZD FAROOQ-E-AZAM WAH CANTT','0318-5013357','',2,'','','SHAHID MEHMOOD','','','0318-5013357','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-5013357','SHAHID MEHMOOD','','','On',200,'On','On'),
(169,'REG-1169','','Morning',NULL,'ZAIN ALI','Male',49,10,NULL,'','','','','FAISAL HOUSE GALLI QUAID-E-AZAM CB-390 NAWABABAD WAH CANTT','FAISAL HOUSE GALLI QUAID-E-AZAM CB-390 NAWABABAD WAH CANTT','0312-6403877','',2,'','','FAISAL','','','0312-6403877','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-6403877','FAISAL','','','On',0,'','On'),
(170,'REG-1170','-','Morning','1970-01-01','IRTIZA KIYANI','Male',50,10,'1970-01-01','-','-','-','-','CB-6/1 NAZD WAH UNIVERSITY STOP JAMEELABAD','CB-6/1 NAZD WAH UNIVERSITY STOP JAMEELABAD','0346-5449896','-',2,'','','ADEEL AHMED','Father','-','0346-5449896','CB-6/1 NAZD WAH UNIVERSITY STOP JAMEELABAD','-','','','','','2024-07-31 11:09:52','2024-08-28 09:07:02',1,16,8,'Promoted','-','0346-5449896','ADEEL AHMED',NULL,NULL,'On',200,'On','On'),
(171,'REG-1171','','Morning',NULL,'M SHAMIR KHAN','Male',49,10,NULL,'','','','','H# 18-G 17/18 POF WAH CANTT','H# 18-G 17/18 POF WAH CANTT','0315-5734921','',1,'','','NOOR KHAN','','','0315-5734921','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0315-5734921','NOOR KHAN','','','On',100,'On','On'),
(172,'REG-1172','','Morning',NULL,'UMAIR HAYAT','Male',49,10,NULL,'','','','','MAIN G.T ROAD DATA HOTAL USMAN COLONY FAISAL TOWN WAH CANTT','MAIN G.T ROAD DATA HOTAL USMAN COLONY FAISAL TOWN WAH CANTT','0321-5213905','',2,'','','BUKHSHISH GUJJAR','','','0321-5213905','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0321-5213905','BUKHSHISH GUJJAR','','','On',200,'On','On'),
(173,'REG-1173','','Morning',NULL,'M Abbas','Male',49,10,NULL,'','','','','Mohallah Ayat Shahi Taxila','Mohallah Ayat Shahi Taxila','0315-5721296','',2,'','','Akhtar Abbas','','','0315-5721296','','','','','','','2024-07-31 11:09:52','2024-08-09 13:13:16',1,16,8,'New Admission','','0315-5721296','Akhtar Abbas','','','On',0,'','On'),
(174,'REG-1174','-','Morning','1970-01-01','AHMED NAVEED','Male',49,10,'1970-01-01','-','-','-','-','FLAT # 24 SHOP # 24 LAIQ ALI CHOWK WAH CANTT','FLAT # 24 SHOP # 24 LAIQ ALI CHOWK WAH CANTT','0343-7188475','-',10,'','','-','Father','-','0343-7188475','FLAT # 24 SHOP # 24 LAIQ ALI CHOWK WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0343-7188475','-','','','On',200,'On','On'),
(175,'REG-1175','','Morning',NULL,'IFRAIM ZAHRA','Female',50,10,NULL,'','','','','H# 409/6 - B LIAQAT ROAD LALAZAR WAH CANTT','H# 409/6 - B LIAQAT ROAD LALAZAR WAH CANTT','0336-5395040','',2,'','','','','','0336-5395040','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0336-5395040','','','','On',200,'On','On'),
(176,'REG-1176','','Morning',NULL,'MOIZ ALI','Male',50,10,NULL,'','','','','H# D-38810/10 LINE # 12 LALARUKH WAH CANTT','H# D-38810/10 LINE # 12 LALARUKH WAH CANTT','0341-0117756','',2,'','','','','','0341-0117756','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0341-0117756','','','','On',200,'On','On'),
(177,'REG-1177','-','Morning','1970-01-01','MUHAMMAD IBRAHIM','Male',50,10,'1970-01-01','-','-','-','-','H# CB-61 ST# 4 MOHALLAH ISMAILABAD NEAR BARRIER NO 2','H# CB-61 ST# 4 MOHALLAH ISMAILABAD NEAR BARRIER NO 2','0311-5026471','-',15,'','','-','Father','-','0311-5026471','H# CB-61 ST# 4 MOHALLAH ISMAILABAD NEAR BARRIER NO 2','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0311-5026471','-','','','On',100,'On','On'),
(178,'REG-1178','','Morning',NULL,'NOOR FATIMA','Female',50,10,NULL,'','','','','FLAT # 24 SHOP # 24 LAIQ ALI CHOWK WAH CANTT','FLAT # 24 SHOP # 24 LAIQ ALI CHOWK WAH CANTT','0343-7188475','',2,'','','','','','0343-7188475','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0343-7188475','','','','On',200,'On','On'),
(180,'REG-1180','','Morning',NULL,'ESHAL BIBI','Female',50,10,NULL,'','','','','VILLAGE BANIAN JALALAH TEHSIL TAXILA DISTT RAWALPINDI','VILLAGE BANIAN JALALAH TEHSIL TAXILA DISTT RAWALPINDI','0301-5437549','',2,'','','','','','0301-5437549','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0301-5437549','','','','On',0,'','On'),
(181,'REG-1181','','Morning',NULL,'SYEDA HANIA BUKHARI','Female',50,10,NULL,'','','','','H# 3 ST # 9 NEW SOCIETY PHASE 2 KOHSAR COLONY TAXILA','H# 3 ST # 9 NEW SOCIETY PHASE 2 KOHSAR COLONY TAXILA','0343-1355435','',2,'','','','','','0343-1355435','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0343-1355435','','','','On',200,'On','On'),
(182,'REG-1182','','Morning',NULL,'NOUMAN SHAHZAD','Male',50,10,NULL,'','','','','H # 99 TTI STREET NAWABABAD ','H # 99 TTI STREET NAWABABAD ','0349-8944035','',1,'','','','','','0349-8944035','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0349-8944035','','','','On',100,'On','On'),
(183,'REG-1183','','Morning',NULL,'TALHA ALI','Male',50,10,NULL,'','','','','H# 467 ST # 10/7 PHASE 1 NEW CITY','H# 467 ST # 10/7 PHASE 1 NEW CITY','0310-5452997','',2,'','','','','','0310-5452997','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0310-5452997','','','','On',200,'On','On'),
(184,'REG-1184','','Morning',NULL,'MUSAWAR NAWAZ','Male',51,10,NULL,'','','','','H# 30/6 POF WAH CANTT','H# 30/6 POF WAH CANTT','0307-7249118','',9,'','','SHAH NAWAZ','','','0307-7249118','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-7249118','SHAH NAWAZ','','','On',100,'On','On'),
(185,'REG-1185','','Morning',NULL,'HALEEMA SADIA','Female',51,10,NULL,'','','','','ST# MALIKA WALI MOHALLAH GHEELA KHURD TAXILA','ST# MALIKA WALI MOHALLAH GHEELA KHURD TAXILA','0302-0558751','',2,'','','MALIK WAQAS','','','0302-0558751','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0302-0558751','MALIK WAQAS','','','On',0,'','On'),
(186,'REG-1186','','Morning',NULL,'M AHSAN','Male',51,10,NULL,'','','','','H# CB-269 NEAR NORANI MASJID MOHABATABAD','H# CB-269 NEAR NORANI MASJID MOHABATABAD','0312-5289203','',2,'','','WAHEED IQBAL','','','0312-5289203','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-5289203','WAHEED IQBAL','','','On',200,'On','On'),
(187,'REG-1187','','Morning',NULL,'M ABUZAR','Male',51,10,NULL,'','','','','H# CB-1355 NAWABABAD','H# CB-1355 NAWABABAD','0318-5031463','',2,'','','M AWAIS','','','0318-5031463','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-5031463','M AWAIS','','','On',200,'On','On'),
(188,'REG-1188','','Morning',NULL,'MUJAHID UL ISLAM','Male',51,10,NULL,'','','','','H# 18 CHANAB ROAD 16 AREA WAH CANTT','H# 18 CHANAB ROAD 16 AREA WAH CANTT','0312--5853986','',2,'','','YASIR KHAN','','','0312--5853986','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312--5853986','YASIR KHAN','','','On',200,'On','On'),
(189,'REG-1189','-','Morning','1970-01-01','M UMAR','Male',52,10,'1970-01-01','-','-','-','-','H# 10-H 731 WAH CANTT','H# 10-H 731 WAH CANTT','0341-2144838','-',2,'','','ATTA-UR-REHMAN','Father','-','0341-2144838','H# 10-H 731 WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0341-2144838','ATTA-UR-REHMAN','','','On',200,'On','On'),
(190,'REG-1190','','Morning',NULL,'RAHEEM SHAH','Male',51,10,NULL,'','','','','QAZIABAD DHOK MOCHIAN NEAR JAMIABAD','QAZIABAD DHOK MOCHIAN NEAR JAMIABAD','0307-8910437','',2,'','','SHAH GHULAM','','','0307-8910437','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-8910437','SHAH GHULAM','','','On',200,'On','On'),
(191,'REG-1191','','Morning',NULL,'ABDUL REHMAN ','Male',51,10,NULL,'','','','','MALIK AKRAM STREET JALALABAD NEAR JAMIA MASJID RAZAY MUSTAFA\nMALIKABAD NAWABABAD','MALIK AKRAM STREET JALALABAD NEAR JAMIA MASJID RAZAY MUSTAFA\nMALIKABAD NAWABABAD','0346-5707598','',2,'','','SAJID HUSSAIN','','','0346-5707598','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-5707598','SAJID HUSSAIN','','','On',0,'','On'),
(192,'REG-1192','','Morning',NULL,'SHEHRYAR ','Male',51,10,NULL,'','','','','JANY BAHTR FATEH JANG POST OFFICE NEAR JAMIA MASJID ATTOCK','JANY BAHTR FATEH JANG POST OFFICE NEAR JAMIA MASJID ATTOCK','0310-5293664','',2,'','','M RAFAQAT','','','0310-5293664','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0310-5293664','M RAFAQAT','','','On',0,'','On'),
(193,'REG-1193','','Morning',NULL,'ABEERA MUBASHIR','Female',51,10,NULL,'','','','','H# CB-67 AKRAM STREET DARBAR-E-KAREEMI WAH CANTT','H# CB-67 AKRAM STREET DARBAR-E-KAREEMI WAH CANTT','0342-7520689','',2,'','','MUBASHIR','','','0342-7520689','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0342-7520689','MUBASHIR','','','On',200,'On','On'),
(194,'REG-1194','','Morning',NULL,'ABDUL MOIZ','Male',51,10,NULL,'','','','','MOHALLA-DHAIRI TARBELLA COLONY AHATTA POST OFFICE KHAS TAXILA','MOHALLA-DHAIRI TARBELLA COLONY AHATTA POST OFFICE KHAS TAXILA','0310-5520896','',2,'','','ZAHID KHAN','','','0310-5520896','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0310-5520896','ZAHID KHAN','','','On',0,'','On'),
(195,'REG-1195','','Morning',NULL,'FIZZA MAZHAR','Female',51,10,NULL,'','','','','H# 375/2 KHANABAD HAYAT COLONY TAXILA','H# 375/2 KHANABAD HAYAT COLONY TAXILA','0346-5710457','',1,'','','MAZHAR HUSSAIN','','','0346-5710457','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-5710457','MAZHAR HUSSAIN','','','On',100,'On','On'),
(196,'REG-1196','','Morning',NULL,'ABDUL WAJJI','Male',51,10,NULL,'','','','','STREET # 10 NEAR BILAL MASJID ASIFAABAD WAH CANTT','STREET # 10 NEAR BILAL MASJID ASIFAABAD WAH CANTT','0334-5058286','',1,'','','CH AZHAR','','','0334-5058286','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0334-5058286','CH AZHAR','','','On',100,'On','On'),
(197,'REG-1197','','Morning',NULL,'MEHR EHAN ABDULLAH','Male',51,10,NULL,'','','','','H# A-261 GULISTAN COLONY WAH CANTT','H# A-261 GULISTAN COLONY WAH CANTT','0333-5448352','',2,'','','SHAKIR HAROON KHAN','','','0333-5448352','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-5448352','SHAKIR HAROON KHAN','','','On',0,'','On'),
(198,'REG-1198','','Morning',NULL,'ANUSHA EJAZ','Female',52,10,NULL,'','','','','H# 1-F/71 POF WAH CANTT','H# 1-F/71 POF WAH CANTT','0300-5246342','',1,'','','EJAZ IQBAL','','','0300-5246342','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-5246342','EJAZ IQBAL','','','On',100,'On','On'),
(199,'REG-1199','','Morning',NULL,'TAYYABA FATIMA','Female',52,10,NULL,'','','','','H# 18-G / 1328 WAH CANTT','H# 18-G / 1328 WAH CANTT','0304-5899712','',1,'','','M SIDDIQUE KHAN','','','0304-5899712','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0304-5899712','M SIDDIQUE KHAN','','','On',100,'On','On'),
(200,'REG-1200','','Morning',NULL,'MUSFIRA ASIF ','Female',52,10,NULL,'','','','','MOHALLAH MUNEERABAD NEAR BY NOORANI MASJID WAH CANTT','MOHALLAH MUNEERABAD NEAR BY NOORANI MASJID WAH CANTT','0317-6422722','',1,'','','MUHAMMAD ASIF ','','','0317-6422722','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0317-6422722','MUHAMMAD ASIF ','','','On',100,'On','On'),
(201,'REG-1201','','Morning',NULL,'ESHALL WAJID','Female',52,10,NULL,'','','','','ND HOUSE QTR # 32 THANA STOP WAH CANTT','ND HOUSE QTR # 32 THANA STOP WAH CANTT','0301-5693248','',2,'','','M WAJID KHAN','','','0301-5693248','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0301-5693248','M WAJID KHAN','','','On',200,'On','On'),
(202,'REG-1202','','Morning',NULL,'ASHER ASAD','Male',52,10,NULL,'','','','','ST# 14, BLOCK A H # 1 NEW CITY PHASE II WAH CANTT ','ST# 14, BLOCK A H # 1 NEW CITY PHASE II WAH CANTT ','0304-0069719','',2,'','','ASAD BILAL AWAN','','','0304-0069719','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0304-0069719','ASAD BILAL AWAN','','','On',200,'On','On'),
(203,'REG-1203','','Morning',NULL,'M FAREED','Male',52,10,NULL,'','','','','FLAT # 7 AHMAD KHAN PLAZA QUAID-E-AZAM STREET NEAR \nGILLANI MART NAWABABAD WAH CANTT','FLAT # 7 AHMAD KHAN PLAZA QUAID-E-AZAM STREET NEAR \nGILLANI MART NAWABABAD WAH CANTT','0313-9885550','',2,'','','SHEHARYAR AHMAD ','','','0313-9885550','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-9885550','SHEHARYAR AHMAD ','','','On',200,'On','On'),
(204,'REG-1204','','Morning',NULL,'M KHAN','Male',52,10,NULL,'','','','','H# CB-20/9 ST# 2 ASIFABAD NEAR JINNAH HALL PUBLIC SCHOOL WAH CANTT','H# CB-20/9 ST# 2 ASIFABAD NEAR JINNAH HALL PUBLIC SCHOOL WAH CANTT','0331-5287194','',2,'','','IMRAN KHAN','','','0331-5287194','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0331-5287194','IMRAN KHAN','','','On',200,'On','On'),
(205,'REG-1205','','Morning',NULL,'AYAN ALI','Male',52,10,NULL,'','','','','VILLAGE MIRPUR MOHALLAH NEW SAIDPUR P.O BOX KHANPUR TEHSIL KHANPUR','VILLAGE MIRPUR MOHALLAH NEW SAIDPUR P.O BOX KHANPUR TEHSIL KHANPUR','0331-5506214','',2,'','','WASEEM AKHTER','','','0331-5506214','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0331-5506214','WASEEM AKHTER','','','On',0,'','On'),
(206,'REG-1206','','Morning',NULL,'M REHAN','Male',52,10,NULL,'','','','','H# 14-G/735 POF WAH CANTT','H# 14-G/735 POF WAH CANTT','0303-5008764','',9,'','','FAIZULLAH','','','0303-5008764','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0303-5008764','FAIZULLAH','','','On',100,'On','On'),
(207,'REG-1207','','Morning',NULL,'AHMED RAZA','Male',52,10,NULL,'','','','','QUAID-E-AZAM ST# NEARBY ZAHID MEDICOZ KHAN PLAZA NAWABABAD WAH CANTT','QUAID-E-AZAM ST# NEARBY ZAHID MEDICOZ KHAN PLAZA NAWABABAD WAH CANTT','0315-5600246','',2,'','','TOQEER ABBAS','','','0315-5600246','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0315-5600246','TOQEER ABBAS','','','On',200,'On','On'),
(208,'REG-1208','','Morning',NULL,'M ALI','Male',52,10,NULL,'','','','','H# 184 WAQAS COLONY 27 AREA NEW GUDWAL WAH CANTT','H# 184 WAQAS COLONY 27 AREA NEW GUDWAL WAH CANTT','0346-4502065','',2,'','','ZULFIQAR AHMED','','','0346-4502065','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0346-4502065','ZULFIQAR AHMED','','','On',200,'On','On'),
(209,'REG-1209','','Morning',NULL,'AMNA BIBI','Female',52,10,NULL,'','','','','VILLAGE GUDWAL, 26 AREA, BEHIND MUZAFFAR MARKET WAH CANTT TEHSIL TAXILA','VILLAGE GUDWAL, 26 AREA, BEHIND MUZAFFAR MARKET WAH CANTT TEHSIL TAXILA','0313-6271798','',1,'','','ABDUL RASHEED','','','0313-6271798','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-6271798','ABDUL RASHEED','','','On',0,'','On'),
(210,'REG-1210','-','Morning','1970-01-01','OBAID-ULLAH','Male',52,10,'1970-01-01','-','-','-','-','H# 3-B PHASE 2 MOHALLAH PEERANWALA NEW KHANPUR HARIPUR','H# 3-B PHASE 2 MOHALLAH PEERANWALA NEW KHANPUR HARIPUR','0316-5328548','-',2,'','','WAHEED GUL','Father','-','0316-5328548','H# 3-B PHASE 2 MOHALLAH PEERANWALA NEW KHANPUR HARIPUR','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0316-5328548','WAHEED GUL','','','On',0,'Off','On'),
(211,'REG-1211','','Morning',NULL,'M ABDULLAH KHAN','Male',52,10,NULL,'','','','','BUDHO P.O BOX NEAR ASHIQ CHOWK GUDWAL WAH CANTT','BUDHO P.O BOX NEAR ASHIQ CHOWK GUDWAL WAH CANTT','0314-8006860','',1,'','','M NADEEM','','','0314-8006860','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0314-8006860','M NADEEM','','','On',100,'On','On'),
(212,'REG-1212','','Morning',NULL,'KHOLA IMRAN','Female',53,10,NULL,'','','','','G.M HOUSE # 24 WAH CANTT','G.M HOUSE # 24 WAH CANTT','0333-51080454','',1,'','','M IMRAN','','','0333-51080454','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-51080454','M IMRAN','','','On',100,'On','On'),
(213,'REG-1213','','Morning',NULL,'MUZZIMIL AHMED','Male',53,10,NULL,'','','','','RASHID MINHAS ROAD NEAR BARRIER # 3 H# 156/2 WAH CANTT','RASHID MINHAS ROAD NEAR BARRIER # 3 H# 156/2 WAH CANTT','0300-9744139','',2,'','','AQEEL AHMAD','','','0300-9744139','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-9744139','AQEEL AHMAD','','','On',200,'On','On'),
(214,'REG-1214','','Morning',NULL,'ATTIYA SULTANA','Female',53,10,NULL,'','','','','CB-56 KHANABAD WAH CANTT','CB-56 KHANABAD WAH CANTT','0314-5817987','',2,'','','NOOR SULTAN','','','0314-5817987','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0314-5817987','NOOR SULTAN','','','On',200,'On','On'),
(215,'REG-1215','','Morning',NULL,'HASEEB RASOOL','Male',53,10,NULL,'','','','','109 / G - 97 POF WAH CANTT','109 / G - 97 POF WAH CANTT','0302-8914306','',1,'','','FAIZ RASOOL','','','0302-8914306','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0302-8914306','FAIZ RASOOL','','','On',100,'On','On'),
(216,'REG-1216','','Morning',NULL,'HABIBULLAH','Male',53,10,NULL,'','','','','CB-1678 / BARRIER @ 2 WAH CANTT','CB-1678 / BARRIER @ 2 WAH CANTT','0308-5018200','',2,'','','RASHID ALI','','','0308-5018200','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-5018200','RASHID ALI','','','On',200,'On','On'),
(217,'REG-1217','','Morning',NULL,'ABDULLAH IJAZ','Male',53,10,NULL,'','','','','SHAHWAIZ TOWN BOHTIMOR GUDWAL WAH CANTT','SHAHWAIZ TOWN BOHTIMOR GUDWAL WAH CANTT','0306-9870309','',2,'','','M IJAZ','','','0306-9870309','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0306-9870309','M IJAZ','','','On',200,'On','On'),
(218,'REG-1218','-','Morning','1970-01-01','AHMAD SHAH','Male',53,10,'1970-01-01','-','-','-','-','14-G / DEGREE COLLEGE WAH CANTT','14-G / DEGREE COLLEGE WAH CANTT','0305-5380168','-',10,'','','SYED SHAFIQUE SHAH','Father','-','0305-5380168','14-G / DEGREE COLLEGE WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0305-5380168','SYED SHAFIQUE SHAH','','','On',200,'On','On'),
(219,'REG-1219','','Morning',NULL,'M JABBIR ','Male',53,10,NULL,'','','','','MULTI GARDEN B-17 / 1142 ST# 51 B-BLOCK','MULTI GARDEN B-17 / 1142 ST# 51 B-BLOCK','0312-5185551','',2,'','','M IBRAR','','','0312-5185551','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-5185551','M IBRAR','','','On',0,'','On'),
(220,'REG-1220','','Morning',NULL,'M SAIF','Male',53,10,NULL,'','','','','MOHALLAH MUKARRAM TAXILA','MOHALLAH MUKARRAM TAXILA','0312-5245545','',2,'','','M DAUD','','','0312-5245545','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-5245545','M DAUD','','','On',0,'','On'),
(221,'REG-1221','-','Morning','1970-01-01','ISLAH-UD-DIN','Male',53,10,'1970-01-01','-','-','-','-','NAWABABAD / GUDWAL COLONY WAH CANTT','NAWABABAD / GUDWAL COLONY WAH CANTT','0300-5107751','-',15,'','','-','Father','-','0300-5107751','NAWABABAD / GUDWAL COLONY WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0300-5107751','-','','','On',0,'Off','On'),
(222,'REG-1222','','Morning',NULL,'MUBASHIR ALI','Male',53,10,NULL,'','','','','CB-437 ST# 4 JINNAH COLONY WAH CANTT','CB-437 ST# 4 JINNAH COLONY WAH CANTT','0301-1584143','',2,'','','SHER ZAMAN','','','0301-1584143','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0301-1584143','SHER ZAMAN','','','On',200,'On','On'),
(223,'REG-1223','-','Morning','1970-01-01','YASEEN ALI','Male',53,10,'1970-01-01','-','-','-','-','ST # 4 CB/437 JINNAH COLONY WAH CANTT','ST # 4 CB/437 JINNAH COLONY WAH CANTT','0303-1584143','-',10,'','','SHER ZAMAN','Father','-','0303-1584143','ST # 4 CB/437 JINNAH COLONY WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0303-1584143','SHER ZAMAN','','','On',200,'On','On'),
(224,'REG-1224','','Morning',NULL,'M Sabeeh Ur Rehman','Male',53,10,NULL,'','','','','CB-849 Riasatabad Wah Cantt','CB-849 Riasatabad Wah Cantt','0322-5742519','',1,'','','Shafiq-Ur-Rehman','','','0322-5742519','','','','','','','2024-07-31 11:09:52','2024-08-09 13:13:29',1,16,8,'New Admission','','0322-5742519','','','','On',0,'','On'),
(226,'REG-1226','-','Morning','1970-01-01','HASSAN RIZWAN','Male',54,11,'1970-01-01','-','-','-','-','H# CB-1511 ST# 18 NAWABABAD WAH CANTT','H# CB-1511 ST# 18 NAWABABAD WAH CANTT','0333-9423975','-',2,'','','RIZWAN AHMED','Father','-','0333-9423975','H# CB-1511 ST# 18 NAWABABAD WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-28 09:31:00',1,16,8,'Promoted','-','0333-9423975','RIZWAN AHMED',NULL,NULL,'On',200,'On','On'),
(227,'REG-1227','-','Morning','1970-01-01','SANAM YOUSAF','Female',54,11,'1970-01-01','-','-','-','-','KOHSAR COLONY PHASE 1 ST# 2 NEAR MASJID ALI TAXILA','KOHSAR COLONY PHASE 1 ST# 2 NEAR MASJID ALI TAXILA','0346-6250603','-',10,'','','M YOUSAF','Father','-','0346-6250603','KOHSAR COLONY PHASE 1 ST# 2 NEAR MASJID ALI TAXILA','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0346-6250603','M YOUSAF','','','On',200,'On','On'),
(228,'REG-1228','','Morning',NULL,'EYESHA NOOR','Female',54,11,NULL,'','','','','WAQAS COLONY H# 184 27 AREA NEW GADWAL POF WAH CANTT','WAQAS COLONY H# 184 27 AREA NEW GADWAL POF WAH CANTT','0303-6005113','',1,'','','WAHEED AHMED','','','0303-6005113','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0303-6005113','WAHEED AHMED','','','On',100,'On','On'),
(229,'REG-1229','-','Morning','1970-01-01','SYEDA MUATTAR','Female',54,11,'1970-01-01','-','-','-','-','H# 12 , ST# 5 MOHALLAH MAJAWAR TAXILA','H# 12 , ST# 5 MOHALLAH MAJAWAR TAXILA','0312-5612012','-',2,'','','SYED THAIR ABBAS','Father','-','0312-5612012','H# 12 , ST# 5 MOHALLAH MAJAWAR TAXILA','-','--','-','-','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0312-5612012','SYED THAIR ABBAS','','','On',0,'Off','On'),
(230,'REG-1230','','Morning',NULL,'SUNDAS NAWAZ','Female',54,11,NULL,'','','','','20/F - 224 POF WAH CANTT','20/F - 224 POF WAH CANTT','0321-9951130','',1,'','','HAQ NAWAZ','','','0321-9951130','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0321-9951130','HAQ NAWAZ','','','On',100,'On','On'),
(231,'REG-1231','','Morning',NULL,'DAIM REHMAN','Male',54,11,NULL,'','','','','KHANPUR KHOI MERA VILLAGE NEAR MASJID-E-AQSA','KHANPUR KHOI MERA VILLAGE NEAR MASJID-E-AQSA','0345-5493903','',2,'','','BABAR KHAN','','','0345-5493903','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0345-5493903','BABAR KHAN','','','On',200,'On','On'),
(232,'REG-1232','-','Morning','1970-01-01','AZFHAR REHMAN','Male',54,11,'1970-01-01','-','-','-','-','H# CB-41 KHANABAD WAH MODEL TOWN','H# CB-41 KHANABAD WAH MODEL TOWN','0301-5569578','-',14,'','','ZIA-UR-REHMAN','Father','-','0301-5569578','H# CB-41 KHANABAD WAH MODEL TOWN','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0301-5569578','ZIA-UR-REHMAN','','','On',0,'Off','On'),
(233,'REG-1233','-','Morning','1970-01-01','M. ALI','Male',54,11,'1970-01-01','-','-','-','-','OLD GM HOUSE NEAR MASJID WAH CANTT','OLD GM HOUSE NEAR MASJID WAH CANTT','0300-5237412','-',10,'','','SAIF-UR-REHMAN','Father','-','0300-5237412','OLD GM HOUSE NEAR MASJID WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0300-5237412','SAIF-UR-REHMAN','','','On',200,'On','On'),
(234,'REG-1234','','Morning',NULL,'MAHROZ ALI','Male',54,11,NULL,'','','','','MUGHAL HOUSE, KHUBAIB STREET, NEAR LAAL KHAN MARKET SADAT COLONY','MUGHAL HOUSE, KHUBAIB STREET, NEAR LAAL KHAN MARKET SADAT COLONY','0333-7704596','',2,'','','HAMEED AHMED','','','0333-7704596','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-7704596','HAMEED AHMED','','','On',200,'On','On'),
(235,'REG-1235','','Morning',NULL,'M. UMER','Male',54,11,NULL,'','','','','H# CB-504 , 27 AREA NEW GADWAL WAH CANTT','H# CB-504 , 27 AREA NEW GADWAL WAH CANTT','0318-5217919','',2,'','','ZAHID ALI','','','0318-5217919','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0318-5217919','ZAHID ALI','','','On',200,'On','On'),
(236,'REG-1236','','Morning',NULL,'HABIBA BIBI','Female',54,11,NULL,'','','','','JINNAH COLONY HOUSE # 10 , ST# 5 WAH CANTT','JINNAH COLONY HOUSE # 10 , ST# 5 WAH CANTT','0313-1584143','',2,'','','SHER ZAMAN','','','0313-1584143','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-1584143','SHER ZAMAN','','','On',200,'On','On'),
(237,'REG-1237','','Morning',NULL,'AMNA ABDULLAH','Female',55,11,NULL,'','','','','C-4 LALA RUKH WAH CANTT','C-4 LALA RUKH WAH CANTT','0300-9131180 ','',2,'','','M ABDULLAH','','','0300-9131180 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-9131180 ','M ABDULLAH','','','On',200,'On','On'),
(238,'REG-1238','','Morning',NULL,'FATIMA FAIZ','Female',55,11,NULL,'','','','','14-G -/c12 POFS','14-G -/c12 POFS','0343-9800272 ','',1,'','','FAIZ ULLAH','','','0343-9800272 ','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0343-9800272 ','FAIZ ULLAH','','','On',100,'On','On'),
(239,'REG-1239','','Morning',NULL,'AYESHA MAZHAR','Female',55,11,NULL,'','','','','LALARUKH H# B-280 LANE # 06 MINAR ROAD WAH CANTT','LALARUKH H# B-280 LANE # 06 MINAR ROAD WAH CANTT','0344-5502400','',2,'','','MAZHAR MEHMOOD','','','0344-5502400','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0344-5502400','MAZHAR MEHMOOD','','','On',200,'On','On'),
(240,'REG-1240','-','Morning','1970-01-01','SAMEER AHMED','Male',55,11,'1970-01-01','-','-','-','-','DHOK PATHAN AHMED NAGAR SHARQI WAH CANTT','DHOK PATHAN AHMED NAGAR SHARQI WAH CANTT','0342-9393482','-',10,'','','NAZIR AHMED','Father','-','0342-9393482','DHOK PATHAN AHMED NAGAR SHARQI WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0342-9393482','NAZIR AHMED','','','On',200,'On','On'),
(241,'REG-1241','','Morning',NULL,'SYED IBRAHIM SHAH','Male',55,11,NULL,'','','','','H# 7 ST# 1 HMC ROAD TAXILA','H# 7 ST# 1 HMC ROAD TAXILA','0316-2231386','',2,'','','IQTADAR HUSSAIN SHAH','','','0316-2231386','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0316-2231386','IQTADAR HUSSAIN SHAH','','','On',0,'','On'),
(242,'REG-1242','','Morning',NULL,'M. AWAIS','Male',55,11,NULL,'','','','','DHOK PATHAN AHMED NAGAR SHARKI WAH CANTT','DHOK PATHAN AHMED NAGAR SHARKI WAH CANTT','0300-8301724','',1,'','','MASROOR-UL-HAQ','','','0300-8301724','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0300-8301724','MASROOR-UL-HAQ','','','On',100,'On','On'),
(243,'REG-1243','','Morning',NULL,'M HAMZA','Male',55,11,NULL,'','','','','MUH DHOK SHEHZAD NAGAR HARIPUR TAXILA','MUH DHOK SHEHZAD NAGAR HARIPUR TAXILA','0313-1547955','',2,'','','JAMROZ KHAN','','','0313-1547955','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-1547955','JAMROZ KHAN','','','On',200,'On','On'),
(244,'REG-1244','','Morning',NULL,'SNOBER NAWAZ','Male',55,11,NULL,'','','','','25-F 110 POF WAH CANTT','25-F 110 POF WAH CANTT','0307-7249118','',1,'','','SHAHNAWAZ','','','0307-7249118','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-7249118','SHAHNAWAZ','','','On',100,'On','On'),
(245,'REG-1245','','Morning',NULL,'AWAIS AHMED','Male',55,11,NULL,'','','','','H# 7-F / 229 ANWAR CHOWK WAH CANTT','H# 7-F / 229 ANWAR CHOWK WAH CANTT','0305-5586940','',1,'','','ISLAM MUHAMMAD','','','0305-5586940','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0305-5586940','ISLAM MUHAMMAD','','','On',100,'On','On'),
(246,'REG-1246','','Morning',NULL,'HUMAIRA FATIMA','Female',55,11,NULL,'','','','','18-G / 277 POF WAH CANTT','18-G / 277 POF WAH CANTT','0307-5211278','',1,'','','BADAR MUNIR','','','0307-5211278','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0307-5211278','BADAR MUNIR','','','On',100,'On','On'),
(247,'REG-1247','','Morning',NULL,'SABA AFTAB','Female',55,11,NULL,'','','','','SADAT COLONY WAH CANTT','SADAT COLONY WAH CANTT','0302-52836','',2,'','','AFTAB AHMED','','','0302-52836','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0302-52836','AFTAB AHMED','','','On',200,'On','On'),
(248,'REG-1248','','Morning',NULL,'WAJIHA BIBI','Female',55,11,NULL,'','','','','TALOKAR TOWN NAIEABAD P/O HARIPUR','TALOKAR TOWN NAIEABAD P/O HARIPUR','0316-3639228','',2,'','','SAGHEER AHMED','','','0316-3639228','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0316-3639228','SAGHEER AHMED','','','On',200,'On','On'),
(249,'REG-1249','','Morning',NULL,'NOOR FATIMA','Female',55,11,NULL,'','','','','H # 1314 MUH JAGAL SEC # 2 KALA BUTT TOWNSHIP','H # 1314 MUH JAGAL SEC # 2 KALA BUTT TOWNSHIP','0340-9549912','',2,'','','IMTIAZ AHMED','','','0340-9549912','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0340-9549912','IMTIAZ AHMED','','','On',200,'On','On'),
(250,'REG-1250','','Morning',NULL,'NAYYAB ZAHRA','Female',55,11,NULL,'','','','','AKRAM ST DARBAR KAREEMI TAXILA WAH CANTT','AKRAM ST DARBAR KAREEMI TAXILA WAH CANTT','0313-0330514','',2,'','','MUBASHIR AHMED','','','0313-0330514','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0313-0330514','MUBASHIR AHMED','','','On',200,'On','On'),
(251,'REG-1251','','Morning',NULL,'M ALI HASSAN','Male',55,11,NULL,'','','','','ST# 27 JAMILABAD TAXILA WAH CANTT','ST# 27 JAMILABAD TAXILA WAH CANTT','0308-5248738','',2,'','','ABRAR HUSSAIN','','','0308-5248738','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0308-5248738','ABRAR HUSSAIN','','','On',200,'On','On'),
(252,'REG-1252','-','Morning','1970-01-01','M ABREHEEM','Male',55,11,'1970-01-01','-','-','-','-','NEW MUSLIM ABAD BOHTI MOR P.O KHAS AKWARI CEMENT WAH CANTT','NEW MUSLIM ABAD BOHTI MOR P.O KHAS AKWARI CEMENT WAH CANTT','0300-5381837','-',10,'','','JUMA KHAN','Father','-','0300-5381837','NEW MUSLIM ABAD BOHTI MOR P.O KHAS AKWARI CEMENT WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0300-5381837','JUMA KHAN','','','On',200,'On','On'),
(253,'REG-1253','','Morning',NULL,'SIBGHATULLAH','Male',56,11,NULL,'','','','','POF HOUSE # 13-F / 433 POF WAH CANTT','POF HOUSE # 13-F / 433 POF WAH CANTT','0311-2179979','',2,'','','A AYUB','','','0311-2179979','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0311-2179979','A AYUB','','','On',200,'On','On'),
(254,'REG-1254','','Morning',NULL,'ABDUL AHAD','Male',56,11,NULL,'','','','','CB-136, ST# 2 JINNAH COLONY WAH CANTT NEAR GULZAR MADINA','CB-136, ST# 2 JINNAH COLONY WAH CANTT NEAR GULZAR MADINA','0303-5099776','',1,'','','HAFIZ TAHIR','','','0303-5099776','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0303-5099776','HAFIZ TAHIR','','','On',200,'On','On'),
(255,'REG-1255','','Morning',NULL,'M ZUBAIR','Male',56,11,NULL,'','','','','POST OFFICE KHAS LAB THATHU DISTT TAXILA','POST OFFICE KHAS LAB THATHU DISTT TAXILA','0321-5827335','',2,'','','MANZOOR ELLAHI','','','0321-5827335','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0321-5827335','MANZOOR ELLAHI','','','On',200,'On','On'),
(256,'REG-1256','-','Morning','1970-01-01','SAMI-ULLAH','Male',56,11,'1970-01-01','-','-','-','-','6 AREA / 16 RAVI ROAD WAH CANTT','6 AREA / 16 RAVI ROAD WAH CANTT','0313-5829772','-',2,'','','SHOAIB AKHTER','Father','-','0313-5829772','6 AREA / 16 RAVI ROAD WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0313-5829772','SHOAIB AKHTER','','','On',200,'On','On'),
(257,'REG-1257','','Morning',NULL,'M ZAID ZAFAR','Male',56,11,NULL,'','','','','CB-813 QUAID-E-AZAM ST NAWABABAD WAH CANTT','CB-813 QUAID-E-AZAM ST NAWABABAD WAH CANTT','0312-7997635','',2,'','','ZAFAR IQBAL','','','0312-7997635','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0312-7997635','ZAFAR IQBAL','','','On',200,'On','On'),
(258,'REG-1258','','Morning',NULL,'JAWAD AHMED ','Male',56,11,NULL,'','','','','ST# 14 H # 18 REYASTABAD WAH CANTT','ST# 14 H # 18 REYASTABAD WAH CANTT','0347-9829510','',2,'','','ASAD HUSSAIN','','','0347-9829510','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0347-9829510','ASAD HUSSAIN','','','On',100,'On','On'),
(259,'REG-1259','','Morning',NULL,'M BOU ALI','Male',56,11,NULL,'','','','','BARRIER # CB / 72 SALEEM NAGAR ','BARRIER # CB / 72 SALEEM NAGAR ','','',2,'','','SHOUKAT ALI','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','SHOUKAT ALI','','','On',200,'On','On'),
(260,'REG-1260','','Morning',NULL,'DUA NAVEED','Female',56,11,NULL,'','','','','SHOP# 24 LAIQ ALI CHOWK WAH CANTT','SHOP# 24 LAIQ ALI CHOWK WAH CANTT','0343-7188475','',1,'','','M NAVEED','','','0343-7188475','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0343-7188475','M NAVEED','','','On',200,'On','On'),
(261,'REG-1261','-','Morning','1970-01-01','ARESHA NAZ','Female',56,11,'1970-01-01','-','-','-','-','CB/ 259 NEAR MASJID HANFIA MOHALLAH FAROOQ-E-AZAM RIASATABAD','CB/ 259 NEAR MASJID HANFIA MOHALLAH FAROOQ-E-AZAM RIASATABAD','0333-5717903','-',2,'','','ABDUL RASHEED','Father','-','0333-5717903','CB/ 259 NEAR MASJID HANFIA MOHALLAH FAROOQ-E-AZAM RIASATABAD','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0333-5717903','ABDUL RASHEED','','','On',200,'On','On'),
(262,'REG-1262','-','Morning','1970-01-01','AMNA BIBI','Female',56,11,'1970-01-01','-','-','-','-','14-G/ ZABAH KHANA WAH CANTT','14-G/ ZABAH KHANA WAH CANTT','0311-3711650','-',2,'','','SYED SHAFIQUE SHAH','Father','-','0311-3711650','14-G/ ZABAH KHANA WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0311-3711650','SYED SHAFIQUE SHAH','','','On',200,'On','On'),
(263,'REG-1263','','Morning',NULL,'AFIA AFSAR','Female',56,11,NULL,'','','','','26-G / 73 GUDWAL WAH CANTT','26-G / 73 GUDWAL WAH CANTT','0333-5083034','',1,'','','ALI AFSAR','','','0333-5083034','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0333-5083034','ALI AFSAR','','','On',200,'On','On'),
(264,'REG-1264','-','Morning','1970-01-01','AMNA SAFEER','Female',56,11,'1970-01-01','-','-','-','-','MOHALLAH GHAZI PURA ASIFABAD WAH CANTT','MOHALLAH GHAZI PURA ASIFABAD WAH CANTT','0344-5613074','-',2,'','','M SAFEER','Father','-','0344-5613074','MOHALLAH GHAZI PURA ASIFABAD WAH CANTT','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','0344-5613074','M SAFEER','','','On',200,'On','On'),
(265,'REG-1265','','Morning',NULL,'EMAN SAEED','Female',56,11,NULL,'','','','','VILLAGE BANI MOHALLAH TAXILA RAWALPINDI','VILLAGE BANI MOHALLAH TAXILA RAWALPINDI','0342-5316742','',2,'','','SAEED AKHTAR','','','0342-5316742','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','0342-5316742','SAEED AKHTAR','','','On',200,'On','On'),
(268,'REG-1268','-','Morning','1970-01-01','MAHNOOR','Female',56,11,'1970-01-01','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-28 09:52:45',1,16,8,'Struck Off','-','-','-','2024-08-28 14:52:45',NULL,'On',0,'Off','On'),
(269,'REG-1269','','Morning',NULL,'Ahmed Bin Azam','Male',57,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Khawaja M. Azam','','','On',200,'On','On'),
(270,'REG-1270','','Morning',NULL,'Muhammad Ismail Khan','Male',57,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Jumma Khan','','','On',200,'On','On'),
(271,'REG-1271','-','Morning','1970-01-01','Muhammad Umer Rauf','Male',57,11,'1970-01-01','-','-','-','-','-','-','-','-',17,'','','Abdul Rauf','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Abdul Rauf','','','On',0,'Off','On'),
(272,'REG-1272','-','Morning','1970-01-01','Hasnain Muavia','Male',57,11,'1970-01-01','-','-','-','-','-','-','-','-',10,'','','Saif Ur Rehman','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Saif Ur Rehman','','','On',200,'On','On'),
(273,'REG-1273','','Morning',NULL,'Fasi Ur Rehman','Male',57,11,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Siraj Din','','','On',100,'On','On'),
(274,'REG-1274','-','Morning','1970-01-01','Natasha Bibi','Female',57,11,'1970-01-01','-','-','-','-','-','-','-','-',14,'','','Ikram Ullah','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Ikram Ullah','','','On',0,'Off','On'),
(275,'REG-1275','','Morning',NULL,'Jawad Ahmed','Male',57,11,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Jawaid Akhter','','','On',0,'','On'),
(276,'REG-1276','','Morning',NULL,'Abdul Rehman','Male',57,11,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Ayaz Khan','','','On',0,'','On'),
(277,'REG-1277','-','Morning','1970-01-01','Hamza Muneer ','Male',57,11,'1970-01-01','-','-','-','-','-','-','-','-',10,'','','Muhammad Muneer','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Muhammad Muneer','','','On',200,'On','On'),
(287,'REG-1287','','Morning',NULL,'Fawaz Shahbaz','Female',58,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Sumreen Gul','','','On',0,'','On'),
(288,'REG-1288','','Morning',NULL,'Alisha Mehboob','Female',58,11,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Mehboob Ahmed','','','On',0,'','On'),
(289,'REG-1289','','Morning',NULL,'Moona Mehboob','Female',58,11,NULL,'','','','','','','','',9,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Mehboob Ahmed','','','On',0,'','On'),
(290,'REG-1290','','Morning',NULL,'Emaan Noor','Female',58,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Irfan','','','On',200,'On','On'),
(291,'REG-1291','','Morning',NULL,'Haseeb Ur Rehman','Male',58,11,NULL,'','','','','','','','',9,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','M. Afsar Shahzad','','','On',100,'On','On'),
(292,'REG-1292','','Morning',NULL,'Irum Batool','Female',58,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Yaqoob Ali','','','On',0,'','On'),
(293,'REG-1293','','Morning',NULL,'Maliha Sultan','Female',58,11,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Sultan Muhammad','','','On',100,'On','On'),
(294,'REG-1294','','Morning',NULL,'Rehan Khalid','Male',58,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','','','','On',0,'','On'),
(295,'REG-1295','','Morning',NULL,'Luqman','Male',58,11,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Najeeb Ullah','','','On',0,'','On'),
(296,'REG-1296','','Morning',NULL,'Iman Maqbool','Female',58,11,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Maqbool','','','On',100,'On','On'),
(297,'REG-1297','','Morning',NULL,'Isbah Waheed','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Waheed Afsar','','','On',200,'On','On'),
(298,'REG-1298','','Morning',NULL,'Maria Mehboob','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Mehboob Ahmed','','','On',0,'','On'),
(299,'REG-1299','','Morning',NULL,'Zoha Rashid ','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Muhammad Rashid','','','On',0,'','On'),
(300,'REG-1300','','Morning',NULL,'Areesha Farhat','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Naveed Qaisir','','','On',0,'','On'),
(301,'REG-1301','','Morning',NULL,'Hajira Bibi','Female',59,12,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Asif Mehmood','','','On',200,'On','On'),
(302,'REG-1302','','Morning',NULL,'Ayesha Sami','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Sami Ullah','','','On',200,'On','On'),
(303,'REG-1303','','Morning',NULL,'Muqadas Faisal','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Faisal Ikhlaq','','','On',200,'On','On'),
(304,'REG-1304','','Morning',NULL,'Sumaira Farooq','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Farooq Shah','','','On',200,'On','On'),
(305,'REG-1305','','Morning',NULL,'Zain Waheed','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Waheed Afsar','','','On',200,'On','On'),
(306,'REG-1306','','Morning',NULL,'M. Zeeshan Rasheed','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Suriyah Begum','','','On',200,'On','On'),
(307,'REG-1307','','Morning',NULL,'Malik Mubashir ','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Malik Umer Farooq','','','On',0,'','On'),
(308,'REG-1308','','Morning',NULL,'Sharjeel Nasir ','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Nasir Ahmed','','','On',200,'On','On'),
(309,'REG-1309','','Morning',NULL,'Muhammad Hamza ','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Noor Muhammad','','','On',200,'On','On'),
(310,'REG-1310','','Morning',NULL,'Rehan Attique','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Atique Ur Rehman','','','On',200,'On','On'),
(311,'REG-1311','','Morning',NULL,'M. Mubashir Alam','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Manazir Hussan','','','On',200,'On','On'),
(312,'REG-1312','','Morning',NULL,'Laiba Bibi','Female',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Abdul Rashid','','','On',200,'On','On'),
(313,'REG-1313','','Morning',NULL,'Syed Hussain Raza','Male',59,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','S. M. Nawaz','','','On',200,'On','On'),
(314,'REG-1314','','Morning',NULL,'Muzaamil Din','Male',61,9,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Safeena Bibi','','','On',200,'On','On'),
(315,'REG-1315','','Morning',NULL,'Abdullah','Male',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Muhammad Usman','','','On',200,'On','On'),
(316,'REG-1316','-','Morning','1970-01-01','Amina Bibi','Female',61,9,'1970-01-01','-','-','-','-','-','-','-','-',10,'','','Muhammad Dawood','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Muhammad Dawood','','','On',0,'Off','On'),
(317,'REG-1317','','Morning',NULL,'Muhammad Qasim','Male',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Muhammad Dawood','','','On',0,'','On'),
(318,'REG-1318','','Morning',NULL,'M Jalal Ud Din','Male',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','M. Muneer Ahmed','','','On',0,'','On'),
(319,'REG-1319','-','Morning','1970-01-01','Malika Tanveer','Male',61,9,'1970-01-01','-','-','-','-','-','-','-','-',1,'','','Tanveer Afzal','Father','-','-','-','-','-','-','-','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Tanveer Afzal','','','On',100,'On','On'),
(320,'REG-1320','','Morning',NULL,'Fatima Tahir','Female',61,9,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Tahir Hussain','','','On',0,'','On'),
(321,'REG-1321','','Morning',NULL,'Wasif Basit','Male',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Muhammad Basit','','','On',0,'','On'),
(322,'REG-1322','-','Morning','1970-01-01','Warda Zainab','Female',61,9,'1970-01-01','-','-','-','-','-','-','-','-',1,'','','Waheed Hussain Shah','Father','-','-','-','-','-','-','-','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Waheed Hussain Shah','','','On',100,'On','On'),
(323,'REG-1323','-','Morning','1970-01-01','Asolat Fatima','Female',61,9,'1970-01-01','-','-','-','-','-','-','-','-',2,'','','M. Muneer Ahemd','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','M. Muneer Ahemd','','','On',200,'On','On'),
(324,'REG-1324','','Morning',NULL,'Shahzaib Ali','Male',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Shahid Mehmood','','','On',200,'On','On'),
(325,'REG-1325','-','Morning','1970-01-01','Daniyal Hafeez','Male',61,9,'1970-01-01','-','-','-','-','-','-','-','-',1,'','','Abdul Hafeez','Father','-','-','-','-','-','-','-','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','Abdul Hafeez','','','On',100,'On','On'),
(326,'REG-1326','','Morning',NULL,'Ahmed Umar','Male',61,9,NULL,'','','','','','','','',1,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','Tabassum Aziz','','','On',0,'','On'),
(327,'REG-1327','','Morning',NULL,'Urwa Tul Wasqa','Female',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',1,16,8,'Promoted','','','M. Imran Khan','','','On',200,'On','On'),
(328,'REG-1328','','Morning',NULL,'Muhammad Hassan Ijaz','Male',61,9,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 13:14:28',1,16,8,'New Admission','','','Muhammad Ijaz','','','On',200,'On','On'),
(329,'REG-1329','','Morning',NULL,'Areej Naz','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Abdul Rasheed','','','On',200,'On','On'),
(330,'REG-1330','','Morning',NULL,'Samreen Shahzadi','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','M. Ishraq Shah','','','On',200,'On','On'),
(331,'REG-1331','','Morning',NULL,'Nayyab Mughal','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Khalid Mughal','','','On',200,'On','On'),
(332,'REG-1332','','Morning',NULL,'Samina Bibi','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Allah Bukhsh','','','On',200,'On','On'),
(333,'REG-1333','-','Morning','1970-01-01','Malaika Azam ','Female',60,12,'1970-01-01','-','-','-','-','-','-','-','-',9,'','','Azam Khan','Father','-','-','-','-','-','-','-','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','-','-','Azam Khan','','','On',0,'Off','On'),
(334,'REG-1334','','Morning',NULL,'Sana Bibi','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','M. Matloob','','','On',0,'','On'),
(335,'REG-1335','','Morning',NULL,'Fatiha Arshad','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Muhammad Arshad','','','On',0,'','On'),
(336,'REG-1336','','Morning',NULL,'Safia Ahsan ','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Ahsan Ullah Khan','','','On',200,'On','On'),
(337,'REG-1337','','Morning',NULL,'Ayesha Bibi','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Ashiq Hussain','','','On',200,'On','On'),
(338,'REG-1338','','Morning',NULL,'Hifza Bibi','Female',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Khurshid Bhatti','','','On',0,'','On'),
(339,'REG-1339','-','Morning','1970-01-01','Manan Mubarik','Male',60,12,'1970-01-01','-','-','-','-','-','-','-','-',16,'','','Mubarak Mehmood','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','-','-','Mubarak Mehmood','','','On',0,'Off','On'),
(340,'REG-1340','','Morning',NULL,'Muhammad Asif','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Muhammad Ashraf','','','On',0,'','On'),
(341,'REG-1341','','Morning',NULL,'Muhammad Ahmad','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Muhammad Yousaf Khan','','','On',0,'','On'),
(342,'REG-1342','','Morning',NULL,'Khan Muhammad','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Mushtreen Khan','','','On',200,'On','On'),
(343,'REG-1343','','Morning',NULL,'Musa Naseer','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Naseer Ahmed ','','','On',200,'On','On'),
(344,'REG-1344','','Morning',NULL,'Ali Hamza','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Nazeer Ahmed','','','On',200,'On','On'),
(345,'REG-1345','','Morning',NULL,'Kaif Naeem','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Muhammad Naeem','','','On',200,'On','On'),
(346,'REG-1346','','Morning',NULL,'Samar Mubarak','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Sajjad Hussain','','','On',200,'On','On'),
(347,'REG-1347','-','Morning','1970-01-01','Bilal Ahmed','Male',60,12,'1970-01-01','-','-','-','-','-','-','-','-',16,'','','Muzamil Shah','Father','-','-','-','-','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','-','-','Muzamil Shah','','','On',0,'Off','On'),
(348,'REG-1348','','Morning',NULL,'Muhammad Salman','Male',60,12,NULL,'','','','','','','','',2,'','','','','','','','','','','','','2024-07-31 11:09:52','2024-08-09 12:56:23',6,16,8,'Promoted','','','Khizar Hayat','','','On',0,'','On'),
(542,'REG-1330','-','Morning','2024-08-01','Dua Arif','Female',40,8,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','Zafar Iqbal','Father','-','-','-','-','','','','','2024-08-01 16:52:49','2024-08-10 13:07:21',1,16,8,'SLC','-','-','Zafar Iqbal','2024-08-10 18:07:21','1000','On',0,'Off','On'),
(543,'REG-1331','-','Morning','2024-08-02','Sheikh Talha','Male',45,8,'2024-08-02','Islam','Sunni','-','Urdu','-','-','-','-',2,'','','Shaikh Shareef Ud Din','Father','-','-','-','-','','','','','2024-08-01 19:55:07','2024-08-10 06:27:31',1,16,8,'Promoted','-','-','Shaikh Shareef Ud Din','','','On',200,'On','On'),
(544,'REG-1332','-','Morning','2024-08-02','Huzaifa Hassan','Male',45,8,'2024-08-02','Islam','-','-','-','-','-','-','-',2,'','','Saleem Raza','Father','-','-','-','-','','','','','2024-08-01 19:57:12','2024-08-28 07:46:47',1,16,8,'Promoted','-','-','Saleem Raza',NULL,NULL,'On',200,'On','On'),
(545,'REG-1333','-','Morning','2024-08-02','Mohtashim Abbas','Male',47,10,'2024-08-02','Islam','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-02 05:11:25','2024-08-09 13:08:54',1,16,8,'New Admission','-','-','-','','','On',0,'Off','On'),
(546,'REG-1334','-','Morning','2024-03-22','Abdul Wahab','Male',51,10,'2012-10-02','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-02 06:18:43','2024-08-09 12:56:23',1,16,8,'Promoted','-','-','-','','','On',0,'Off','On'),
(547,'REG-1335','-','Morning','2024-08-05','Ameena','Female',56,11,'2019-07-12','-','-','-','-','-','-','-','-',14,'','','-','Father','-','-','-','-','','','','','2024-08-05 07:28:14','2024-08-28 09:51:29',1,16,8,'Struck Off','-','-','-','2024-08-28 14:51:29','','On',0,'Off','On'),
(853,'REG-1336','-','Morning','2024-08-01','Shahzain','Male',42,8,'2024-08-29','-','-','-','-','-','-','-','-',1,'','','-','Father','-','-','-','-','-','-','-','','2024-08-29 06:22:40','2024-08-29 06:33:27',1,16,8,'New Admission','-','-','-',NULL,NULL,'Off',0,'Off','On'),
(854,'REG-1337','-','Morning','2024-08-29','Muhammad Hassan','Male',47,10,'2024-08-29','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 06:39:48','2024-08-29 06:39:48',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'On','On'),
(855,'REG-1338','-','Morning','2024-08-22','Hamna Rizwan','Male',47,10,'2024-08-29','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 06:52:46','2024-08-29 06:52:46',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'Off','On'),
(856,'REG-1339','-','Morning','2024-08-01','Ahmad Raza','Male',47,10,'2024-08-28','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 06:58:49','2024-08-29 06:58:49',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',200,'On','On'),
(857,'REG-1340','-','Morning','2024-04-10','Syeda Miraj','Female',49,10,'2015-08-19','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 07:12:44','2024-08-29 07:12:44',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',200,'On','On'),
(858,'REG-1341','-','Morning','2024-08-01','Muhammad Abdullah','Male',51,10,'2024-08-29','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 07:23:05','2024-08-29 07:23:05',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'Off','On'),
(859,'REG-1342','-','Morning','2024-08-01','Huziafa Masood','Male',56,11,'2024-08-02','-','-','-','-','-','-','-','-',1,'','','-','Father','-','-','-','-','-','-','-','','2024-08-29 07:38:51','2024-08-29 07:38:51',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'Off','On'),
(860,'REG-1343','-','Morning','2024-08-01','Muhammad Abdullah','Male',51,10,'2024-08-01','Islam','-','-','-','-','-','-','-',2,'','','Muhammad Javed','Father','-','-','-','-','','','','','2024-08-29 07:45:22','2024-08-29 07:49:00',1,16,8,'New Admission','-','-','Muhammad Javed',NULL,NULL,'Off',0,'Off','On'),
(861,'REG-1344','-','Morning','2024-08-01','Bin Yameen','Male',47,10,'2024-08-01','Islam','-','-','-','-','-','-','-',2,'','','Iftikhar Hussain','Father','-','-','-','-','','','','','2024-08-29 07:50:58','2024-08-29 07:50:58',1,16,8,'New Admission','-','-','Iftikhar Hussain',NULL,NULL,'On',0,'Off','On'),
(862,'REG-1345','-','Morning','2024-08-01','Ajwa Bibi','Female',47,10,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 07:51:51','2024-08-29 07:51:51',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'Off','On'),
(863,'REG-1346','-','Morning','2024-08-01','Habib Ullah','Male',47,10,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','Shahid Mehmood','Father','-','-','-','-','','','','','2024-08-29 07:52:45','2024-08-29 08:37:00',1,16,8,'New Admission','-','-','Shahid Mehmood',NULL,NULL,'On',0,'Off','On'),
(864,'REG-1347','-','Morning','2024-08-01','Huma Nazim','Male',53,10,'2024-08-02','-','-','-','-','-','-','-','-',2,'','','Nazim Ud Din','Father','-','-','-','-','','','','','2024-08-29 07:53:38','2024-08-29 07:53:38',1,16,8,'New Admission','-','-','Nazim Ud Din',NULL,NULL,'On',0,'Off','On'),
(865,'REG-1348','-','Morning','2024-08-01','Areesha Noor','Female',54,11,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 07:54:33','2024-08-29 07:54:33',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'Off','On'),
(866,'REG-1349','-','Morning','2024-08-01','Muskan Fatima','Female',57,11,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','-','Father','-','-','-','-','','','','','2024-08-29 07:56:01','2024-08-29 07:56:01',1,16,8,'New Admission','-','-','-',NULL,NULL,'On',0,'Off','On'),
(867,'REG-1350','-','Morning','2024-08-01','Eman Bibi','Female',57,11,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','Rizwan Ali','Father','-','-','-','-','','','','','2024-08-29 07:56:42','2024-08-29 08:39:50',1,16,8,'New Admission','-','-','Rizwan Ali',NULL,NULL,'On',0,'Off','On'),
(868,'REG-1351','-','Morning','2024-08-01','Urwa Zainab','Female',57,11,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','Fayyaz Jamil','Father','-','-','-','-','','','','','2024-08-29 07:57:24','2024-08-29 07:57:24',1,16,8,'New Admission','-','-','Fayyaz Jamil',NULL,NULL,'On',0,'Off','On'),
(869,'REG-1352','-','Morning','2024-08-01','Ghazala Arshad','Female',57,11,'2024-08-29','-','-','-','-','-','-','-','-',2,'','','Arshad Iqbal','Father','-','-','-','-','','','','','2024-08-29 07:58:14','2024-08-29 07:58:14',1,16,8,'New Admission','-','-','Arshad Iqbal',NULL,NULL,'On',0,'Off','On'),
(870,'REG-1353','-','Morning','2024-08-01','Hafsa Bibi','Female',57,11,'2024-08-12','-','-','-','-','-','-','-','-',2,'','','Rooh Ullah','Father','-','-','-','-','','','','','2024-08-29 08:00:02','2024-08-29 08:00:02',1,16,8,'New Admission','-','-','Rooh Ullah',NULL,NULL,'On',0,'Off','On'),
(871,'REG-1354','-','Morning','2024-08-01','Sawera Bibi','Female',57,11,'2024-08-01','-','-','-','-','-','-','-','-',2,'','','Asif Mehmood','Father','-','-','-','-','','','','','2024-08-29 08:05:21','2024-08-29 08:05:21',1,16,8,'New Admission','-','-','Asif Mehmood',NULL,NULL,'On',0,'Off','On'),
(872,'REG-1355','-','Morning','2024-08-02','Malik Mubashir Ilyas','Male',57,11,'2024-08-13','-','-','-','-','-','-','-','-',2,'','','Muhammad Ilyas','Father','-','-','-','-','','','','','2024-08-29 08:07:10','2024-08-29 08:07:10',1,16,8,'New Admission','-','-','Muhammad Ilyas',NULL,NULL,'On',0,'Off','On'),
(873,'REG-1356','-','Morning','2024-08-01','Malik Saim Ali','Male',57,11,'2024-08-08','-','-','-','-','-','-','-','-',2,'','','Sajjad Ahmed','Father','-','-','-','-','','','','','2024-08-29 08:12:11','2024-08-29 08:12:11',1,16,8,'New Admission','-','-','Sajjad Ahmed',NULL,NULL,'On',0,'Off','On'),
(874,'REG-1357','-','Morning','2024-08-01','Asad Ullah','Male',57,11,'2024-08-13','-','-','-','-','-','-','-','-',2,'','','Islam Ullah','Father','-','-','-','-','','','','','2024-08-29 08:17:19','2024-08-29 08:17:19',1,16,8,'New Admission','-','-','Islam Ullah',NULL,NULL,'On',0,'Off','On');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `campus_id` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(8,'zulfiqar','$2a$08$8m9OJmcND6MX9SftXjgtU.dbvmEUBEtpM9hlgJiMYUr.8vRnSPucO','User',16,'2024-07-02 09:22:16'),
(9,'admin','$2a$08$Uxsd.RMbu7Rag2wZyxYuhufAHmU0zDGmzeTe98OVn9QwoJpx/YdVq','Admin',4,'2024-07-02 09:25:04'),
(10,'naeem','$2a$08$Wx3uGJ.EvYZ1duFfAl.HTO06OWMpeh1Y6zbehrhfZkgatQUybK1Mq','User',1,'2024-07-02 09:55:49'),
(11,'irfan','$2a$08$HGmc6h7rHPjWbxOMEyHPru3Kp2ougbMCpfo75nkdbqsrXq7Xh8CcK','User',16,'2024-08-19 12:48:34'),
(12,'test','$2a$08$od4X9fnoQmqSA/gttffSG.4IYW6mZMc0XhjguijqvzVdVKjuVLr/.','Admin',16,'2024-09-09 04:26:57'),
(13,'test3','$2a$08$iu5sgh.8AMhQ.xBDXpnxGe2fnpQ5jJFw.AI42dnSmZ66aVopMSsT.','Admin',16,'2024-09-12 05:50:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-19  0:16:16
