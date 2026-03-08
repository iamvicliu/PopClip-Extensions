#!/bin/zsh

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/release-popclip.sh <Extension.popclipext> <tag>

Example:
  ./scripts/release-popclip.sh IPLookup.popclipext v1.0.2

Behavior:
  1. Packages the extension directory into a .popclipextz file
  2. Creates the git tag if it does not already exist
  3. Pushes the current branch and the tag to origin
  4. Creates or updates the GitHub release and uploads the package asset
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 2 ]]; then
  usage >&2
  exit 1
fi

extension_dir="$1"
tag="$2"

if [[ ! -d "$extension_dir" ]]; then
  echo "Extension directory not found: $extension_dir" >&2
  exit 1
fi

case "$extension_dir" in
  *.popclipext) ;;
  *)
    echo "Extension directory must end with .popclipext" >&2
    exit 1
    ;;
esac

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run inside a git repository." >&2
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  echo "Working tree is not clean. Commit or stash your changes first." >&2
  exit 1
fi

package_name="${extension_dir:t}.z"
release_title="$tag"
release_notes="Release $tag for ${extension_dir:t}."

echo "Packaging $extension_dir -> $package_name"
rm -f "$package_name"
zip -rFS "$package_name" "$extension_dir" >/dev/null

current_branch="$(git branch --show-current)"
if [[ -z "$current_branch" ]]; then
  echo "Could not determine current branch." >&2
  exit 1
fi

if git rev-parse "$tag" >/dev/null 2>&1; then
  echo "Tag already exists locally: $tag"
else
  echo "Creating tag $tag"
  git tag "$tag"
fi

echo "Pushing branch $current_branch"
git push origin "$current_branch"

echo "Pushing tag $tag"
git push origin "$tag"

if gh release view "$tag" >/dev/null 2>&1; then
  echo "Updating existing release $tag"
  gh release upload "$tag" "$package_name" --clobber
else
  echo "Creating release $tag"
  gh release create "$tag" "$package_name" --title "$release_title" --notes "$release_notes"
fi

echo "Done: $(gh release view "$tag" --json url -q .url)"
