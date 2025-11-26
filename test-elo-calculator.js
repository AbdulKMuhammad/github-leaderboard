#!/usr/bin/env node

// test-elo-calculator.js - Unit tests for the Elo system

// Determine the correct path to elo-calculator.js
const path = require('path');
const fs = require('fs');

let calculatorPath;
if (fs.existsSync('./elo-calculator.js')) {
  calculatorPath = './elo-calculator.js';
} else if (fs.existsSync('./.github/scripts/elo-calculator.js')) {
  calculatorPath = './.github/scripts/elo-calculator.js';
} else {
  console.error('Error: Could not find elo-calculator.js');
  console.error('Please run this script from the repository root or the same directory as elo-calculator.js');
  process.exit(1);
}

const {
  calculateTaskDifficulty,
  calculateQualityMultiplier,
  calculateTimeBonus,
  expectedScore,
  getKFactor
} = require(calculatorPath);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function assertEqual(actual, expected, testName) {
  if (Math.abs(actual - expected) < 0.01) {
    log(colors.green, `✓ PASS: ${testName}`);
    return true;
  } else {
    log(colors.red, `✗ FAIL: ${testName}`);
    log(colors.yellow, `  Expected: ${expected}, Got: ${actual}`);
    return false;
  }
}

function assertRange(actual, min, max, testName) {
  if (actual >= min && actual <= max) {
    log(colors.green, `✓ PASS: ${testName}`);
    return true;
  } else {
    log(colors.red, `✗ FAIL: ${testName}`);
    log(colors.yellow, `  Expected range: ${min}-${max}, Got: ${actual}`);
    return false;
  }
}

