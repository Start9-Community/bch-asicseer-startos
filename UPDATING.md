# Updating the upstream version

This package builds [asicseer-pool](https://github.com/cculianu/asicseer-pool) from source in its own `Dockerfile`.

## Determining the upstream version

```sh
gh release view -R cculianu/asicseer-pool --json tagName -q .tagName
```

The current pin is the `ASICSEER_REF` build argument in `Dockerfile`.

## Applying the bump

1. Set `ASICSEER_REF` in `Dockerfile` to the new tag, and `ASICSEER_COMMIT` to the commit it points to:

   ```sh
   git ls-remote https://github.com/cculianu/asicseer-pool.git 'refs/tags/<tag>' 'refs/tags/<tag>^{}'
   ```

   Take the `^{}` line's hash when there is one (an annotated tag), otherwise the tag's own. The build fails unless the tag resolves to that commit and the commit is signed by `ASICSEER_SIGNING_KEY`. If a release is signed by another key, confirm that key belongs to the asicseer-pool maintainer from more than one source (a keyserver and a project the maintainer publishes it in, such as Electron Cash's `pubkeys/`) before replacing `assets/release-signing-key.asc` and `ASICSEER_SIGNING_KEY` together.

2. Build the image (`make x86`). `patches/apply.py` asserts the expected hit count of every patch it applies, so a line that moved upstream fails the build with the patch that needs reanchoring named. Reanchor it against the new source rather than loosening the assertion — each patch is what makes the pool work against one of the three supported nodes, and a silently skipped one produces a pool that starts and mines nothing.
