// ============================================================================
// SUPERNOVA NEBULA — the reset layered above Supernova Cluster
// ----------------------------------------------------------------------------
// Supernova Galaxy counts Supernovas, Supernova Cluster counts Galaxies, and
// the Nebula counts Clusters. A Nebula Collapse converts your Supernova
// Cluster count into Nebula Dust, then sends you back to the start of the
// galaxy climb. Dust buys permanent Nebula upgrades and unlocks:
//
//   * the fifth Element tier (elements 559 - 598)
//   * the Nebula branch of the Neutron Tree
//   * extra Exotic upgrades and Milestones
//   * a permanent boost to Genesis tetration speed and mote gain
// ============================================================================

const NEBULA_REQ_START = 14;      // Supernova Clusters needed for the first collapse
const NEBULA_REQ_BASE = 1.06;     // requirement growth per Nebula Collapse
const NEBULA_DUST_BASE = 1.5;     // dust = 1.5^(Clusters - start + 1) * bonuses
const NEBULA_UPG_COUNT = 12;
const NEBULA_MILESTONE_COUNT = 10;

// ---------------------------------------------------------------------------
// Upgrades (bought with Nebula Dust)
// ---------------------------------------------------------------------------

const NEB_UPGS = [
    null,
    {
        name: "Dust Condenser",
        desc: "Each level multiplies Nebula Dust gained on a Collapse.",
        max: 10,
        base: 2, mult: 4,
        eff(n) { return E(1.5).pow(n) },
        effDesc(x) { return format(x) + " Dust" },
    },
    {
        name: "Nebular Flow",
        desc: "Dust-laced mass streams permanently accelerate Genesis tetration.",
        max: 12,
        base: 3, mult: 4,
        eff(n) { return E(1.25).pow(n) },
        effDesc(x) { return format(x) + " Tetration Speed" },
    },
    {
        name: "Mote Cloud",
        desc: "Each level multiplies Genesis Mote gain.",
        max: 12,
        base: 3, mult: 4,
        eff(n) { return E(1.2).pow(n) },
        effDesc(x) { return format(x) + " Motes" },
    },
    {
        name: "Exotic Winds",
        desc: "Each level multiplies Exotic Matter gain.",
        max: 10,
        base: 10, mult: 5,
        eff(n) { return E(1.3).pow(n) },
        effDesc(x) { return format(x) + " Exotic Matter" },
    },
    {
        name: "Stellar Forge",
        desc: "Each level multiplies Stardust gain.",
        max: 8,
        base: 25, mult: 6,
        eff(n) { return E(2).pow(n) },
        effDesc(x) { return format(x) + " Stardust" },
    },
    {
        name: "Quantum Mist",
        desc: "Each level multiplies Galactic Quark gain.",
        max: 10,
        base: 10, mult: 5,
        eff(n) { return E(1.5).pow(n) },
        effDesc(x) { return format(x) + " Galactic Quarks" },
    },
    {
        name: "Elemental Dust",
        desc: "Each level makes every Element 3% cheaper.",
        max: 10,
        base: 15, mult: 5,
        eff(n) { return E(0.97).pow(n) },
        effDesc(x) { return "×" + format(x) + " Element costs" },
    },
    {
        name: "Supernova Bloom",
        desc: "Each level multiplies Neutron Star gain.",
        max: 10,
        base: 5, mult: 4,
        eff(n) { return E(1.4).pow(n) },
        effDesc(x) { return format(x) + " Neutron Stars" },
    },
    {
        name: "Dust Recursion",
        desc: "Each level exponentiates Nebula Dust gain by +0.05.",
        max: 4,
        base: 2500, mult: 12,
        eff(n) { return E(1).add(E(n).mul(0.05)) },
        effDesc(x) { return "^" + format(x) + " Dust" },
    },
    {
        name: "Nebula Automator",
        desc: "Automatically buys every Nebula upgrade it can afford.",
        max: 1,
        base: 5000, mult: 1,
        eff() { return E(1) },
        effDesc() { return "Auto-Buy enabled" },
    },
    {
        name: "Collapse Automator",
        desc: "Automatically collapses into the Nebula once the requirement is met twice over.",
        max: 1,
        base: 20000, mult: 1,
        eff() { return E(1) },
        effDesc() { return "Auto-Collapse enabled" },
    },
    {
        name: "Nebular Harmony",
        desc: "Harmonises the whole layer: raises the Harmony multiplier.",
        max: 8,
        base: 250, mult: 6,
        eff(n) { return E(1.15).pow(n) },
        effDesc(x) { return format(x) + " Harmony (all Nebula effects)" },
    },
];

