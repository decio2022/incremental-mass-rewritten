// ============================================================================
// GENESIS — the post-endgame expansion
// ----------------------------------------------------------------------------
// Once the main game is finished (ax42 + eee100 g mass) mass gain itself is
// capped, so the only way forward is to work in *tetration space* (slog).
//
//   depth 0    -> eee100 g   (old endgame)
//   depth 0.5  -> eee2111326 g
//   depth 1    -> eeee100 g  (new endgame)
//
// Genesis Collapse converts depth into Genesis Motes, Motes buy tetration
// upgrades, and milestones / trials multiply the climb.
// ============================================================================

const GENESIS_BASE_SLOG = E("eee100").slog(10);
const GENESIS_GOAL_SLOG = E("eeee100").slog(10);
const GENESIS_DEPTH_CAP = 1;          // depth 1 == eeee100 g
const GENESIS_MIN_COLLAPSE = 0.005;   // depth needed for a Collapse
const GENESIS_BASE_RATE = E("1e-5");  // depth per second before upgrades
const GENESIS_MOTE_BASE_EXP = 12;     // motes = 10^(depth * exponent)

const GENESIS_UPG_COUNT = 12;
const GENESIS_MILESTONE_COUNT = 8;
const GENESIS_TRIAL_COUNT = 6;

// ---------------------------------------------------------------------------
// Upgrades (bought with Genesis Motes)
// ---------------------------------------------------------------------------

const GEN_UPGS = [
    null,
    {
        name: "Tetration Engine",
        desc: "Raises the raw speed at which mass climbs tetration layers.",
        max: 45,
        cost(n) { return E(1).mul(E(2).pow(n)) },
        eff(n) { return E(1.13).pow(n) },
        effDesc(x) { return format(x) + " Tetration Speed" },
    },
    {
        name: "Depth Stabilizer",
        desc: "Keeps the climb stable while the layers stretch.",
        max: 10,
        cost(n) { return E(30).mul(E(4).pow(n)) },
        eff(n) { return E(1).add(E(n).mul(0.1)) },
        effDesc(x) { return format(x) + " Tetration Speed" },
    },
    {
        name: "Mote Flux",
        desc: "Each level adds +0.5 to the Mote gain exponent of a Collapse.",
        max: 12,
        cost(n) { return E(250).mul(E(8).pow(n)) },
        eff(n) { return GENESIS_MOTE_BASE_EXP + n * 0.5 },
        effDesc(x) { return "Mote exponent: " + format(x) },
    },
    {
        name: "Depth Infusion",
        desc: "Keeps an extra 5% of your current depth per level (base 25%).",
        max: 10,
        cost(n) { return E(60).mul(E(3).pow(n)) },
        eff(n) { return n * 0.05 },
        effDesc(x) { return "Keep " + format(25 + x * 100) + "% of depth (total)" },
    },
    {
        name: "Mote Resonance",
        desc: "Multiplies all Genesis Mote gain.",
        max: 8,
        cost(n) { return E(800).mul(E(4).pow(n)) },
        eff(n) { return E(1.15).pow(n) },
        effDesc(x) { return format(x) + " Motes" },
    },
    {
        name: "Cascade Amplifier",
        desc: "Feeds the tetration engine back into itself.",
        unl() { return GENESIS.milestoneReached(1) },
        max: 12,
        cost(n) { return E(100).mul(E(3.5).pow(n)) },
        eff(n) { return E(1.15).pow(n) },
        effDesc(x) { return format(x) + " Tetration Speed" },
    },
    {
        name: "Genesis Memory",
        desc: "Every Collapse makes the climb permanently a little faster.",
        max: 6,
        cost(n) { return E(5e3).mul(E(6).pow(n)) },
        eff(n) { return E(1).add(E(n).mul(0.05)) },
        effDesc(x) { return format(x) + "^Collapses Tetration Speed" },
    },
    {
        name: "Event Horizon",
        desc: "Bends the layers themselves toward you.",
        unl() { return GENESIS.milestoneReached(3) },
        max: 8,
        cost(n) { return E(5e3).mul(E(5).pow(n)) },
        eff(n) { return E(1.4).pow(n) },
        effDesc(x) { return format(x) + " Tetration Speed" },
    },
    {
        name: "Singularity Drive",
        desc: "The engine now runs inside a singularity.",
        unl() { return GENESIS.milestoneReached(5) },
        max: 5,
        cost(n) { return E(5e6).mul(E(10).pow(n)) },
        eff(n) { return E(1.8).pow(n) },
        effDesc(x) { return format(x) + " Tetration Speed" },
    },
    {
        name: "Genesis Autobuyer",
        desc: "Automatically buys every Genesis upgrade it can afford.",
        unl() { return GENESIS.milestoneReached(2) },
        max: 1,
        cost() { return E(1e4) },
        eff() { return E(1) },
        effDesc() { return "Auto-Buy enabled" },
    },
    {
        name: "Collapse Automator",
        desc: "Automatically performs Genesis Collapses at your chosen depth.",
        unl() { return GENESIS.milestoneReached(4) },
        max: 1,
        cost() { return E(1e5) },
        eff() { return E(1) },
        effDesc() { return "Auto-Collapse enabled" },
    },
    {
        name: "Genesis Mastery",
        desc: "Reward for finishing Genesis: the engine never stops.",
        unl() { return player.gen.complete === true },
        max: 1,
        cost() { return E(1e10) },
        eff() { return E(10) },
        effDesc() { return "×10 Tetration Speed" },
    },
];

// ---------------------------------------------------------------------------
// Milestones (permanent, based on best depth ever reached)
// ---------------------------------------------------------------------------

