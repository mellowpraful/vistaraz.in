#!/usr/bin/env node
/**
 * Auto Git Sync Script for Vistaraz - Prafful (ps) branch
 * Stages all changes, commits, pulls latest from Prafful with rebase, and pushes to origin/Prafful.
 */

const { execSync } = require('child_process');

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (err) {
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

function sync() {
  console.log('🔄 [Git Sync] Starting automatic sync for Prafful (ps) branch...');

  // 1. Check current branch
  let currentBranch = '';
  try {
    currentBranch = run('git rev-parse --abbrev-ref HEAD');
  } catch (e) {
    console.error('❌ Failed to determine current git branch');
    process.exit(1);
  }

  console.log(`📌 Current branch: ${currentBranch}`);

  const targetRemoteBranch = 'Prafful';

  // 2. Stage all changes
  console.log('📦 Staging files...');
  run('git add -A');

  // 3. Check if changes exist to commit
  let hasChanges = false;
  try {
    run('git diff --cached --quiet');
  } catch (diffErr) {
    hasChanges = true;
  }

  if (hasChanges) {
    const customMsg = process.argv.slice(2).join(' ');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const commitMsg = customMsg || `feat: auto-sync updates to Prafful (ps) branch [${timestamp}]`;

    console.log(`💾 Committing changes: "${commitMsg}"...`);
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    console.log('  ✓ Committed');
  } else {
    console.log('ℹ️ No new local changes to commit.');
  }

  // 4. Fetch and pull latest remote changes with rebase
  console.log(`⬇️ Pulling latest changes from origin/${targetRemoteBranch}...`);
  try {
    run(`git pull --rebase origin ${targetRemoteBranch}`);
    console.log('  ✓ Up to date with remote');
  } catch (pullErr) {
    console.warn(`  ⚠️ Pull/rebase notice: ${pullErr.message || pullErr}`);
    try {
      run('git rebase --abort');
    } catch (_) {}
  }

  // 5. Push to origin Prafful and ps
  console.log('⬆️ Pushing to origin (Prafful & ps)...');
  try {
    run(`git push origin ${currentBranch}:Prafful`);
    console.log('  ✓ Successfully pushed to origin/Prafful');
  } catch (pushErr) {
    console.error(`❌ Push to Prafful failed: ${pushErr.message || pushErr}`);
  }

  try {
    run(`git push origin ${currentBranch}:ps`);
    console.log('  ✓ Successfully pushed to origin/ps');
  } catch (pushErr) {
    console.warn(`  ⚠️ Push to ps notice: ${pushErr.message || pushErr}`);
  }

  console.log('✨ [Git Sync] Completed successfully! Prafful (ps) branch is synced.');
}

sync();