// Test suite
function runTests() {
  log(colors.cyan, '\n=== Testing Elo Calculator ===\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: K-Factor calculation
  log(colors.blue, 'Test Group: K-Factor Calculation');
  if (assertEqual(getKFactor(5), 32, 'New contributor K-factor')) passed++; else failed++;
  if (assertEqual(getKFactor(25), 24, 'Regular contributor K-factor')) passed++; else failed++;
  if (assertEqual(getKFactor(100), 16, 'Veteran contributor K-factor')) passed++; else failed++;
  
  // Test 2: Expected Score calculation
  log(colors.blue, '\nTest Group: Expected Score (Probability)');
  const expectedEqual = expectedScore(1200, 1200);
  if (assertEqual(expectedEqual, 0.5, 'Equal ratings should give 0.5 probability')) passed++; else failed++;
  
  const expectedHigher = expectedScore(1400, 1200);
  if (assertRange(expectedHigher, 0.7, 0.8, 'Higher rating should give >0.5 probability')) passed++; else failed++;
  
  const expectedLower = expectedScore(1000, 1200);
  if (assertRange(expectedLower, 0.2, 0.3, 'Lower rating should give <0.5 probability')) passed++; else failed++;
  
  // Test 3: Task Difficulty calculation
  log(colors.blue, '\nTest Group: Task Difficulty');
  
  const simpleBug = {
    labels: ['bug'],
    additions: 50,
    deletions: 30,
    changed_files: 2,
    review_comments: 3
  };
  const bugDifficulty = calculateTaskDifficulty(simpleBug);
  if (assertEqual(bugDifficulty, 1000, 'Simple bug fix difficulty')) passed++; else failed++;
  
  const complexFeature = {
    labels: ['feature', 'architecture'],
    additions: 1200,
    deletions: 400,
    changed_files: 25,
    review_comments: 15
  };
  const featureDifficulty = calculateTaskDifficulty(complexFeature);
  if (assertRange(featureDifficulty, 1600, 1700, 'Complex feature difficulty should be high')) passed++; else failed++;
  
  const documentation = {
    labels: ['documentation'],
    additions: 100,
    deletions: 20,
    changed_files: 3,
    review_comments: 2
  };
  const docDifficulty = calculateTaskDifficulty(documentation);
  if (assertEqual(docDifficulty, 1100, 'Documentation difficulty')) passed++; else failed++;
  
  // Test 4: Quality Multiplier
  log(colors.blue, '\nTest Group: Quality Multiplier');
  
  const highQuality = {
    approved_reviews: 2,
    changes_requested: 0,
    linked_issues: 2,
    commits: 3,
    review_comments: 5,
    additions: 200
  };
  const highQualityMultiplier = calculateQualityMultiplier(highQuality);
  if (assertRange(highQualityMultiplier, 1.3, 1.5, 'High quality PR should have high multiplier')) passed++; else failed++;
  
  const lowQuality = {
    approved_reviews: 0,
    changes_requested: 2,
    linked_issues: 0,
    commits: 15,
    review_comments: 1,
    additions: 100
  };
  const lowQualityMultiplier = calculateQualityMultiplier(lowQuality);
  if (assertRange(lowQualityMultiplier, 0.5, 0.8, 'Low quality PR should have low multiplier')) passed++; else failed++;
  
  const normalQuality = {
    approved_reviews: 1,
    changes_requested: 0,
    linked_issues: 1,
    commits: 5,
    review_comments: 3,
    additions: 150
  };
  const normalQualityMultiplier = calculateQualityMultiplier(normalQuality);
  if (assertRange(normalQualityMultiplier, 1.0, 1.3, 'Normal quality PR should be around 1.0-1.3')) passed++; else failed++;
  
  // Test 5: Time Bonus
  log(colors.blue, '\nTest Group: Time Bonus');
  
  const now = new Date();
  const fastPR = {
    created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    merged_at: now.toISOString()
  };
  const fastBonus = calculateTimeBonus(fastPR);
  if (assertEqual(fastBonus, 1.1, 'Fast PR (<24h) should get bonus')) passed++; else failed++;
  
  const moderatePR = {
    created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    merged_at: now.toISOString()
  };
  const moderateBonus = calculateTimeBonus(moderatePR);
  if (assertEqual(moderateBonus, 1.05, 'Moderate PR (<3 days) should get small bonus')) passed++; else failed++;
  
  const slowPR = {
    created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    merged_at: now.toISOString()
  };
  const slowBonus = calculateTimeBonus(slowPR);
  if (assertEqual(slowBonus, 0.95, 'Slow PR (>1 week) should get penalty')) passed++; else failed++;
  
  const veryFastPR = {
    created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    merged_at: now.toISOString()
  };
  const veryFastBonus = calculateTimeBonus(veryFastPR);
  if (assertEqual(veryFastBonus, 0.9, 'Very fast PR (<2h) should get slight penalty')) passed++; else failed++;
  
  // Test 6: Complete Elo calculation example
  log(colors.blue, '\nTest Group: Complete Elo Calculation Example');
  
  const contributor1200 = 1200;
  const task1300 = 1300;
  const kFactor = 24;
  
  const expected1 = expectedScore(contributor1200, task1300);
  const actual1 = 1; // Success (merged)
  const baseChange = kFactor * (actual1 - expected1);
  
  log(colors.yellow, `\nExample Calculation:`);
  log(colors.yellow, `  Contributor Elo: ${contributor1200}`);
  log(colors.yellow, `  Task Difficulty: ${task1300}`);
  log(colors.yellow, `  K-Factor: ${kFactor}`);
  log(colors.yellow, `  Expected Score: ${expected1.toFixed(3)}`);
  log(colors.yellow, `  Base Elo Change: ${baseChange.toFixed(2)}`);
  log(colors.yellow, `  With 1.2x quality and 1.1x time: ${(baseChange * 1.2 * 1.1).toFixed(2)}`);
  
  if (assertRange(baseChange, 14, 17, 'Base Elo change for typical PR')) passed++; else failed++;
  
  // Summary
  log(colors.cyan, `\n=== Test Results ===`);
  log(colors.green, `Passed: ${passed}`);
  if (failed > 0) {
    log(colors.red, `Failed: ${failed}`);
  }
  log(colors.cyan, `Total: ${passed + failed}\n`);
  
  return failed === 0;
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);