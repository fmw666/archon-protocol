# Sandbox test recordings — asciinema

[asciinema](https://asciinema.org/) `.cast` files for the **terminal
verification** half of each sandbox scenario. Pairs with the IDE-side
mp4 recordings under [`../videos/`](../videos/README.md).

## Naming convention

```
<test-id>.cast        ← single file, no poster needed
```

One `.cast` per scenario, matching the `test_id` front-matter on the
scenario page.

## How to record

```bash
# install once
brew install asciinema       # or: pipx install asciinema

# from the sandbox tmp directory
asciinema rec ~/archon-protocol/docs/public/asciinema/<test-id>.cast \
  --title "<scenario short title>" \
  --idle-time-limit 2 \
  --command "bash"

# inside the recorded shell, run the verification commands:
ls -la .archon/
python3 scripts/archon-check.py --root .
cat .archon/VERSION
# Ctrl-D to stop the recording
```

## What to capture

The mp4 covers the **agent prompt → response** part inside the IDE.
The asciinema covers the **post-install verification** part inside a
plain terminal:

| Stage | Typical commands to capture |
|-------|------------------------------|
| install | `tree -L 2 .archon`, `cat .archon/VERSION`, `python3 scripts/archon-check.py --root .` |
| update | `git diff .archon/VERSION`, `git status`, the `archon-check.py` re-run |
| sync | `archon sync` (or the agent's URL-less variant), then `git status` to show no writes happened |
| uninstall | `ls -la .archon` (should fail or be empty), `ls -la <BINDING_ROOT>` (gone) |

Keep each cast under 60 s.

## How a scenario page consumes the file

```md
<AsciinemaPlaceholder test-id="install-cursor-node" />
```

To activate the real player after upload, replace with:

```html
<asciinema-player src="/asciinema/install-cursor-node.cast" cols="100" rows="24" />
```

(The `<asciinema-player>` web component is loaded lazily on pages that
contain it — wiring TBD when the first cast lands.)

## Index of expected files

See [Test Matrix](../../testing/sandbox/test-matrix) — same `test-id`
list as videos.