const GEN_MILESTONES = [
    { depth: 0.01, motes: 0, name: "First Collapse", reward: "Unlocks Genesis Trials, ×1.10 Tetration Speed", mult: E(1.1) },
    { depth: 0.05, motes: 0, name: "Deeper Layers", reward: "Unlocks Cascade Amplifier, ×1.15 Tetration Speed", mult: E(1.15) },
    { depth: 0.10, motes: "10", name: "Automation I", reward: "Unlocks Genesis Autobuyer, ×1.15 Tetration Speed", mult: E(1.15) },
    { depth: 0.20, motes: "200", name: "Event Horizon", reward: "Unlocks Event Horizon, ×1.15 Tetration Speed", mult: E(1.15) },
    { depth: 0.35, motes: "1e4", name: "Automation II", reward: "Unlocks Collapse Automator, ×1.15 Tetration Speed", mult: E(1.15) },
    { depth: 0.50, motes: "1e6", name: "Singularity", reward: "Unlocks Singularity Drive, ×1.15 Tetration Speed", mult: E(1.15) },
    { depth: 0.75, motes: "1e9", name: "Tetration Apex", reward: "×2 Tetration Speed", mult: E(2) },
    { depth: 1.00, motes: 0, name: "Genesis Complete", reward: "eeee100 g reached, ×3 Tetration Speed, unlocks Genesis Mastery", mult: E(3) },
];

function genMilestoneMoteReq(i) {
    let m = GEN_MILESTONES[i].motes;
    return E(m === undefined ? 0 : m);
}

function genMilestoneMoteMet(i) {
    return player.gen.totalMotes.gte(genMilestoneMoteReq(i));
}

function genMilestoneReqText(i) {
    let m = GEN_MILESTONES[i];
    let req = genMilestoneMoteReq(i);
    return "Depth " + format(m.depth) + (req.gt(0) ? " & " + format(req) + " Motes earned" : "");
}

// ---------------------------------------------------------------------------
// Trials (restricted runs for permanent rewards)
// ---------------------------------------------------------------------------

const GEN_TRIALS = [
    {
        name: "Trial of Silence", req: 0.10, pen: { rate: 0.5 }, rew: { motes: 1.5 },
        desc: "Tetration Speed is halved.", reward: "×1.5 Mote gain",
    },
    {
        name: "Trial of Embers", req: 0.15, pen: { motes: 0.25 }, rew: { rate: 1.5 },
        desc: "Mote gain is quartered.", reward: "×1.5 Tetration Speed",
    },
    {
        name: "Trial of Thinning", req: 0.20, pen: { rate: 0.25 }, rew: { motes: 2 },
        desc: "Tetration Speed is quartered.", reward: "×2 Mote gain",
    },
    {
        name: "Trial of Locking", req: 0.10, pen: { locked: true }, rew: { rate: 2 },
        desc: "Upgrades cannot be bought during the trial.", reward: "×2 Tetration Speed",
    },
    {
        name: "Trial of the Deep", req: 0.50, pen: { rate: 0.1 }, rew: { rate: 1.5, motes: 1.5 },
        desc: "Tetration Speed is divided by 10.", reward: "×1.5 Motes & ×1.5 Tetration Speed",
    },
    {
        name: "Final Trial", req: 0.90, pen: { rate: 0.05, motes: 0.5 }, rew: { rate: 2, motes: 3 },
        desc: "Tetration Speed is divided by 20 and Mote gain halved.", reward: "×3 Motes & ×2 Tetration Speed",
    },
];

const GEN_AUTO_DEPTHS = [-1, 0.02, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1];
const GEN_SMART_AUTO = -1;   // "Auto (95% best)": keeps raising the collapse threshold

// ---------------------------------------------------------------------------
// Core object
// ---------------------------------------------------------------------------

