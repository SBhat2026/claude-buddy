// Claude Buddy — a small desktop companion.
// Native shell: a transparent, non-activating panel that follows the sprite around the
// screen, plus a normal window for the studio. All the drawing and behaviour is in the
// web views under Resources/.

import Cocoa
import WebKit
import ApplicationServices

let PET_W: CGFloat = 420
let PET_H: CGFloat = 320

// Top-left origin of the global coordinate space the web side uses.
func globalTop() -> CGFloat {
    return NSScreen.screens.first?.frame.maxY ?? 0
}

func screenContaining(_ p: NSPoint) -> NSScreen {
    for s in NSScreen.screens where NSPointInRect(p, s.frame) { return s }
    return NSScreen.main ?? NSScreen.screens[0]
}

/// A panel that never steals focus from whatever the user is actually doing.
final class PetPanel: NSPanel {
    override var canBecomeKey: Bool { return true }
    override var canBecomeMain: Bool { return false }
}

final class Bridge: NSObject, WKScriptMessageHandler {
    weak var app: AppDelegate?
    init(_ app: AppDelegate) { self.app = app }
    func userContentController(_ c: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        app?.handle(type: type, body: body)
    }
}

let DEBUG = ProcessInfo.processInfo.environment["CBDEBUG"] == "1"
func dlog(_ items: Any...) {
    guard DEBUG else { return }
    FileHandle.standardError.write((items.map { "\($0)" }.joined(separator: " ") + "\n").data(using: .utf8)!)
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate {

    var petPanel: PetPanel!
    var petView: WKWebView!
    var studioWindow: NSWindow?
    var studioView: WKWebView?
    var statusItem: NSStatusItem!
    var mouseTimer: Timer?
    var state: [String: Any] = [:]
    var petHidden = false
    var lastScreenFrame: NSRect = .zero
    var contextTimer: Timer?
    var lastFrontApp: String = ""
    var lastWindowTitle: String = ""
    var lastContextSent: Date = .distantPast
    var appBeforeTalking: NSRunningApplication?

    var resourcesURL: URL {
        if let r = Bundle.main.resourceURL,
           FileManager.default.fileExists(atPath: r.appendingPathComponent("pet.html").path) {
            return r
        }
        // running straight out of the build folder
        return URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("Resources")
    }

    var stateURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ClaudeBuddy", isDirectory: true)
        try? FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        return base.appendingPathComponent("state.json")
    }

    // MARK: - lifecycle

    func applicationDidFinishLaunching(_ note: Notification) {
        NSApp.setActivationPolicy(.accessory)
        loadState()
        buildStatusItem()
        buildPetPanel()
        startMouseTimer()
        startContextTimer()
        NotificationCenter.default.addObserver(self, selector: #selector(screensChanged),
            name: NSApplication.didChangeScreenParametersNotification, object: nil)
        if CommandLine.arguments.contains("--studio") { openStudio() }
        if DEBUG, let path = ProcessInfo.processInfo.environment["CBSNAP"] {
            if let demo = ProcessInfo.processInfo.environment["CBDEMO"] {
                Timer.scheduledTimer(withTimeInterval: 5, repeats: false) { [weak self] _ in
                    self?.command(["cmd": demo, "seconds": 40])
                }
            }
            if let ask = ProcessInfo.processInfo.environment["CBASK"] {
                let parts = ask.split(separator: "|", maxSplits: 1).map(String.init)
                Timer.scheduledTimer(withTimeInterval: 3, repeats: false) { [weak self] _ in
                    self?.askModel(["id": "dbg", "view": "pet", "endpoint": parts.first ?? "",
                                    "model": parts.count > 1 ? parts[1] : "", "timeoutMs": 20000.0,
                                    "system": "You are a pixel creature.",
                                    "prompt": "Reply with JSON only: {\"say\":\"..\",\"do\":\"wave\"}"])
                }
            }
            Timer.scheduledTimer(withTimeInterval: 8.4, repeats: false) { [weak self] _ in
                self?.command(["cmd": "say", "text": "watch this"])
            }
            Timer.scheduledTimer(withTimeInterval: 9, repeats: false) { [weak self] _ in self?.snapshot(to: path) }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ s: NSApplication) -> Bool { return false }

    // Launching the app again brings the studio up, the way a menu-bar app usually behaves.
    func applicationShouldHandleReopen(_ s: NSApplication, hasVisibleWindows: Bool) -> Bool {
        openStudio()
        return true
    }

    /// Debug helper: write what the buddy view is actually drawing to a PNG.
    func snapshot(to path: String) {
        let config = WKSnapshotConfiguration()
        config.afterScreenUpdates = true
        petView.takeSnapshot(with: config) { image, error in
            guard let image = image,
                  let tiff = image.tiffRepresentation,
                  let rep = NSBitmapImageRep(data: tiff),
                  let png = rep.representation(using: .png, properties: [:]) else {
                dlog("snapshot failed:", error?.localizedDescription ?? "no image"); return
            }
            try? png.write(to: URL(fileURLWithPath: path))
            dlog("snapshot written:", path)
        }
    }

    // MARK: - web views

    func makeWebView(page: String, transparent: Bool) -> WKWebView {
        let config = WKWebViewConfiguration()
        let controller = WKUserContentController()
        controller.add(Bridge(self), name: "buddy")
        config.userContentController = controller
        let view = WKWebView(frame: .zero, configuration: config)
        if transparent {
            view.setValue(false, forKey: "drawsBackground")
            if #available(macOS 12.0, *) { view.underPageBackgroundColor = .clear }
        }
        if #available(macOS 13.3, *) { view.isInspectable = true }
        view.navigationDelegate = self
        let url = resourcesURL.appendingPathComponent(page)
        view.loadFileURL(url, allowingReadAccessTo: resourcesURL)
        return view
    }

    func buildPetPanel() {
        let panel = PetPanel(contentRect: NSRect(x: 200, y: 200, width: PET_W, height: PET_H),
                             styleMask: [.borderless, .nonactivatingPanel],
                             backing: .buffered, defer: false)
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.isFloatingPanel = true
        panel.hidesOnDeactivate = false
        panel.level = alwaysOnTop() ? .floating : .normal
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .ignoresCycle, .stationary]
        panel.ignoresMouseEvents = true
        petView = makeWebView(page: "pet.html", transparent: true)
        petView.frame = NSRect(x: 0, y: 0, width: PET_W, height: PET_H)
        petView.autoresizingMask = [.width, .height]
        panel.contentView = petView
        panel.orderFrontRegardless()
        petPanel = panel
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { dlog("loaded", webView.url?.lastPathComponent ?? "?") }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        dlog("load failed:", error.localizedDescription)
    }

    func openStudio() {
        if let w = studioWindow {
            NSApp.activate(ignoringOtherApps: true)
            w.makeKeyAndOrderFront(nil)
            return
        }
        let w = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1000, height: 700),
                         styleMask: [.titled, .closable, .miniaturizable, .resizable],
                         backing: .buffered, defer: false)
        w.title = "Buddy Studio"
        w.center()
        w.minSize = NSSize(width: 860, height: 560)
        w.isReleasedWhenClosed = false
        w.delegate = self
        let view = makeWebView(page: "studio.html", transparent: false)
        view.frame = w.contentLayoutRect
        view.autoresizingMask = [.width, .height]
        w.contentView = view
        studioView = view
        studioWindow = w
        NSApp.activate(ignoringOtherApps: true)
        w.makeKeyAndOrderFront(nil)
    }

    func windowWillClose(_ note: Notification) {
        if (note.object as? NSWindow) === studioWindow { studioWindow = nil; studioView = nil }
    }

    // MARK: - status bar

    func buildStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.image = statusImage()
            button.image?.isTemplate = true
        }
        let menu = NSMenu()
        menu.addItem(withTitle: "Buddy Studio…", action: #selector(menuStudio), keyEquivalent: ",").target = self
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "Come Here", action: #selector(menuCome), keyEquivalent: "").target = self
        menu.addItem(withTitle: "Do Something", action: #selector(menuTrick), keyEquivalent: "").target = self
        menu.addItem(withTitle: "Play Ball", action: #selector(menuBall), keyEquivalent: "").target = self
        menu.addItem(withTitle: "Backflip", action: #selector(menuFlip), keyEquivalent: "").target = self
        menu.addItem(withTitle: "Sleep", action: #selector(menuSleep), keyEquivalent: "").target = self
        menu.addItem(withTitle: "Recentre", action: #selector(menuCentre), keyEquivalent: "").target = self
        menu.addItem(withTitle: "Next Display", action: #selector(menuNextDisplay), keyEquivalent: "").target = self
        menu.addItem(NSMenuItem.separator())
        let hide = NSMenuItem(title: "Hide Buddy", action: #selector(menuToggleHide), keyEquivalent: "")
        hide.target = self
        menu.addItem(hide)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "Quit Claude Buddy", action: #selector(menuQuit), keyEquivalent: "q").target = self
        statusItem.menu = menu
    }

    /// A tiny version of the sprite for the menu bar.
    func statusImage() -> NSImage {
        let size = NSSize(width: 18, height: 18)
        let img = NSImage(size: size)
        img.lockFocus()
        NSColor.black.setFill()
        let u: CGFloat = 2
        NSRect(x: 4, y: 8, width: 10, height: 8).fill()   // body
        NSRect(x: 2, y: 8, width: 14, height: 3).fill()   // arms
        NSRect(x: 4, y: 3, width: u, height: 5).fill()    // legs
        NSRect(x: 8, y: 3, width: u, height: 5).fill()
        NSRect(x: 12, y: 3, width: u, height: 5).fill()
        NSColor.white.setFill()
        NSRect(x: 6, y: 13, width: u, height: u).fill()   // eyes
        NSRect(x: 10, y: 13, width: u, height: u).fill()
        img.unlockFocus()
        return img
    }

    @objc func menuStudio() { openStudio() }
    @objc func menuCome() { command(["cmd": "come"]) }
    @objc func menuSleep() { command(["cmd": "sleep"]) }
    @objc func menuBall() { command(["cmd": "ball", "seconds": 30]) }
    @objc func menuFlip() { command(["cmd": "flip"]) }
    @objc func menuCentre() { command(["cmd": "center"]) }
    @objc func menuQuit() { NSApp.terminate(nil) }
    @objc func menuTrick() {
        let pool = (state["rotation"] as? [String]) ?? ["wave", "dance", "jump"]
        command(["cmd": "play", "anim": pool.randomElement() ?? "wave", "seconds": 5])
    }
    @objc func menuToggleHide() {
        petHidden.toggle()
        if petHidden { petPanel.orderOut(nil) } else { petPanel.orderFrontRegardless() }
        if let item = statusItem.menu?.items.first(where: { $0.action == #selector(menuToggleHide) }) {
            item.title = petHidden ? "Show Buddy" : "Hide Buddy"
        }
        post(to: studioView, ["type": "petVisible", "value": !petHidden])
    }
    @objc func menuNextDisplay() {
        let screens = NSScreen.screens
        guard screens.count > 1 else { command(["cmd": "center"]); return }
        let here = screenContaining(NSPoint(x: petPanel.frame.midX, y: petPanel.frame.midY))
        let idx = screens.firstIndex(of: here) ?? 0
        let next = screens[(idx + 1) % screens.count]
        let vf = next.visibleFrame
        petPanel.setFrameOrigin(NSPoint(x: vf.midX - PET_W / 2, y: vf.minY))
        sendScreen(force: true, screen: next)
        command(["cmd": "center"])
    }

    @objc func screensChanged() { sendScreen(force: true, screen: nil) }

    // MARK: - messages from the web side

    func handle(type: String, body: [String: Any]) {
        switch type {
        case "ready":
            let view = (body["view"] as? String) == "studio" ? studioView : petView
            post(to: view, ["type": "state", "state": state])
            if (body["view"] as? String) == "studio" {
                post(to: studioView, ["type": "petVisible", "value": !petHidden])
            } else {
                sendScreen(force: true, screen: nil)
            }

        case "move":
            guard let x = body["x"] as? CGFloat ?? (body["x"] as? Double).map({ CGFloat($0) }),
                  let y = body["y"] as? CGFloat ?? (body["y"] as? Double).map({ CGFloat($0) }) else { return }
            let cocoaY = globalTop() - (y + PET_H)
            dlog("move", x, y)
            petPanel.setFrameOrigin(NSPoint(x: x, y: cocoaY))
            sendScreen(force: false, screen: nil)

        case "setIgnoreMouse":
            petPanel.ignoresMouseEvents = (body["value"] as? Bool) ?? true

        case "saveState":
            if let s = body["state"] as? [String: Any] {
                state = s
                writeState()
                applyWindowLevel()
                post(to: petView, ["type": "state", "state": state])
            }

        case "log": dlog("js:", body["msg"] as? String ?? "")
        case "openStudio": openStudio()
        case "hidePet": petHidden = true; petPanel.orderOut(nil)
        case "showPet": petHidden = false; petPanel.orderFrontRegardless()
        case "command": command(body)
        case "beginTalk": beginTalk()
        case "endTalk": endTalk()
        case "requestAccessibility":
            let ok = axTrusted(prompting: true)
            post(to: viewFor(body), ["type": "accessibility", "trusted": ok])
        case "accessibilityStatus":
            post(to: viewFor(body), ["type": "accessibility", "trusted": AXIsProcessTrusted()])
        case "askModel": askModel(body)
        case "listModels": listModels(body)
        case "export": exportState()
        case "import": importState()
        default: break
        }
    }

    func command(_ payload: [String: Any]) {
        var msg = payload
        msg["type"] = "command"
        post(to: petView, msg)
    }

    func post(to view: WKWebView?, _ dict: [String: Any]) {
        guard let view = view,
              let data = try? JSONSerialization.data(withJSONObject: dict),
              let json = String(data: data, encoding: .utf8) else { return }
        view.evaluateJavaScript("window.__onNative && window.__onNative(\(json))", completionHandler: nil)
    }

    // MARK: - screen + mouse

    func sendScreen(force: Bool, screen: NSScreen?) {
        let point = NSPoint(x: petPanel.frame.midX, y: petPanel.frame.midY)
        let s = screen ?? screenContaining(point)
        let vf = s.visibleFrame
        if !force && vf == lastScreenFrame { return }
        lastScreenFrame = vf
        dlog("screen", vf.debugDescription)
        let rect: [String: CGFloat] = [
            "x": vf.minX,
            "y": globalTop() - vf.maxY,
            "w": vf.width,
            "h": vf.height
        ]
        post(to: petView, ["type": "screen", "rect": rect])
    }

    func startMouseTimer() {
        mouseTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 30.0, repeats: true) { [weak self] _ in
            guard let self = self, !self.petHidden else { return }
            let p = NSEvent.mouseLocation
            self.post(to: self.petView, ["type": "mouse", "x": p.x, "y": globalTop() - p.y])
        }
        RunLoop.main.add(mouseTimer!, forMode: .common)
    }

    // MARK: - a local model, if the user switched one on

    func viewFor(_ body: [String: Any]) -> WKWebView? {
        return (body["view"] as? String) == "studio" ? studioView : petView
    }

    /// Ask an Ollama-compatible endpoint for a short reply. Native, so the page never
    /// has to reach the network itself.
    func askModel(_ body: [String: Any]) {
        let view = viewFor(body)
        let id = body["id"] as? String ?? ""
        let endpoint = (body["endpoint"] as? String ?? "http://localhost:11434")
            .trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard let model = body["model"] as? String, !model.isEmpty,
              let url = URL(string: endpoint + "/api/chat") else {
            post(to: view, ["type": "modelReply", "id": id, "ok": false, "error": "no model set"]); return
        }
        var messages: [[String: String]] = []
        if let system = body["system"] as? String, !system.isEmpty {
            messages.append(["role": "system", "content": system])
        }
        messages.append(["role": "user", "content": body["prompt"] as? String ?? ""])
        // A JSON Schema in `format` makes Ollama constrain decoding to it, which is
        // what lets a 1B model be trusted with the reply shape at all: `do` can only
        // ever be one of his animations, because nothing else can be generated.
        let format: Any = body["schema"] as? [String: Any] ?? "json"
        let payload: [String: Any] = [
            "model": model, "stream": false, "format": format, "messages": messages,
            "options": ["temperature": body["temperature"] as? Double ?? 0.7,
                        "num_predict": body["maxTokens"] as? Int ?? 120]
        ]
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        req.timeoutInterval = TimeInterval((body["timeoutMs"] as? Double ?? 30000) / 1000)

        URLSession.shared.dataTask(with: req) { [weak self] data, _, error in
            guard let self = self else { return }
            var reply: [String: Any] = ["type": "modelReply", "id": id]
            if let error = error {
                reply["ok"] = false; reply["error"] = error.localizedDescription
            } else if let data = data,
                      let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let message = obj["message"] as? [String: Any],
                      let content = message["content"] as? String {
                reply["ok"] = true; reply["text"] = self.stripThinking(content)
            } else {
                reply["ok"] = false
                reply["error"] = String(data: data ?? Data(), encoding: .utf8)?.prefix(200).description ?? "bad reply"
            }
            dlog("model reply:", reply["ok"] as? Bool ?? false, reply["text"] as? String ?? reply["error"] as? String ?? "")
            DispatchQueue.main.async { self.post(to: view, reply) }
        }.resume()
    }

    /// Reasoning models narrate before they answer; the buddy only wants the answer.
    func stripThinking(_ text: String) -> String {
        guard let start = text.range(of: "<think>"), let end = text.range(of: "</think>") else { return text }
        var out = text
        out.removeSubrange(start.lowerBound..<end.upperBound)
        return out.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    func listModels(_ body: [String: Any]) {
        let view = viewFor(body)
        let endpoint = (body["endpoint"] as? String ?? "http://localhost:11434")
            .trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard let url = URL(string: endpoint + "/api/tags") else { return }
        var req = URLRequest(url: url)
        req.timeoutInterval = 4
        URLSession.shared.dataTask(with: req) { [weak self] data, _, error in
            guard let self = self else { return }
            var list: [[String: Any]] = []
            if let data = data,
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let models = obj["models"] as? [[String: Any]] {
                list = models.map { ["name": $0["name"] as? String ?? "", "size": $0["size"] as? Double ?? 0] }
            }
            DispatchQueue.main.async {
                self.post(to: view, ["type": "models", "list": list,
                                     "error": error?.localizedDescription ?? ""])
            }
        }.resume()
    }

    // MARK: - accessibility, for window titles

    func axTrusted(prompting: Bool) -> Bool {
        let key = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
        return AXIsProcessTrustedWithOptions([key: prompting] as CFDictionary)
    }

    /// The title of the frontmost window of another app. Needs Accessibility; without
    /// it this returns nil rather than failing, and he simply knows less.
    func frontWindowTitle(pid: pid_t) -> String? {
        guard AXIsProcessTrusted() else { return nil }
        let app = AXUIElementCreateApplication(pid)
        var windowRef: CFTypeRef?
        guard AXUIElementCopyAttributeValue(app, kAXFocusedWindowAttribute as CFString, &windowRef) == .success,
              let window = windowRef else { return nil }
        var titleRef: CFTypeRef?
        guard AXUIElementCopyAttributeValue(window as! AXUIElement, kAXTitleAttribute as CFString, &titleRef) == .success
        else { return nil }
        return (titleRef as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    func wantsTitles() -> Bool {
        guard let a = state["awareness"] as? [String: Any] else { return false }
        return (a["seeTitle"] as? Bool) ?? false
    }

    // MARK: - talking to him

    /// Typing needs keyboard focus, and taking it silently would be rude — so it is
    /// taken only while the line is open, and handed straight back afterwards.
    func beginTalk() {
        let front = NSWorkspace.shared.frontmostApplication
        if front?.bundleIdentifier != Bundle.main.bundleIdentifier { appBeforeTalking = front }
        petPanel.ignoresMouseEvents = false
        NSApp.activate(ignoringOtherApps: true)
        petPanel.makeKeyAndOrderFront(nil)
    }
    func endTalk() {
        petPanel.resignKey()
        appBeforeTalking?.activate(options: [])
        appBeforeTalking = nil
    }

    /// What he is allowed to notice: which app is in front, and how long you have been away.
    func startContextTimer() {
        contextTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            guard let self = self, !self.petHidden else { return }
            let front = NSWorkspace.shared.frontmostApplication
            let name = front?.localizedName ?? ""
            let mine = front?.bundleIdentifier == Bundle.main.bundleIdentifier
            let idle = CGEventSource.secondsSinceLastEventType(.combinedSessionState,
                                                               eventType: CGEventType(rawValue: ~0)!)
            var title = ""
            if !mine, self.wantsTitles(), let pid = front?.processIdentifier,
               let t = self.frontWindowTitle(pid: pid) { title = String(t.prefix(140)) }
            let changed = !mine && (name != self.lastFrontApp || title != self.lastWindowTitle)
            if !mine { self.lastFrontApp = name; self.lastWindowTitle = title }
            if changed || Date().timeIntervalSince(self.lastContextSent) > 20 {
                self.lastContextSent = Date()
                self.post(to: self.petView, ["type": "context", "app": self.lastFrontApp,
                                             "title": self.lastWindowTitle, "changed": changed,
                                             "idle": idle, "hour": Calendar.current.component(.hour, from: Date())])
            }
        }
        RunLoop.main.add(contextTimer!, forMode: .common)
    }

    func alwaysOnTop() -> Bool {
        if let b = state["behavior"] as? [String: Any], let v = b["alwaysOnTop"] as? Bool { return v }
        return true
    }
    func applyWindowLevel() {
        petPanel.level = alwaysOnTop() ? .floating : .normal
    }

    // MARK: - persistence

    func loadState() {
        if let data = try? Data(contentsOf: stateURL),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            state = obj
        } else {
            state = [:]
        }
    }
    func writeState() {
        guard let data = try? JSONSerialization.data(withJSONObject: state, options: [.prettyPrinted]) else { return }
        try? data.write(to: stateURL, options: .atomic)
    }

    func exportState() {
        let panel = NSSavePanel()
        panel.nameFieldStringValue = "claude-buddy.json"
        panel.allowedContentTypes = [.json]
        NSApp.activate(ignoringOtherApps: true)
        panel.begin { [weak self] result in
            guard result == .OK, let url = panel.url, let self = self,
                  let data = try? JSONSerialization.data(withJSONObject: self.state, options: [.prettyPrinted]) else { return }
            try? data.write(to: url, options: .atomic)
        }
    }

    func importState() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.json]
        panel.allowsMultipleSelection = false
        NSApp.activate(ignoringOtherApps: true)
        panel.begin { [weak self] result in
            guard result == .OK, let url = panel.url, let self = self,
                  let data = try? Data(contentsOf: url),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
            self.state = obj
            self.writeState()
            self.applyWindowLevel()
            self.post(to: self.petView, ["type": "state", "state": self.state])
            self.post(to: self.studioView, ["type": "state", "state": self.state])
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