// ---------------------------------------------------------------------------
// Milestones (permanent, based on collapses and total dust earned)
// ---------------------------------------------------------------------------

const NEB_MILESTONES = [
    { times: 1, dust: 0, name: "First Dust", reward: "Unlock Element Tier 5 and the Nebula tree branch. ×2 Dust." },
    { times: 0, dust: 25, name: "Dust Gathering", reward: "×1.5 Genesis Tetration Speed." },
    { times: 2, dust: 0, name: "Nebular Habit", reward: "×2 Exotic Matter gain." },
    { times: 0, dust: 500, name: "Dust Storm", reward: "×2 Nebula Dust." },
    { times: 3, dust: 0, name: "Cloudbreak", reward: "×2 Genesis Motes, keep Stellar Mass on Nebula resets." },
    { times: 0, dust: 1e4, name: "Accretion", reward: "×2.5 Nebula Dust and ×1.5 Stardust." },
    { times: 5, dust: 0, name: "Deep Nebula", reward: "×3 Nebula Dust and all Nebula upgrades are 10% cheaper." },
    { times: 0, dust: 1e5, name: "Star Nursery", reward: "×2 Genesis Tetration Speed and ×2 Galactic Quarks." },
    { times: 8, dust: 0, name: "Nebula Engine", reward: "×4 Nebula Dust and unlock Nebula auto-collapse without the upgrade." },
    { times: 0, dust: 1e6, name: "Nebula Complete", reward: "×5 Nebula Dust, ×2 Harmony." },
];

const NEB_AUTO_TIMES = 8;   // milestone that unlocks automation

// ---------------------------------------------------------------------------
// Core object
// ---------------------------------------------------------------------------

