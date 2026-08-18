# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`Dockerfile` builds asicseer-pool from source**, in about a minute. Do not reintroduce the retired arrangement where a separate workflow pushed a prebuilt binary image to GHCR and the `Dockerfile` copied binaries out of it: that image was amd64-only while the manifest claimed aarch64, and it lived in a namespace this repo cannot publish to.
- **`pool_fee` must be written with a decimal point.** asicseer-pool reads it through jansson's `json_is_real`, which is false for a whole number — `"pool_fee": 0` is discarded in favour of the built-in 1% default. `fileModels/asicseer.conf.ts` handles that with a placeholder substitution; don't "simplify" it back to plain `JSON.stringify`.
- **`main` must never throw for a user-fixable problem.** A thrown `main` crash-loops under auto-restart and leaks a mount set every cycle, so the missing/mismatched payout address and unreachable node paths return a single failing `mining` health check instead. Keep that shape.
- **Statistics must be wiped before the daemons launch.** asicseer-pool reloads its totals from `{logdir}/pool/pool.status` at start, so clearing under a running pool achieves nothing. A chain change wipes them too — shares counted at one chain's difficulty mean nothing on another.
- **The payout address is chain-checked locally, by prefix.** Flowee's `validateaddress` is legacy-base58-only and calls every CashAddr invalid, so asking the node is not an option.
- **BCHN remaps its RPC port per chain**; BCHD and Flowee are fixed. BCHD is dialed through its plaintext proxy so no certificate has to be trusted.
- **The node is reached with `sdk.host.getBridgeAddress`, never `<package-id>.startos`** — that overlay DNS is deprecated and forbidden.
- **The `mining` check scrapes the log before probing the port.** asicseer-pool holds the stratum port open while it cannot get a block template, so a bare port check reports a pool that mines nothing.
- **The configured payout address collects the pool fee only.** Miners are paid in the coinbase, to the address each supplies as its stratum username — don't describe it as "where blocks are paid".
