#!/bin/zsh

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/release-popclip.sh <Extension.popclipext> <tag>

Example:
  ./scripts/release-popclip.sh IPLookup.popclipext v1.0.2

Behavior:
  1. Updates README direct download links to the target tag
  2. Packages the extension directory into a .popclipextz file
  3. Creates the git tag if it does not already exist
  4. Pushes the current branch and the tag to origin
  5. Creates or updates the GitHub release and uploads the package asset
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
package_basename="${extension_dir:t}.z"
extension_basename="${extension_dir:t}"
release_title="$tag"
release_notes="Release $tag for $extension_basename."
repo_root="$(git rev-parse --show-toplevel)"
root_readme="$repo_root/README.md"
extension_readme="$repo_root/$extension_dir/README.md"
download_url="https://github.com/iamvicliu/PopClip-Extensions/releases/download/$tag/$package_basename"
extension_readme_link="./$extension_dir"

update_readme_links() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  perl -0pi -e 's#https://github\.com/iamvicliu/PopClip-Extensions/releases/download/v[0-9][^/\s]*/\Q'"$package_basename"'\E#'"$download_url"'#g' "$file"
}

ensure_root_readme_entry() {
  [[ -f "$root_readme" ]] || return 0

  if ! rg -Fq "$extension_readme_link" "$root_readme"; then
    cat >>"$root_readme" <<EOF

### ${extension_basename%.*}

- Source: [$extension_basename]($extension_readme_link)
- Latest release: <https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- Direct package: <$download_url>

### ${extension_basename%.*}（中文）

- 源码目录：[$extension_basename]($extension_readme_link)
- 最新版本：<https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- 直接下载：<$download_url>
EOF
  fi
}

echo "Updating README download links to $tag"
update_readme_links "$root_readme"
update_readme_links "$extension_readme"
ensure_root_readme_entry

if [[ -n "$(git status --short)" ]]; then
  echo "Committing README download link updates"
  git add "$root_readme" "$extension_readme"
  git commit -m "Update release links for $tag"
fi

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
