# Reviewer installer implementation plan

Goal: a reviewer downloads one archive, unpacks it, and starts the local model with Docker already installed. No Git, Node, Python, API keys, build, or Hugging Face connection on their machine.

Architecture: preserve the approved classic Figma plugin and CPU model. Build two Docker images (linux/amd64 and linux/arm64), including the pinned verified model, on public GitHub Actions runners. Package each saved image with Compose, launchers, and the compiled plugin. GitHub Releases hosts the archives; no registry login or rented server.

Constraints: no paid services; no source vector changes; model behavior unchanged; Figma Desktop import remains manual and unverified. Do not describe Linux tests as Windows/macOS native verification. The clean standalone product checkout is reserved for this task; work on a feature branch and preserve the running service during packaging.

Review focus: missing Docker/daemon; spaces in paths; occupied port; architecture mismatch; offline startup without a preexisting model volume.

- [ ] Add an archive packaging test: compiled plugin, model image, Compose image reference, executable shell launcher, no development caches/secrets.
- [ ] Implement package script and simple Windows / macOS / Linux launchers with useful failure instructions. Do not change execution policy or install tools automatically.
- [ ] Add an image target containing the verified model; retain source-build Compose for development.
- [ ] Build and smoke-test both architectures in GitHub Actions, publish draft release assets, then publish only after successful builds.
- [ ] Verify a fresh extracted archive and offline model request; verify anonymous download and checksums.
- [ ] Update README with direct installer links, actual prerequisites, native Figma limitation, and separate developer commands.

Decision: prefer release archives over GHCR for this installer. GHCR initially creates private packages and requires a separate manual visibility change. A public release gives anonymous downloads directly under the already authorized public repository.