const GENESIS = {
    // ---- state helpers -----------------------------------------------------
    upgLvl(i) { return player.gen.upgs[i] || 0 },
    upgMaxed(i) { return this.upgLvl(i) >= GEN_UPGS[i].max },
    upgUnl(i) { let u = GEN_UPGS[i].unl; return u ? !!u() : true },
    upgCost(i) { return GEN_UPGS[i].cost(this.upgLvl(i)) },
    trialDone(i) { return !!player.gen.trials[i] },
    milestoneReached(i) { return !!player.gen.milestones[i] },
    trialLocked() { return player.gen.activeTrial >= 0 && !!GEN_TRIALS[player.gen.activeTrial].pen.locked },

    depth() { return player.gen.depth },
    depthNum() { return player.gen.depth.toNumber() },

    // ---- maths -------------------------------------------------------------
    // mass that belongs to a given tetration depth
    massForDepth(d) {
        let x = Decimal.tetrate(10, GENESIS_BASE_SLOG.add(E(d)));
        return x.min("eeee100");
    },

    retention() {
        return Math.min(0.75, 0.25 + this.upgLvl(4) * 0.05);
    },

    moteExponent() {
        return GENESIS_MOTE_BASE_EXP + this.upgLvl(3) * 0.5;
    },

    milestoneMult() {
        let x = E(1);
        for (let i = 0; i < GEN_MILESTONES.length; i++) if (this.milestoneReached(i)) x = x.mul(GEN_MILESTONES[i].mult);
        return x;
    },

    trialRateMult() {
        let x = E(1);
        for (let i = 0; i < GEN_TRIALS.length; i++) if (this.trialDone(i) && GEN_TRIALS[i].rew.rate) x = x.mul(GEN_TRIALS[i].rew.rate);
        return x;
    },

    trialMoteMult() {
        let x = E(1);
        for (let i = 0; i < GEN_TRIALS.length; i++) if (this.trialDone(i) && GEN_TRIALS[i].rew.motes) x = x.mul(GEN_TRIALS[i].rew.motes);
        return x;
    },

    activePenalty(kind) {
        if (player.gen.activeTrial < 0) return 1;
        let pen = GEN_TRIALS[player.gen.activeTrial].pen;
        return pen[kind] === undefined ? 1 : pen[kind];
    },

    rate() {
        if (!player.gen.unl) return E(0);
        let x = GENESIS_BASE_RATE.clone();
        x = x.mul(E(1.13).pow(this.upgLvl(1)));                                   // Tetration Engine
        x = x.mul(E(1).add(E(this.upgLvl(2)).mul(0.1)));                          // Depth Stabilizer
        x = x.mul(E(1.15).pow(this.upgLvl(6)));                                   // Cascade
        x = x.mul(E(1.4).pow(this.upgLvl(8)));                                    // Event Horizon
        x = x.mul(E(1.8).pow(this.upgLvl(9)));                                    // Singularity
        x = x.mul(E(1).add(E(this.upgLvl(7)).mul(0.05)).pow(Math.min(500, player.gen.collapses || 0))); // Memory
        x = x.mul(E(10).pow(this.upgLvl(12)));                                    // Mastery
        x = x.mul(this.milestoneMult());
        x = x.mul(this.trialRateMult());
        x = x.mul(this.activePenalty("rate"));
        return x;
    },

    moteGain(d) {
        let depth = E(d === undefined ? player.gen.depth : d);
        if (depth.lte(0)) return E(0);
        let x = E(10).pow(depth.mul(this.moteExponent()));
        x = x.mul(E(1.15).pow(this.upgLvl(5)));   // Mote Resonance
        x = x.mul(this.trialMoteMult());
        x = x.mul(this.activePenalty("motes"));
        return x.floor().max(1);
    },

    autoThreshold() {
        let v = Number(player.gen.autoDepth);
        if (!Number.isFinite(v) || v < 0) return Math.min(GENESIS_DEPTH_CAP, Math.max(GENESIS_MIN_COLLAPSE, player.gen.bestDepth.toNumber() * 0.95));
        return Math.min(GENESIS_DEPTH_CAP, Math.max(GENESIS_MIN_COLLAPSE, v));
    },

    progress() {
        return Math.max(0, Math.min(1, this.depthNum() / GENESIS_DEPTH_CAP));
    },

    goalReached() {
        return player.mass.gte("eeee100") || !!player.gen.complete;
    },

    // ---- restricted modes: keep the tetration floor out of resets ----------
    inRestrictedMode() {
        return player.chal.active > 0 || player.gc.active || player.exotic.dark_run.active ||
            player.qu.rip.active || player.md.active || player.md.break.active;
    },

    // ---- unlock & progression ---------------------------------------------
    unlocked() {
        return !!player.gen.unl;
    },

    checkUnlock() {
        if (player.gen.unl) return;
        if (player.mass.gte("eee100") && hasTree("ax42")) {
            player.gen.unl = true;
            this.markDirty();
            addNotify("Genesis unlocked — the mass cap is broken!", 5);
        }
    },

    checkMilestones() {
        for (let i = 0; i < GEN_MILESTONES.length; i++) {
            if (this.milestoneReached(i)) continue;
            if (player.gen.bestDepth.gte(GEN_MILESTONES[i].depth) && genMilestoneMoteMet(i)) {
                player.gen.milestones[i] = true;
                this.markDirty();
                addNotify("Genesis Milestone: " + GEN_MILESTONES[i].name, 5);
            }
        }
        if (!player.gen.complete && (player.mass.gte("eeee100") || player.gen.bestDepth.gte(GENESIS_DEPTH_CAP))) {
            player.gen.complete = true;
            addNotify("GENESIS COMPLETE — you have reached eeee100 g!", 8);
        }
    },

    checkTrial() {
        let t = player.gen.activeTrial;
        if (t < 0) return;
        if (player.gen.depth.gte(GEN_TRIALS[t].req)) {
            player.gen.trials[t] = true;
            player.gen.activeTrial = -1;
            addNotify("Trial complete: " + GEN_TRIALS[t].name + " (" + GEN_TRIALS[t].reward + ")", 6);
            save();
        }
    },

    applyMassFloor() {
        if (this.inRestrictedMode()) return;
        let floor = this.massForDepth(player.gen.depth);
        if (!floor || Number.isNaN(floor.mag)) return;
        if (!player.mass || Number.isNaN(player.mass.mag)) player.mass = floor;
        else if (player.mass.lt(floor)) player.mass = floor;
    },

    // ---- main tick ---------------------------------------------------------
    calc(dt, dt_offline) {
        if (!player.gen) return;
        this.checkUnlock();
        if (!player.gen.unl) return;
        this.inCalc = true;

        let rate = (tmp.gen && tmp.gen.rate) ? tmp.gen.rate : this.rate();
        if (dt > 0 && rate.gt(0)) {
            player.gen.depth = player.gen.depth.add(rate.mul(dt)).min(GENESIS_DEPTH_CAP);
        }
        if (player.gen.depth.gt(0) && player.gen.depth.gt(player.gen.bestDepth)) player.gen.bestDepth = player.gen.depth.clone();

        this.applyMassFloor();
        this.checkMilestones();
        this.checkTrial();

        if (player.gen.autoBuy) this.autoBuy();
        if (player.gen.autoCollapse && player.gen.activeTrial < 0 &&
            player.gen.depth.lt(GENESIS_DEPTH_CAP) &&
            player.gen.depth.gte(this.autoThreshold()) && player.gen.depth.gte(GENESIS_MIN_COLLAPSE)) {
            this.collapse(true);
        }
        this.inCalc = false;
    },

    updateTemp() {
        if (!tmp.gen) tmp.gen = {};
        tmp.gen.rate = this.rate();
        tmp.gen.moteGain = this.moteGain(player.gen.depth);
        tmp.gen.milestoneMult = this.milestoneMult();
        tmp.gen.massFloor = this.massForDepth(player.gen.depth);
        tmp.gen.retention = this.retention();
        tmp.gen.canCollapse = player.gen.unl && player.gen.activeTrial < 0 && player.gen.depth.gte(GENESIS_MIN_COLLAPSE);
    },

    // ---- actions -----------------------------------------------------------
    buy(i, max = false) {
        let def = GEN_UPGS[i];
        if (!def || !player.gen.unl) return;
        if (!this.upgUnl(i) || this.upgMaxed(i) || this.trialLocked()) return;
        let bought = 0;
        while (!this.upgMaxed(i) && player.gen.motes.gte(this.upgCost(i))) {
            player.gen.motes = player.gen.motes.sub(this.upgCost(i));
            player.gen.upgs[i] = this.upgLvl(i) + 1;
            bought++;
            this.onUpgradeBought(i);
            if (!max) break;
        }
        if (bought > 0) this.afterBuy();
    },

    onUpgradeBought(i) {
        // one-time unlocks flip their automation toggles on
        if (i === 10) player.gen.autoBuy = true;
        if (i === 11) player.gen.autoCollapse = true;
    },

    afterBuy() {
        this.cleanMotes();
        save();
        this.refreshTemp();
        this.markDirty();
    },

    cleanMotes() {
        let m = player.gen.motes;
        if (!m || Number.isNaN(m.mag)) player.gen.motes = E(0);
        else if (m.lt("1e-9")) player.gen.motes = E(0);
        else if (m.gt("1e308")) player.gen.motes = m;
    },

    refreshTemp() { this.updateTemp(); },

    autoBuy() {
        if (this.trialLocked()) return;
        let any = false;
        for (let pass = 0; pass < 12; pass++) {
            let bought = false;
            for (let i = 1; i < GEN_UPGS.length; i++) {
                if (!this.upgUnl(i) || this.upgMaxed(i)) continue;
                if (player.gen.motes.gte(this.upgCost(i))) {
                    player.gen.motes = player.gen.motes.sub(this.upgCost(i));
                    player.gen.upgs[i] = this.upgLvl(i) + 1;
                    this.onUpgradeBought(i);
                    bought = true;
                    any = true;
                }
            }
            if (!bought) break;
        }
        if (any) {
            this.cleanMotes();
            if (!this.dirty) this.dirty = {};
            this.dirty.upgs = true;
            this.dirty.main = true;
        }
    },

    collapse(silent = false) {
        if (!player.gen.unl) return false;
        if (silent) {
            // auto-collapses can fire every tick when the climb is very fast
            let now = Date.now();
            if (now - (this.lastAutoCollapse || 0) < 1000) return false;
            this.lastAutoCollapse = now;
        }
        if (player.gen.activeTrial >= 0) {
            if (!silent) addNotify("You cannot Collapse during a Trial", 4);
            return false;
        }
        if (player.gen.depth.lt(GENESIS_MIN_COLLAPSE)) {
            if (!silent) addNotify("Reach depth " + format(GENESIS_MIN_COLLAPSE) + " before collapsing", 4);
            return false;
        }
        let gain = this.moteGain(player.gen.depth);
        player.gen.motes = player.gen.motes.add(gain);
        player.gen.totalMotes = player.gen.totalMotes.add(gain);
        player.gen.collapses = (player.gen.collapses || 0) + 1;
        player.gen.lastGain = gain;
        player.gen.bestDepth = player.gen.bestDepth.max(player.gen.depth);

        let keep = player.gen.depth.mul(this.retention());
        player.gen.depth = keep;
        if (!this.inRestrictedMode()) player.mass = this.massForDepth(keep);

        this.checkMilestones();
        if (!this.inCalc) this.refreshTemp();
        if (silent) {
            this.dirty = this.dirty || {};
            this.dirty.main = true;
            this.dirty.upgs = true;
            this.dirty.miles = true;
        } else {
            this.markDirty();
            save();
        }
        if (!silent) addNotify("Genesis Collapse: +" + format(gain) + " Motes", 4);
        return true;
    },

    startTrial(i) {
        if (i < 0 || i >= GEN_TRIALS.length) return;
        if (!player.gen.unl || this.trialDone(i)) return;
        if (!this.milestoneReached(0)) { addNotify("Complete the First Collapse milestone to unlock Trials", 4); return; }
        if (player.gen.activeTrial === i) return;
        if (confirm("Start " + GEN_TRIALS[i].name + "?\n\n" + GEN_TRIALS[i].desc + "\nReach depth " + format(GEN_TRIALS[i].req) + " without collapsing.\n\nStarting resets your current depth to 0.")) {
            player.gen.activeTrial = i;
            player.gen.depth = E(0);
            player.gen.bestDepth = player.gen.bestDepth.max(E(0));
            if (!this.inRestrictedMode()) player.mass = this.massForDepth(0);
            this.refreshTemp();
            this.markDirty();
            save();
        }
    },

    abandonTrial() {
        if (player.gen.activeTrial < 0) return;
        player.gen.activeTrial = -1;
        this.refreshTemp();
        this.markDirty();
        save();
    },

    toggleAutoBuy() {
        player.gen.autoBuy = !player.gen.autoBuy;
        this.markDirty();
        save();
    },

    toggleAutoCollapse() {
        player.gen.autoCollapse = !player.gen.autoCollapse;
        this.markDirty();
        save();
    },

    setAutoDepth(v) {
        v = Number(v);
        player.gen.autoDepth = v < 0 ? GEN_SMART_AUTO : Math.max(GENESIS_MIN_COLLAPSE, Math.min(GENESIS_DEPTH_CAP, v));
        this.markDirty();
        save();
    },

    // ---- save sanitising ---------------------------------------------------
    sanitize() {
        let g = player.gen;
        if (!g) return;
        g.unl = !!g.unl;
        g.complete = !!g.complete;
        if (!Array.isArray(g.upgs)) g.upgs = [];
        for (let i = 1; i < GENESIS_UPG_COUNT + 1; i++) {
            let lvl = Number(g.upgs[i]);
            if (!Number.isFinite(lvl) || lvl < 0) lvl = 0;
            g.upgs[i] = Math.min(Math.floor(lvl), GEN_UPGS[i] ? GEN_UPGS[i].max : 1);
        }
        if (!Array.isArray(g.milestones)) g.milestones = [];
        for (let i = 0; i < GENESIS_MILESTONE_COUNT; i++) g.milestones[i] = !!g.milestones[i];
        if (!Array.isArray(g.trials)) g.trials = [];
        for (let i = 0; i < GENESIS_TRIAL_COUNT; i++) g.trials[i] = !!g.trials[i];
        g.activeTrial = Number.isInteger(g.activeTrial) && g.activeTrial >= 0 && g.activeTrial < GENESIS_TRIAL_COUNT ? g.activeTrial : -1;
        g.collapses = Number.isFinite(Number(g.collapses)) ? Math.max(0, Math.floor(Number(g.collapses))) : 0;
        if (!Number.isFinite(Number(g.autoDepth))) g.autoDepth = GEN_SMART_AUTO;
        if (Number(g.autoDepth) > 0) g.autoDepth = Math.max(GENESIS_MIN_COLLAPSE, Math.min(GENESIS_DEPTH_CAP, Number(g.autoDepth)));
        g.autoBuy = !!g.autoBuy;
        g.autoCollapse = !!g.autoCollapse;
        ["depth", "bestDepth", "motes", "totalMotes", "lastGain"].forEach(k => {
            if (!(g[k] instanceof Decimal)) g[k] = E(g[k] === undefined || g[k] === null ? 0 : g[k]);
            if (Number.isNaN(g[k].mag) || Number.isNaN(g[k].layer) || g[k].lt(0)) g[k] = E(0);
        });
        if (g.depth.gt(GENESIS_DEPTH_CAP)) g.depth = E(GENESIS_DEPTH_CAP);
        if (g.bestDepth.gt(GENESIS_DEPTH_CAP)) g.bestDepth = E(GENESIS_DEPTH_CAP);
        if (g.bestDepth.lt(g.depth)) g.bestDepth = g.depth.clone();
        if (g.complete) g.bestDepth = E(GENESIS_DEPTH_CAP);
    },

    // ---- UI ---------------------------------------------------------------
    setupHTML() {
        let root = document.getElementById("tab_frame11");
        if (!root) return;
        root.innerHTML = `<div class="gen_container">
            <div id="stab_frame11_0" class="gen_sub"></div>
            <div id="stab_frame11_1" class="gen_sub"></div>
            <div id="stab_frame11_2" class="gen_sub"></div>
            <div id="stab_frame11_3" class="gen_sub"></div>
        </div>`;
        this.dirty = { main: true, upgs: true, miles: true, trials: true };
        let main = document.getElementById("stab_frame11_0");
        let upgs = document.getElementById("stab_frame11_1");
        let miles = document.getElementById("stab_frame11_2");
        let trials = document.getElementById("stab_frame11_3");
        if (main) main.innerHTML = this.buildMain();
        if (upgs) upgs.innerHTML = this.buildUpgrades();
        if (miles) miles.innerHTML = this.buildMilestones();
        if (trials) trials.innerHTML = this.buildTrials();
    },

    markDirty() {
        this.dirty = { main: true, upgs: true, miles: true, trials: true };
    },

    buildMain() {
        let g = player.gen;
        let kpi = (label, id) => `<div class="gen_kpi"><div class="gen_kpi_label">${label}</div><div class="gen_kpi_val" id="${id}">--</div></div>`;
        let autoBtns = GEN_AUTO_DEPTHS.map(v => `<button class="btn stats_btn_sm gen_depth_btn" data-d="${v}" onclick="genSetAutoDepth(${v})">${v < 0 ? "Auto (95% best)" : format(v)}</button>`).join("");
        return `
        <div class="gen_hero">
            <div class="gen_hero_title">GENESIS</div>
            <div class="gen_hero_sub">The mass cap is broken. Climb the tetration layers from <b>eee100 g</b> to <b>eeee100 g</b>.</div>
            <div id="gen_complete_banner" class="gen_banner" style="display:none;">GENESIS COMPLETE — eeee100 g reached</div>
        </div>
        <div class="gen_kpis">
            ${kpi("Tetration Depth", "gen_depth")}
            ${kpi("Best Depth", "gen_best")}
            ${kpi("Tetration Speed", "gen_rate")}
            ${kpi("Current Mass", "gen_mass")}
            ${kpi("Genesis Motes", "gen_motes")}
            ${kpi("Motes on Collapse", "gen_gain")}
            ${kpi("Collapses", "gen_collapses")}
            ${kpi("Total Motes Earned", "gen_totalmotes")}
        </div>
        <div class="gen_progress_wrap">
            <div class="gen_progress_label"><span id="gen_progress_label">Depth 0 / 1</span><span id="gen_goal_label">Goal: eeee100 g</span></div>
            <div class="gen_bar"><div class="gen_bar_fill" id="gen_bar_fill" style="width:0%"></div></div>
        </div>
        <div class="gen_actions">
            <button class="btn gen_big_btn" id="gen_collapse_btn" onclick="genCollapse()">Genesis Collapse</button>
            <div class="gen_collapse_note" id="gen_collapse_note">Reach depth ${format(GENESIS_MIN_COLLAPSE)} to collapse.</div>
        </div>
        <div class="gen_grid">
            <div class="gen_card">
                <div class="gen_card_title">Automation</div>
                <div class="gen_row"><span>Auto-Buy Upgrades</span><button class="btn stats_btn_sm" id="gen_autobuy_btn" onclick="genToggleAutoBuy()">OFF</button></div>
                <div class="gen_row"><span>Auto-Collapse</span><button class="btn stats_btn_sm" id="gen_autocollapse_btn" onclick="genToggleAutoCollapse()">OFF</button></div>
                <div class="gen_row gen_row_wrap"><span>Collapse at depth</span><span id="gen_autodepth_btns">${autoBtns}</span></div>
                <div class="gen_note">Current threshold: <b id="gen_auto_now">--</b>. Auto-Collapse is disabled during Trials and pauses at the top layer.</div>
            </div>
            <div class="gen_card">
                <div class="gen_card_title">How the layers work</div>
                <div class="gen_note gen_note_left">
                    Mass is measured in <b>tetration depth</b>: depth 0 is eee100 g, depth 1 is eeee100 g.
                    Collapsing converts depth into <b>Genesis Motes</b> (10<sup>depth × exponent</sup>) and drops you back down the layers.
                    Motes buy permanent upgrades that make the next climb faster, and milestones and trials multiply it further.
                </div>
                <div class="gen_row"><span>Depth Retention</span><span id="gen_retention">--</span></div>
                <div class="gen_row"><span>Mote Exponent</span><span id="gen_mote_exp">--</span></div>
                <div class="gen_row"><span>Milestone Multiplier</span><span id="gen_mile_mult">--</span></div>
                <div class="gen_row"><span>Active Trial</span><span id="gen_trial_now">None</span></div>
            </div>
        </div>`;
    },

    buildUpgrades() {
        let cards = "";
        for (let i = 1; i < GEN_UPGS.length; i++) {
            let def = GEN_UPGS[i];
            let unl = this.upgUnl(i);
            let lvl = this.upgLvl(i);
            let maxed = lvl >= def.max;
            cards += `<div class="gen_card gen_upg${unl ? "" : " gen_locked"}">
                <div class="gen_card_title"><span>${def.name}</span><span class="gen_tag">${maxed ? "MAX" : "Lv " + lvl + " / " + def.max}</span></div>
                <div class="gen_note gen_note_left">${unl ? def.desc : "Locked — " + this.upgUnlHint(i)}</div>
                <div class="gen_row"><span>Effect</span><span id="gen_eff_${i}">--</span></div>
                <div class="gen_row"><span>Cost</span><span id="gen_cost_${i}">--</span></div>
                <div class="gen_btn_row">
                    <button class="btn stats_btn_sm" id="gen_buy1_${i}" onclick="genBuy(${i}, false)">Buy</button>
                    ${def.max > 1 ? `<button class="btn stats_btn_sm" id="gen_buymax_${i}" onclick="genBuy(${i}, true)">Buy Max</button>` : ""}
                </div>
            </div>`;
        }
        return `<div class="gen_section">
            <div class="gen_section_head"><span>Genesis Upgrades</span><span class="gen_tag" id="gen_motes_hdr">--</span></div>
            <div class="gen_grid">${cards}</div>
        </div>`;
    },

    upgUnlHint(i) {
        for (let m = 0; m < GEN_MILESTONES.length; m++) {
            if (GEN_MILESTONES[m].reward && GEN_MILESTONES[m].reward.includes(GEN_UPGS[i].name)) {
                return "reach depth " + format(GEN_MILESTONES[m].depth) + " (" + GEN_MILESTONES[m].name + ")";
            }
        }
        if (i === 12) return "complete Genesis (depth 1)";
        return "reach a deeper tetration layer";
    },

    buildMilestones() {
        let rows = "";
        for (let i = 0; i < GEN_MILESTONES.length; i++) {
            let m = GEN_MILESTONES[i];
            let done = this.milestoneReached(i);
            rows += `<div class="gen_mile${done ? " gen_mile_done" : ""}">
                <div class="gen_mile_head"><span>${m.name}</span>${done ? '<span class="stats_badge unlocked">DONE</span>' : `<span class="stats_badge locked">${genMilestoneReqText(i)}</span>`}</div>
                <div class="gen_note gen_note_left">${m.reward}</div>
                ${done ? "" : `<div class="gen_note gen_note_left">Progress: best depth <b>${format(player.gen.bestDepth, 4)}</b> / ${format(m.depth)}${genMilestoneMoteReq(i).gt(0) ? ` · Motes earned <b>${format(player.gen.totalMotes)}</b> / ${format(genMilestoneMoteReq(i))}` : ""}</div>`}
            </div>`;
        }
        return `<div class="gen_section">
            <div class="gen_section_head"><span>Milestones</span><span class="gen_tag">Permanent · based on best depth</span></div>
            <div class="gen_grid">${rows}</div>
        </div>`;
    },

    buildTrials() {
        if (!this.milestoneReached(0)) {
            return `<div class="gen_section"><div class="gen_empty">Trials unlock at the <b>First Collapse</b> milestone (depth ${format(GEN_MILESTONES[0].depth)}).</div></div>`;
        }
        let cards = "";
        for (let i = 0; i < GEN_TRIALS.length; i++) {
            let t = GEN_TRIALS[i];
            let done = this.trialDone(i);
            let active = player.gen.activeTrial === i;
            cards += `<div class="gen_card${done ? " gen_trial_done" : active ? " gen_trial_active" : ""}">
                <div class="gen_card_title"><span>${t.name}</span>${done ? '<span class="stats_badge unlocked">COMPLETE</span>' : active ? '<span class="stats_badge active">ACTIVE</span>' : `<span class="stats_badge locked">Depth ${format(t.req)}</span>`}</div>
                <div class="gen_note gen_note_left">${t.desc}</div>
                <div class="gen_row"><span>Reward</span><span>${t.reward}</span></div>
                <div class="gen_btn_row">
                    ${done ? `<button class="btn stats_btn_sm" disabled>Reward claimed</button>`
                        : active ? `<button class="btn stats_btn_sm" onclick="genAbandonTrial()">Abandon Trial</button>`
                            : `<button class="btn stats_btn_sm" onclick="genStartTrial(${i})">Start Trial</button>`}
                </div>
            </div>`;
        }
        return `<div class="gen_section">
            <div class="gen_section_head"><span>Genesis Trials</span><span class="gen_tag">Collapsing is disabled during a Trial</span></div>
            <div class="gen_grid">${cards}</div>
        </div>`;
    },

    // ---- per-frame live update --------------------------------------------
    updateHTML() {
        if (!player.gen || !player.gen.unl) return;
        let sub = tmp.stab[11] || 0;
        let doc = document;
        let txt = (id, val) => { let el = doc.getElementById(id); if (el) el.textContent = val; };
        let html = (id, val) => { let el = doc.getElementById(id); if (el && el.innerHTML !== val) el.innerHTML = val; };

        if (this.dirty) {
            let d = this.dirty;
            if (d.main) { let el = doc.getElementById("stab_frame11_0"); if (el) el.innerHTML = this.buildMain(); }
            if (d.upgs) { let el = doc.getElementById("stab_frame11_1"); if (el) el.innerHTML = this.buildUpgrades(); }
            if (d.miles) { let el = doc.getElementById("stab_frame11_2"); if (el) el.innerHTML = this.buildMilestones(); }
            if (d.trials) { let el = doc.getElementById("stab_frame11_3"); if (el) el.innerHTML = this.buildTrials(); }
            this.dirty = null;
        }

        let depth = player.gen.depth;
        let rate = (tmp.gen && tmp.gen.rate) ? tmp.gen.rate : this.rate();
        let gain = (tmp.gen && tmp.gen.moteGain) ? tmp.gen.moteGain : this.moteGain(depth);

        // main tab live values
        txt("gen_depth", format(depth, 5));
        txt("gen_best", format(player.gen.bestDepth, 5));
        txt("gen_rate", format(rate, 5) + " /s");
        txt("gen_mass", format(player.mass) + " g");
        txt("gen_motes", format(player.gen.motes));
        txt("gen_gain", format(gain));
        txt("gen_collapses", format(player.gen.collapses, 0));
        txt("gen_totalmotes", format(player.gen.totalMotes));
        txt("gen_progress_label", "Depth " + format(depth, 4) + " / " + format(GENESIS_DEPTH_CAP));
        txt("gen_goal_label", this.goalReached() ? "eeee100 g reached" : "Goal: eeee100 g");
        txt("gen_retention", format(this.retention() * 100) + "%");
        txt("gen_mote_exp", format(this.moteExponent(), 0));
        txt("gen_mile_mult", format(this.milestoneMult()) + "x");
        txt("gen_trial_now", player.gen.activeTrial >= 0 ? GEN_TRIALS[player.gen.activeTrial].name : "None");

        let bar = doc.getElementById("gen_bar_fill");
        if (bar) bar.style.width = (this.progress() * 100).toFixed(3) + "%";

        let banner = doc.getElementById("gen_complete_banner");
        if (banner) banner.style.display = player.gen.complete ? "" : "none";

        let cbtn = doc.getElementById("gen_collapse_btn");
        if (cbtn) {
            let can = player.gen.activeTrial < 0 && depth.gte(GENESIS_MIN_COLLAPSE);
            cbtn.disabled = !can;
            cbtn.textContent = player.gen.activeTrial >= 0 ? "Collapse (Trial active)" : "Genesis Collapse";
            cbtn.className = "btn gen_big_btn" + (can ? "" : " gen_disabled");
        }
        let cnote = doc.getElementById("gen_collapse_note");
        if (cnote) {
            cnote.textContent = player.gen.activeTrial >= 0
                ? "Collapsing is disabled until the active Trial is finished or abandoned."
                : depth.gte(GENESIS_MIN_COLLAPSE)
                    ? "Collapsing grants " + format(gain) + " Genesis Motes and keeps " + format(this.retention() * 100) + "% of your depth."
                    : "Reach depth " + format(GENESIS_MIN_COLLAPSE) + " to collapse (throughput: " + format(rate, 5) + " depth/s).";
            if (player.gen.autoCollapse && depth.gte(GENESIS_DEPTH_CAP)) cnote.textContent = "Automation paused at the top layer (eeee100 g). Collapse manually to keep farming Motes.";
        }

        let ab = doc.getElementById("gen_autobuy_btn");
        if (ab) { ab.textContent = player.gen.autoBuy ? "ON" : "OFF"; ab.className = "btn stats_btn_sm" + (player.gen.autoBuy ? " gen_on" : ""); }
        let ac = doc.getElementById("gen_autocollapse_btn");
        if (ac) { ac.textContent = player.gen.autoCollapse ? "ON" : "OFF"; ac.className = "btn stats_btn_sm" + (player.gen.autoCollapse ? " gen_on" : ""); }
        txt("gen_auto_now", format(this.autoThreshold(), 4) + " depth");
        let db = doc.getElementById("gen_autodepth_btns");
        if (db) {
            Array.prototype.forEach.call(db.children, b => {
                let v = Number(b.getAttribute("data-d"));
                b.className = "btn stats_btn_sm gen_depth_btn" + (Math.abs(v - Number(player.gen.autoDepth)) < 1e-9 ? " gen_on" : "");
            });
        }

        // upgrade tab live values
        if (sub === 1) {
            txt("gen_motes_hdr", format(player.gen.motes) + " Motes");
            for (let i = 1; i < GEN_UPGS.length; i++) {
                let def = GEN_UPGS[i];
                let lvl = this.upgLvl(i);
                txt("gen_eff_" + i, lvl >= def.max ? "Maxed" : def.effDesc(def.eff(lvl)));
                txt("gen_cost_" + i, lvl >= def.max ? "-" : format(this.upgCost(i)) + " Motes");
                let b1 = doc.getElementById("gen_buy1_" + i);
                let bm = doc.getElementById("gen_buymax_" + i);
                let can = player.gen.unl && this.upgUnl(i) && lvl < def.max && !this.trialLocked() && player.gen.motes.gte(this.upgCost(i));
                if (b1) b1.disabled = !can;
                if (bm) bm.disabled = !can;
            }
        }
    },
};

