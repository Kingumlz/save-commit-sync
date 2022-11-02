/**
 * Extension module.
 *
 * This sets up the VS Code extension's command entry-point and applies logic in
 * the prepareCommitMsg module to a target branch.
 */
import * as vscode from "vscode";
import { API } from "./api/git";
import { makeAndFillCommitMsg } from "./autofill";
import { getGitExtension } from "./gitExtension";

function _validateFoundRepos(git: API) {
  let msg = "";

  if (!git) {
    msg = "Unable to load Git Extension";
  } else if (git.repositories.length === 0) {
    msg =
      "No repos found. Please open a repo or run `git init` then try again.";
  }

  if (msg) {
    vscode.window.showErrorMessage(msg);

    throw new Error(msg);
  }
}

/**
 * Run autofill against one of multiples in the workspace.
 *
 * This is a rare flow.
 *
 * @param sourceControl Of type `vscode.SourceControl` with public `.rootUri`
 *   and private `.rootUri`.
 */
async function _handleRepos(git: API, sourceControl: any) {
  // FIXME: Unfortunately this seems to only pick up the first repo and not find
  // second, etc.
  const selectedRepo = git.repositories.find(repository => {
    const uri = sourceControl._rootUri;
    if (!uri) {
      console.warn("_rootUri not set");
    }
    return repository.rootUri.path === uri.path;
  });

  if (selectedRepo) {
    await makeAndFillCommitMsg(selectedRepo);
  } else {
    vscode.window.showErrorMessage("No repos found");
  }
}

/**
 * Run autofill flow for a single repo in the workspace.
 */
async function _handleRepo(git: API) {
  const targetRepo = git.repositories[0];
  await makeAndFillCommitMsg(targetRepo);
}

/**
 * Choose the relevant repo and apply autofill logic on files there.
 */
async function _chooseRepoForAutofill(uri?: vscode.Uri) {
  const git = getGitExtension()!;
  _validateFoundRepos(git);

  vscode.commands.executeCommand("workbench.view.scm");

  if (uri) {
    _handleRepos(git, uri);
  } else {
    _handleRepo(git);
  }
}

async function helloWorldTest (uri?: vscode.Uri) {
  vscode.window.showInformationMessage("Hello, world!");
}

async function uploadCloud (uri?: vscode.Uri) {
  vscode.window.showInformationMessage("Uploading changes to cloud...");
  await vscode.commands.executeCommand("workbench.action.files.saveAll");
  const git = getGitExtension()!;
  await _handleRepo(git);
  await vscode.commands.executeCommand("git.commitAll");
  await vscode.commands.executeCommand("git.push");
}

/**
 * Set up the extension activation.
 *
 * The autofill command as configured in `package.json` will be triggered
 * and run the autofill logic for a repo.
 */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "commitMsg.autofill",
    _chooseRepoForAutofill
  );
  const hwTest = vscode.commands.registerCommand(
    "commitMsg.helloWorldTest",
    helloWorldTest
  );
  const uploadCloudCommand = vscode.commands.registerCommand(
    "commitMsg.uploadCloudCommand",
    uploadCloud);
  context.subscriptions.push(disposable);
  context.subscriptions.push(hwTest);
  context.subscriptions.push(uploadCloudCommand);
}

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() { }