const SUPERNOVA_NEBULA = {
    // ---- state helpers -----------------------------------------------------
    state() {
        if (!player.nebula) {
            player.nebula = {
                unl: false, times: E(0), dust: E(0), total: E(0), best: E(0),
                upgs: [], milestones: [], autoBuy: false, autoCollapse: false,
            };
        }
        return player.nebula;
    },
    upgLvl(i) { return this.state().upgs[i] || 0 },
    upgMaxed(i) { return this.upgLvl(i) >= NEB_UPGS[i].max },
    upgUnl(i) { let u = NEB_UPGS[i].unl; return u ? !!u() : true },
    upgCostMult() { return this.milestoneReached(6) ? 0.9 : 1 },
    upgCost(i) { return NEB_UPGS[i].cost ? NEB_UPGS[i].cost(this.upgLvl(i)) : E(NEB_UPGS[i].base).mul(E(NEB_UPGS[i].mult).pow(this.upgLvl(i))).mul(this.upgCostMult()).floor().max(1) },
    upgEff(i) { let u = NEB_UPGS[i].eff; return u ? u(this.upgLvl(i)) : E(1) },
    milestoneReached(i) { return !!this.state().milestones[i] },

    // ---- requirements ------------------------------------------------------
    reqStart() { return E(NEBULA_REQ_START) },
    req() {
        let x = E(NEBULA_REQ_BASE).pow(this.state().times).mul(this.reqStart());
        return x.floor().max(NEBULA_REQ_START);
    },
    canReset() {
        return !!this.state().unl && player.superCluster.gte(this.req());
    },
    autoReq() { return this.req().mul(2) },
    unlocked() { return !!this.state().unl },

    // ---- multipliers -------------------------------------------------------
    harmony() {
        let x = this.upgEff(12).mul(this.milestoneReached(9) ? 2 : 1);
        if (player.exotic.times.gte(150)) x = x.mul(1.5);
        if (hasUpgrade('exotic', 30)) x = x.mul(1.25);
        if (player.exotic.times.gte(300)) x = x.mul(3);
        if (typeof nebElementMult === "function") x = x.mul(nebElementMult("harmony"));
        if (typeof hasTree === "function" && hasTree("neb12")) x = x.mul(treeEff("neb12"));
        return x;
    },

    dustMult() {
        let x = E(1);
        x = x.mul(this.upgEff(1));                                  // Dust Condenser
        if (this.milestoneReached(0)) x = x.mul(2);
        if (this.milestoneReached(3)) x = x.mul(2);
        if (this.milestoneReached(5)) x = x.mul(2.5);
        if (this.milestoneReached(6)) x = x.mul(3);
        if (this.milestoneReached(8)) x = x.mul(4);
        if (this.milestoneReached(9)) x = x.mul(5);
        if (player.exotic.times.gte(60)) x = x.mul(2);
        if (hasUpgrade('exotic', 26)) x = x.mul(2);
        if (hasUpgrade('exotic', 32)) x = x.mul(2);
        if (player.exotic.times.gte(300)) x = x.mul(3);
        if (typeof hasTree === "function") {
            if (hasTree("neb2")) x = x.mul(treeEff("neb2"));
            if (hasTree("neb11")) x = x.mul(treeEff("neb11"));
        }
        if (typeof GENESIS !== "undefined" && GENESIS.relicEffect) {
            x = x.mul(GENESIS.relicEffect("dust"));
            x = x.mul(GENESIS.relicEffect("harmony"));
            x = x.mul(GENESIS.dustUpgMult());
        }
        if (typeof nebElementMult === "function") x = x.mul(nebElementMult("dust"));
        return x;
    },

    dustGain() {
        let s = this.state();
        if (!s.unl) return E(0);
        let start = this.reqStart();
        if (player.superCluster.lt(start)) return E(0);
        let n = player.superCluster.sub(start).add(1);
        let x = E(NEBULA_DUST_BASE).pow(n);
        x = x.mul(this.dustMult());
        x = x.pow(this.upgEff(9));       // Dust Recursion
        return x.floor().max(1);
    },

    // ---- effects used by other layers --------------------------------------
    effects: {
        harmony() { return SUPERNOVA_NEBULA.harmony() },
        genRate() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.6).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(2));
            if (SUPERNOVA_NEBULA.milestoneReached(1)) x = x.mul(1.5);
            if (SUPERNOVA_NEBULA.milestoneReached(7)) x = x.mul(2);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        genMotes() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.4).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(3));
            if (SUPERNOVA_NEBULA.milestoneReached(4)) x = x.mul(2);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        exotic() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.5).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(4));
            if (SUPERNOVA_NEBULA.milestoneReached(2)) x = x.mul(2);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        stardust() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(5));
            if (SUPERNOVA_NEBULA.milestoneReached(5)) x = x.mul(1.5);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        galQk() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.5).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(6));
            if (SUPERNOVA_NEBULA.milestoneReached(7)) x = x.mul(2);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        stars() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.3).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(8));
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        elemCost() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            return SUPERNOVA_NEBULA.upgEff(7).div(SUPERNOVA_NEBULA.harmony().max(1).pow(0.02)).min(1);
        },
    },

    // ---- unlock / progression ---------------------------------------------
    checkUnlock() {
        let s = this.state();
        if (s.unl) return;
        if (typeof hasTree === "function" && hasTree("ax42") && player.mass.gte("eee100")) {
            s.unl = true;
            if (typeof addNotify === "function") addNotify("Supernova Nebula unlocked — Clusters now collapse into Dust!", 6);
            this.markDirty();
        }
    },

    checkMilestones() {
        let s = this.state();
        let changed = false;
        for (let i = 0; i < NEB_MILESTONES.length; i++) {
            if (s.milestones[i]) continue;
            let m = NEB_MILESTONES[i];
            if (s.times.gte(m.times) && s.total.gte(m.dust)) {
                s.milestones[i] = true;
                changed = true;
                if (typeof addNotify === "function") addNotify("Nebula Milestone: " + m.name, 5);
            }
        }
        if (changed) this.markDirty();
    },

    // ---- tick --------------------------------------------------------------
    calc(dt, dt_offline) {
        this.checkUnlock();
        let s = this.state();
        if (!s.unl) return;
        this.checkMilestones();
        if (s.autoBuy && this.upgLvl(10) >= 1) this.autoBuy();
        if (s.unl && this.autoUnlocked() && (s.autoCollapse || this.upgLvl(11) >= 1)) {
            if (player.superCluster.gte(this.autoReq())) {
                let now = Date.now();
                if (now - (this.lastAuto || 0) > 1000) {
                    this.lastAuto = now;
                    this.reset(true);
                }
            }
        }
    },

    autoUnlocked() { return this.milestoneReached(NEB_AUTO_TIMES) || this.upgLvl(11) >= 1 },

    updateTemp() {
        if (!tmp.nebula) tmp.nebula = {};
        let s = this.state();
        tmp.nebula.req = this.req();
        tmp.nebula.can = this.canReset();
        tmp.nebula.gain = this.dustGain();
        tmp.nebula.dust = s.dust;
        tmp.nebula.harmony = this.harmony();
        tmp.nebula.genRate = this.effects.genRate();
        tmp.nebula.genMotes = this.effects.genMotes();
        tmp.nebula.exotic = this.effects.exotic();
        tmp.nebula.stardust = this.effects.stardust();
        tmp.nebula.galQk = this.effects.galQk();
        tmp.nebula.stars = this.effects.stars();
        tmp.nebula.elemCost = this.effects.elemCost();
    },

    // ---- actions -----------------------------------------------------------
    buy(i, max = false) {
        let def = NEB_UPGS[i];
        let s = this.state();
        if (!def || !s.unl) return;
        if (this.upgMaxed(i)) return;
        let bought = 0;
        while (!this.upgMaxed(i) && s.dust.gte(this.upgCost(i))) {
            s.dust = s.dust.sub(this.upgCost(i));
            s.upgs[i] = this.upgLvl(i) + 1;
            bought++;
            if (i === 10) s.autoBuy = true;
            if (i === 11) s.autoCollapse = true;
            if (!max) break;
        }
        if (bought > 0) {
            if (typeof save === "function") save();
            this.updateTemp();
            this.markDirty();
            this.updateHTML();
        }
    },

    autoBuy() {
        let s = this.state();
        let any = false;
        for (let pass = 0; pass < 12; pass++) {
            let bought = false;
            for (let i = 1; i < NEB_UPGS.length; i++) {
                if (this.upgMaxed(i)) continue;
                if (s.dust.gte(this.upgCost(i))) {
                    s.dust = s.dust.sub(this.upgCost(i));
                    s.upgs[i] = this.upgLvl(i) + 1;
                    bought = true; any = true;
                }
            }
            if (!bought) break;
        }
        if (any) {
            this.updateTemp();
            this.dirty = true;
        }
    },

    reset(force = false) {
        let s = this.state();
        if (!s.unl) return false;
        if (!force) {
            if (!this.canReset()) {
                if (typeof addNotify === "function") addNotify("Not enough Supernova Clusters to collapse into the Nebula", 4);
                return false;
            }
            if (player.confirms.sg) {
                if (!confirm("Collapse into the Supernova Nebula?\n\nThis resets Supernova Clusters, Stardust, Stellar Mass and the Galaxy layer (Exotic Matter and Elements are kept).")) return false;
            }
        }
        let gain = this.dustGain();
        s.dust = s.dust.add(gain);
        s.total = s.total.add(gain);
        s.best = s.best.max(gain);
        s.times = s.times.add(1);

        // ---- reset everything below the Nebula ------------------------------
        player.superCluster = E(0);
        if (!this.milestoneReached(4) && player.exotic.times.lt(60)) {
            player.stardust = E(0);
            player.stellar = E(0);
            player.stellar_gen = E(0);
        }
        player.galPow = [E(0), E(0), E(0), E(0), E(0), E(0), player.galPow[6]];
        if (typeof SUPERNOVA_CLUSTER !== "undefined") SUPERNOVA_CLUSTER.reset(true);
        player.atom.elements = player.atom.elements || [];
        player.atom.chargedElements = player.atom.chargedElements || [];

        this.checkMilestones();
        this.updateTemp();
        this.markDirty();
        this.updateHTML();
        if (typeof save === "function") save();
        if (typeof addNotify === "function") addNotify("Nebula Collapse: +" + format(gain) + " Dust", 4);
        return true;
    },

    // ---- save handling -----------------------------------------------------
    sanitize() {
        let s = this.state();
        s.unl = !!s.unl;
        if (!(s.times instanceof Decimal)) s.times = E(s.times === undefined ? 0 : s.times);
        ["dust", "total", "best"].forEach(k => {
            if (!(s[k] instanceof Decimal)) s[k] = E(s[k] === undefined ? 0 : s[k]);
            if (Number.isNaN(s[k].mag) || Number.isNaN(s[k].layer) || s[k].lt(0)) s[k] = E(0);
        });
        if (!Array.isArray(s.upgs)) s.upgs = [];
        for (let i = 1; i < NEB_UPGS.length; i++) {
            let lvl = Number(s.upgs[i]);
            if (!Number.isFinite(lvl) || lvl < 0) lvl = 0;
            s.upgs[i] = Math.min(Math.floor(lvl), NEB_UPGS[i].max);
        }
        if (!Array.isArray(s.milestones)) s.milestones = [];
        for (let i = 0; i < NEB_MILESTONES.length; i++) s.milestones[i] = !!s.milestones[i];
        s.autoBuy = !!s.autoBuy;
        s.autoCollapse = !!s.autoCollapse;
        if (s.dust.gt("1e308")) s.dust = E("1e308");
    },

    markDirty() { this.dirty = true },

    // ---- UI ---------------------------------------------------------------
    setupHTML() {
        let root = document.getElementById("tab_frame12");
        if (!root) return;
        root.innerHTML = `<div class="gen_container neb_container">
            <div id="stab_frame12_0" class="gen_sub"></div>
            <div id="stab_frame12_1" class="gen_sub"></div>
            <div id="stab_frame12_2" class="gen_sub"></div>
        </div>`;
        this.markDirty();
        this.render();
    },

    render() {
        let main = document.getElementById("stab_frame12_0");
        let upgs = document.getElementById("stab_frame12_1");
        let miles = document.getElementById("stab_frame12_2");
        if (main) main.innerHTML = this.buildMain();
        if (upgs) upgs.innerHTML = this.buildUpgrades();
        if (miles) miles.innerHTML = this.buildMilestones();
        this.dirty = false;
    },

    buildMain() {
        let s = this.state();
        let kpi = (label, id) => `<div class="gen_kpi"><div class="gen_kpi_label">${label}</div><div class="gen_kpi_val" id="${id}">--</div></div>`;
        let effects = [
            ["Genesis Tetration Speed", "neb_eff_genrate"],
            ["Genesis Mote Gain", "neb_eff_genmotes"],
            ["Exotic Matter Gain", "neb_eff_exotic"],
            ["Stardust Gain", "neb_eff_stardust"],
            ["Galactic Quark Gain", "neb_eff_galqk"],
            ["Neutron Star Gain", "neb_eff_stars"],
            ["Element Cost Multiplier", "neb_eff_elemcost"],
            ["Harmony", "neb_eff_harmony"],
        ].map(([l, id]) => `<div class="gen_row"><span>${l}</span><span id="${id}">--</span></div>`).join("");
        return `
        <div class="gen_hero neb_hero">
            <div class="gen_hero_title">SUPERNOVA NEBULA</div>
            <div class="gen_hero_sub">Collapse your Supernova Clusters into <b>Nebula Dust</b>. Dust outlives every galaxy reset and reaches into Genesis itself.</div>
            <div id="neb_unl_banner" class="gen_banner" style="display:none;">THE NEBULA OPENS — collapse a Supernova Cluster into Dust</div>
        </div>
        <div class="gen_kpis">
            ${kpi("Nebula Dust", "neb_dust")}
            ${kpi("Dust on Collapse", "neb_gain")}
            ${kpi("Nebula Collapses", "neb_times")}
            ${kpi("Total Dust Earned", "neb_total")}
            ${kpi("Supernova Clusters", "neb_sc")}
            ${kpi("Clusters Required", "neb_req")}
            ${kpi("Best Dust Gain", "neb_best")}
            ${kpi("Harmony", "neb_harmony")}
        </div>
        <div class="gen_progress_wrap">
            <div class="gen_progress_label"><span id="neb_progress_label">Clusters 0 / 14</span><span id="neb_goal_label">Goal: collapse</span></div>
            <div class="gen_bar"><div class="gen_bar_fill" id="neb_bar_fill" style="width:0%"></div></div>
        </div>
        <div class="gen_actions">
            <button class="btn gen_big_btn neb_big_btn" id="neb_reset_btn" onclick="nebReset()">Nebula Collapse</button>
            <div class="gen_collapse_note" id="neb_reset_note">Reach the required Supernova Clusters to collapse.</div>
        </div>
        <div class="gen_grid">
            <div class="gen_card">
                <div class="gen_card_title">Automation</div>
                <div class="gen_row"><span>Auto-Buy Upgrades</span><button class="btn stats_btn_sm" id="neb_autobuy_btn" onclick="nebToggleAutoBuy()">OFF</button></div>
                <div class="gen_row"><span>Auto-Collapse</span><button class="btn stats_btn_sm" id="neb_autocollapse_btn" onclick="nebToggleAutoCollapse()">OFF</button></div>
                <div class="gen_note">Auto-Collapse fires once you hold <b>twice</b> the Cluster requirement. Unlocked by the Nebula Engine milestone (or the Collapse Automator upgrade).</div>
            </div>
            <div class="gen_card">
                <div class="gen_card_title">Nebula effects</div>
                ${effects}
                <div class="gen_note">Dust scales with how far past ${NEBULA_REQ_START} Clusters you are. Every collapse raises the requirement, but also the reward.</div>
            </div>
        </div>`;
    },

    buildUpgrades() {
        let cards = "";
        for (let i = 1; i < NEB_UPGS.length; i++) {
            let def = NEB_UPGS[i];
            let lvl = this.upgLvl(i);
            let maxed = lvl >= def.max;
            cards += `<div class="gen_card gen_upg">
                <div class="gen_card_title"><span>${def.name}</span><span class="gen_tag">${maxed ? "MAX" : "Lv " + lvl + " / " + def.max}</span></div>
                <div class="gen_note gen_note_left">${def.desc}</div>
                <div class="gen_row"><span>Effect</span><span id="neb_eff_${i}">--</span></div>
                <div class="gen_row"><span>Cost</span><span id="neb_cost_${i}">--</span></div>
                <div class="gen_btn_row">
                    <button class="btn stats_btn_sm" id="neb_buy1_${i}" onclick="nebBuy(${i}, false)">Buy</button>
                    ${def.max > 1 ? `<button class="btn stats_btn_sm" id="neb_buymax_${i}" onclick="nebBuy(${i}, true)">Buy Max</button>` : ""}
                </div>
            </div>`;
        }
        return `<div class="gen_section">
            <div class="gen_section_head"><span>Nebula Upgrades</span><span class="gen_tag" id="neb_dust_hdr">--</span></div>
            <div class="gen_grid">${cards}</div>
        </div>`;
    },

    buildMilestones() {
        let rows = "";
        for (let i = 0; i < NEB_MILESTONES.length; i++) {
            let m = NEB_MILESTONES[i];
            let done = this.milestoneReached(i);
            let req = [];
            if (m.times) req.push(format(m.times, 0) + " Collapses");
            if (m.dust) req.push(format(m.dust) + " Dust earned");
            rows += `<div class="gen_mile${done ? " gen_mile_done" : ""}">
                <div class="gen_mile_head"><span>${m.name}</span>${done ? '<span class="stats_badge unlocked">DONE</span>' : `<span class="stats_badge locked">${req.join(" & ")}</span>`}</div>
                <div class="gen_note gen_note_left">${m.reward}</div>
                ${done ? "" : `<div class="gen_note gen_note_left">Progress: ${format(this.state().times, 0)} collapses · ${format(this.state().total)} total dust</div>`}
            </div>`;
        }
        return `<div class="gen_section">
            <div class="gen_section_head"><span>Nebula Milestones</span><span class="gen_tag">Permanent</span></div>
            <div class="gen_grid">${rows}</div>
        </div>`;
    },

    updateHTML() {
        if (this.dirty) this.render();
        let s = this.state();
        let txt = (id, val) => { let el = document.getElementById(id); if (el) el.textContent = val; };
        let show = (id, on) => { let el = document.getElementById(id); if (el) el.style.display = on ? "" : "none"; };

        txt("neb_dust", format(s.dust));
        txt("neb_gain", format(this.dustGain()));
        txt("neb_times", format(s.times, 0));
        txt("neb_total", format(s.total));
        txt("neb_sc", format(player.superCluster, 0));
        txt("neb_req", format(this.req(), 0));
        txt("neb_best", format(s.best));
        txt("neb_harmony", format(this.harmony()));
        txt("neb_eff_genrate", format(this.effects.genRate()) + "x");
        txt("neb_eff_genmotes", format(this.effects.genMotes()) + "x");
        txt("neb_eff_exotic", format(this.effects.exotic()) + "x");
        txt("neb_eff_stardust", format(this.effects.stardust()) + "x");
        txt("neb_eff_galqk", format(this.effects.galQk()) + "x");
        txt("neb_eff_stars", format(this.effects.stars()) + "x");
        txt("neb_eff_elemcost", "x" + format(this.effects.elemCost(), 3));
        txt("neb_eff_harmony", format(this.harmony()) + "x");

        let pct = 0;
        let req = this.req();
        if (req.gt(0)) pct = Math.max(0, Math.min(1, player.superCluster.div(req).toNumber()));
        let bar = document.getElementById("neb_bar_fill");
        if (bar) bar.style.width = (pct * 100).toFixed(2) + "%";
        txt("neb_progress_label", "Clusters " + format(player.superCluster, 0) + " / " + format(req, 0));
        txt("neb_goal_label", this.canReset() ? "Ready to collapse" : "Keep climbing");
        show("neb_unl_banner", !s.unl);

        let btn = document.getElementById("neb_reset_btn");
        if (btn) {
            btn.disabled = !this.canReset();
            btn.className = "btn gen_big_btn neb_big_btn" + (this.canReset() ? "" : " gen_disabled");
        }
        txt("neb_reset_note", this.canReset()
            ? "Collapsing grants " + format(this.dustGain()) + " Nebula Dust and resets the Galaxy layer (Elements and Exotic Matter are kept)."
            : "You need " + format(req, 0) + " Supernova Clusters to collapse. You have " + format(player.superCluster, 0) + ".");

        for (let i = 1; i < NEB_UPGS.length; i++) {
            let def = NEB_UPGS[i];
            let lvl = this.upgLvl(i);
            let maxed = lvl >= def.max;
            txt("neb_eff_" + i, maxed ? def.effDesc(def.eff(def.max)) : def.effDesc(def.eff(lvl)));
            txt("neb_cost_" + i, maxed ? "-" : format(this.upgCost(i)) + " Dust");
            let can = s.unl && !maxed && s.dust.gte(this.upgCost(i));
            let b1 = document.getElementById("neb_buy1_" + i);
            let bm = document.getElementById("neb_buymax_" + i);
            if (b1) b1.disabled = !can;
            if (bm) bm.disabled = !can;
        }
        txt("neb_dust_hdr", format(s.dust) + " Dust");

        let ab = document.getElementById("neb_autobuy_btn");
        if (ab) { ab.textContent = s.autoBuy ? "ON" : "OFF"; ab.className = "btn stats_btn_sm" + (s.autoBuy ? " gen_on" : ""); ab.disabled = this.upgLvl(10) < 1; }
        let ac = document.getElementById("neb_autocollapse_btn");
        if (ac) { ac.textContent = s.autoCollapse ? "ON" : "OFF"; ac.className = "btn stats_btn_sm" + (s.autoCollapse ? " gen_on" : ""); ac.disabled = !this.autoUnlocked(); }
    },

    toggleAutoBuy() {
        let s = this.state();
        if (this.upgLvl(10) < 1) return;
        s.autoBuy = !s.autoBuy;
        if (typeof save === "function") save();
        this.markDirty(); this.updateHTML();
    },

    toggleAutoCollapse() {
        let s = this.state();
        if (!this.autoUnlocked()) return;
        s.autoCollapse = !s.autoCollapse;
        if (typeof save === "function") save();
        this.markDirty(); this.updateHTML();
    },
};

