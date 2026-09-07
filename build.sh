#!/bin/bash
# Builds ClaudeBuddy.app. Needs the Xcode command line tools and node (for the icon).
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"
APP="$ROOT/build/ClaudeBuddy.app"
NAME="ClaudeBuddy"

echo "› cleaning"
rm -rf "$APP" "$ROOT/build/$NAME" "$ROOT/build/icon.iconset" "$ROOT/build/$NAME.icns"

echo "› compiling"
SDK="$(xcrun --show-sdk-path)"
swiftc -O -sdk "$SDK" \
  -framework Cocoa -framework WebKit \
  "$ROOT/Sources/main.swift" -o "$ROOT/build/$NAME"

echo "› icon"
node "$ROOT/tools/make-icon.js" "$ROOT/build/icon.png"
mkdir -p "$ROOT/build/icon.iconset"
for s in 16 32 64 128 256 512; do
  sips -z $s $s "$ROOT/build/icon.png" --out "$ROOT/build/icon.iconset/icon_${s}x${s}.png" >/dev/null
  d=$((s*2))
  sips -z $d $d "$ROOT/build/icon.png" --out "$ROOT/build/icon.iconset/icon_${s}x${s}@2x.png" >/dev/null
done
cp "$ROOT/build/icon.png" "$ROOT/build/icon.iconset/icon_512x512@2x.png"
iconutil -c icns "$ROOT/build/icon.iconset" -o "$ROOT/build/$NAME.icns"

echo "› bundling"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$ROOT/build/$NAME" "$APP/Contents/MacOS/$NAME"
cp "$ROOT/Resources/"*.html "$ROOT/Resources/"*.js "$APP/Contents/Resources/"
cp "$ROOT/build/$NAME.icns" "$APP/Contents/Resources/AppIcon.icns"
printf 'APPL????' > "$APP/Contents/PkgInfo"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Claude Buddy</string>
  <key>CFBundleDisplayName</key><string>Claude Buddy</string>
  <key>CFBundleExecutable</key><string>$NAME</string>
  <key>CFBundleIdentifier</key><string>com.siddhantbhat.claudebuddy</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
  <key>NSSupportsAutomaticGraphicsSwitching</key><true/>
</dict>
</plist>
PLIST

echo "› signing (ad-hoc)"
codesign --force --deep --sign - "$APP" >/dev/null 2>&1 || echo "  (unsigned — still runs locally)"

echo "› zipping"
rm -f "$ROOT/build/ClaudeBuddy.zip"
ditto -c -k --keepParent "$APP" "$ROOT/build/ClaudeBuddy.zip"

echo
echo "built: $APP"
echo "zip:   $ROOT/build/ClaudeBuddy.zip"
