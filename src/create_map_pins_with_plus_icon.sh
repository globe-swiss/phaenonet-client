#!/usr/bin/env bash
set -e

current_dir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd "$current_dir/assets/img/map_pins"

mkdir -p de-CH/generated
mkdir -p fr-CH/generated
mkdir -p it-CH/generated

generate_images() {
  for f in *.png; do
    magick composite ../ico_phaenonet+.png -gravity NorthWest -geometry +135+18 \
      "$f" "generated/${f%%.*}_+.png"
  done
}

cd "de-CH"
generate_images
cd ".."

cd "fr-CH"
generate_images
cd ".."

cd "it-CH"
generate_images
cd ".."
