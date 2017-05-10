#!/bin/bash

### Releasing
current=`grep -P "version\": \"\d+.\d+.\d+(\w*)" package.json | grep -oP "\d+.\d+.\d+(\w*)"`
echo "Current version: $current"

if [[ $1 =~ ^[0-9]+.[0-9]+.[0-9]+((a|b)[0-9]+)?$ ]]; then
  echo "Changing to version: $1"
  # Change the version in package.json and test file
  sed -i "s/version\": .*/version\": \"$1\",/g" package.json

  # Commit
  git reset HEAD
  git add package.json
  git commit -m "v$1"
  git tag "v$1"
else
  echo "Wrong version format"
fi