// ---------------------------------------------------------------------------
// Global handlers used by inline HTML
// ---------------------------------------------------------------------------
function genCollapse() { GENESIS.collapse(false); GENESIS.markDirty(); GENESIS.updateHTML(); }
function genBuy(i, max) { GENESIS.buy(i, !!max); }
function genStartTrial(i) { GENESIS.startTrial(i); }
function genAbandonTrial() { GENESIS.abandonTrial(); }
function genToggleAutoBuy() { GENESIS.toggleAutoBuy(); }
function genToggleAutoCollapse() { GENESIS.toggleAutoCollapse(); }
function genSetAutoDepth(v) { GENESIS.setAutoDepth(Number(v)); }

// ---------------------------------------------------------------------------
// Stats-tab section
// ---------------------------------------------------------------------------
function buildSection9Genesis() {
    if (!player.gen || !player.gen.unl) return "";
    let g = player.gen;
    let rows = [
        sRow("Tetration Depth", format(g.depth, 5) + " / " + format(GENESIS_DEPTH_CAP)),
        sRow("Best Depth", format(g.bestDepth, 5)),
        sRow("Tetration Speed", format((tmp.gen && tmp.gen.rate) ? tmp.gen.rate : GENESIS.rate(), 5) + " depth/s"),
        sRow("Mass (Genesis floor)", format(player.mass) + " g"),
        sRow("Genesis Motes", format(g.motes) + ` <span class="stats_subnote">+${format((tmp.gen && tmp.gen.moteGain) ? tmp.gen.moteGain : GENESIS.moteGain(g.depth))} on collapse</span>`),
        sRow("Total Motes Earned", format(g.totalMotes)),
        sRow("Collapses", format(g.collapses, 0)),
        sRow("Depth Retention", format(GENESIS.retention() * 100) + "%"),
        sRow("Mote Exponent", format(GENESIS.moteExponent(), 0)),
        sRow("Milestone Multiplier", format(GENESIS.milestoneMult()) + "x"),
        sRow("Trial Multiplier", format(GENESIS.trialRateMult()) + "x speed / " + format(GENESIS.trialMoteMult()) + "x motes"),
        sRow("Active Trial", g.activeTrial >= 0 ? GEN_TRIALS[g.activeTrial].name : "None"),
        sRow("Genesis Status", g.complete ? "COMPLETE (eeee100 g)" : "In progress"),
    ];
    let cards = [sCard("Genesis Overview", rows)];

    let upRows = [];
    for (let i = 1; i < GEN_UPGS.length; i++) {
        let def = GEN_UPGS[i];
        let unl = GENESIS.upgUnl(i);
        upRows.push(sRow(def.name,
            unl ? `Lv ${GENESIS.upgLvl(i)} / ${def.max} <span class="stats_subnote">${GENESIS.upgLvl(i) >= def.max ? "Maxed" : format(GENESIS.upgCost(i)) + " Motes"}</span>` : "Locked",
            { locked: !unl, tags: "genesis upgrade" }));
    }
    cards.push(sCard("Genesis Upgrades", upRows));

    let mRows = GEN_MILESTONES.map((m, i) => sRow(m.name, `${genMilestoneReqText(i)} — ${m.reward}`, { badge: GENESIS.milestoneReached(i) ? sBadge("DONE", "unlocked") : sBadge("LOCKED", "locked") }));
    cards.push(sCard("Genesis Milestones", mRows));

    let tRows = GEN_TRIALS.map((t, i) => sRow(t.name, `${t.desc} <span class="stats_subnote">Reward: ${t.reward}</span>`, { badge: GENESIS.trialDone(i) ? sBadge("DONE", "unlocked") : player.gen.activeTrial === i ? sBadge("ACTIVE", "active") : sBadge("LOCKED", "locked") }));
    cards.push(sCard("Genesis Trials", tRows));

    return cards.join("");
}