// dust bonuses that come from the newest Element tier (filled in by elemental.js)
const NEB_ELEMENT_DUST = {};

// ---------------------------------------------------------------------------
// Global handlers used by inline HTML
// ---------------------------------------------------------------------------
function nebReset() { SUPERNOVA_NEBULA.reset(false); }
function nebBuy(i, max) { SUPERNOVA_NEBULA.buy(i, !!max); }
function nebToggleAutoBuy() { SUPERNOVA_NEBULA.toggleAutoBuy(); }
function nebToggleAutoCollapse() { SUPERNOVA_NEBULA.toggleAutoCollapse(); }

function calcNebula(dt, dt_offline) {
    SUPERNOVA_NEBULA.calc(dt, dt_offline);
}

// ---------------------------------------------------------------------------
// Stats-tab section
// ---------------------------------------------------------------------------
function buildSection10Nebula() {
    if (typeof player === "undefined" || !player.nebula || !player.nebula.unl) return "";
    let s = SUPERNOVA_NEBULA.state();
    let rows = [
        sRow("Nebula Dust", format(s.dust) + ` <span class="stats_subnote">+${format(SUPERNOVA_NEBULA.dustGain())} on collapse</span>`),
        sRow("Nebula Collapses", format(s.times, 0)),
        sRow("Total Dust Earned", format(s.total)),
        sRow("Best Collapse", format(s.best)),
        sRow("Supernova Clusters", format(player.superCluster, 0) + " / " + format(SUPERNOVA_NEBULA.req(), 0)),
        sRow("Harmony", format(SUPERNOVA_NEBULA.harmony()) + "x"),
        sRow("Genesis Tetration Speed", format(SUPERNOVA_NEBULA.effects.genRate()) + "x"),
        sRow("Genesis Mote Gain", format(SUPERNOVA_NEBULA.effects.genMotes()) + "x"),
        sRow("Exotic Matter Gain", format(SUPERNOVA_NEBULA.effects.exotic()) + "x"),
        sRow("Stardust Gain", format(SUPERNOVA_NEBULA.effects.stardust()) + "x"),
        sRow("Galactic Quark Gain", format(SUPERNOVA_NEBULA.effects.galQk()) + "x"),
        sRow("Neutron Star Gain", format(SUPERNOVA_NEBULA.effects.stars()) + "x"),
        sRow("Element Cost Multiplier", "x" + format(SUPERNOVA_NEBULA.effects.elemCost(), 3)),
        sRow("Auto-Buy", SUPERNOVA_NEBULA.upgLvl(10) >= 1 ? (s.autoBuy ? "ON" : "OFF") : "Locked"),
        sRow("Auto-Collapse", SUPERNOVA_NEBULA.autoUnlocked() ? (s.autoCollapse ? "ON" : "OFF") : "Locked"),
    ];
    let cards = [sCard("Nebula Overview", rows)];

    let upRows = [];
    for (let i = 1; i < NEB_UPGS.length; i++) {
        let def = NEB_UPGS[i];
        upRows.push(sRow(def.name, `Lv ${SUPERNOVA_NEBULA.upgLvl(i)} / ${def.max} <span class="stats_subnote">${SUPERNOVA_NEBULA.upgMaxed(i) ? "Maxed" : format(SUPERNOVA_NEBULA.upgCost(i)) + " Dust"}</span>`));
    }
    cards.push(sCard("Nebula Upgrades", upRows));

    let mRows = NEB_MILESTONES.map((m, i) => {
        let req = [];
        if (m.times) req.push(format(m.times, 0) + " collapses");
        if (m.dust) req.push(format(m.dust) + " dust");
        return sRow(m.name, `${req.join(" & ")} — ${m.reward}`, { badge: SUPERNOVA_NEBULA.milestoneReached(i) ? sBadge("DONE", "unlocked") : sBadge("LOCKED", "locked") });
    });
    cards.push(sCard("Nebula Milestones", mRows));
    return cards.join("");
}
