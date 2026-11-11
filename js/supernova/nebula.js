// ============================================================================
// SUPERNOVA NEBULA
// ----------------------------------------------------------------------------
// The reset above Supernova Cluster. Supernova Galaxy counts Supernovas,
// Supernova Cluster counts Galaxies and the Nebula counts Clusters:
//
//   Supernova Clusters  -->  Nebula Collapse  -->  Nebula Dust
//
// A Nebula Collapse resets Clusters, Stardust, Stellar Mass and the Galaxy
// layer (Elements and Exotic Matter are kept) and pays out Dust, which is
// permanent. Dust buys the 12 Nebula upgrades, the Nebula branch of the
// Neutron Tree, the 80-element Nebula tier (559-638) and fuels the Exotic extension.
// ============================================================================

const NEBULA_REQ_START = 14;      // Supernova Clusters needed for the first Nebula
const NEBULA_REQ_BASE = 1.06;     // requirement growth per Nebula
const NEBULA_DUST_BASE = 1.5;     // dust = 1.5^(Clusters - start + 1) * multipliers
const NEBULA_UPG_COUNT = 12;
const NEBULA_MILESTONE_COUNT = 10;
const NEBULA_AUTO_TIMES = 8;      // milestone that unlocks auto-collapse

const NEB_UPGS = [
    null,
    {
        name: "Dust Condenser",
        desc: "Multiplies Nebula Dust gained on a Collapse.",
        max: 10, base: 2, mult: 4,
        eff(n) { return E(1.5).pow(n) },
        effDesc(x) { return format(x) + "x Dust" },
    },
    {
        name: "Nebular Flow",
        desc: "Dust speeds up every layer under the Nebula.",
        max: 12, base: 3, mult: 4,
        eff(n) { return E(1.25).pow(n) },
        effDesc(x) { return format(x) + "x Pre-Quantum Global Speed" },
    },
    {
        name: "Entropy Cloud",
        desc: "The cloud stores entropy between collapses.",
        max: 12, base: 3, mult: 4,
        eff(n) { return E(1.2).pow(n) },
        effDesc(x) { return format(x) + "x Entropy gain" },
    },
    {
        name: "Exotic Winds",
        desc: "Nebular winds carry Exotic Matter.",
        max: 10, base: 10, mult: 5,
        eff(n) { return E(1.3).pow(n) },
        effDesc(x) { return format(x) + "x Exotic Matter" },
    },
    {
        name: "Stellar Forge",
        desc: "Dust settles into Stardust.",
        max: 8, base: 25, mult: 6,
        eff(n) { return E(2).pow(n) },
        effDesc(x) { return format(x) + "x Stardust" },
    },
    {
        name: "Quantum Mist",
        desc: "Galaxies spin faster inside the cloud.",
        max: 10, base: 10, mult: 5,
        eff(n) { return E(1.5).pow(n) },
        effDesc(x) { return format(x) + "x Galactic Quarks" },
    },
    {
        name: "Elemental Dust",
        desc: "Makes every Element cheaper.",
        max: 10, base: 15, mult: 5,
        eff(n) { return E(0.97).pow(n) },
        effDesc(x) { return "×" + format(x, 3) + " Element costs" },
    },
    {
        name: "Supernova Bloom",
        desc: "Ignites Neutron Stars in the dust.",
        max: 10, base: 5, mult: 4,
        eff(n) { return E(1.4).pow(n) },
        effDesc(x) { return format(x) + "x Neutron Stars" },
    },
    {
        name: "Dust Recursion",
        desc: "Exponentiates Nebula Dust gain.",
        max: 4, base: 2500, mult: 12,
        eff(n) { return E(1).add(E(n).mul(0.05)) },
        effDesc(x) { return "^" + format(x, 2) + " Dust" },
    },
    {
        name: "Nebula Automator",
        desc: "Automatically buys every Nebula upgrade it can afford.",
        max: 1, base: 5000, mult: 1,
        eff() { return E(1) },
        effDesc() { return "Auto-Buy enabled" },
    },
    {
        name: "Collapse Automator",
        desc: "Automatically collapses once you hold twice the Cluster requirement.",
        max: 1, base: 20000, mult: 1,
        eff() { return E(1) },
        effDesc() { return "Auto-Collapse enabled" },
    },
    {
        name: "Nebular Harmony",
        desc: "Harmonises the layer: multiplies every Nebula effect at once.",
        max: 8, base: 250, mult: 6,
        eff(n) { return E(1.15).pow(n) },
        effDesc(x) { return format(x) + "x Harmony" },
    },
];

const NEB_MILESTONES = [
    { times: 1, dust: 0, name: "First Dust", reward: "Unlock Element Tier 5 and the Nebula tree branch, ×2 Dust" },
    { times: 0, dust: 25, name: "Dust Gathering", reward: "×1.5 Pre-Quantum Global Speed" },
    { times: 2, dust: 0, name: "Nebular Habit", reward: "×2 Exotic Matter gain" },
    { times: 0, dust: 500, name: "Dust Storm", reward: "×2 Nebula Dust" },
    { times: 3, dust: 0, name: "Cloudbreak", reward: "×2 Entropy gain, Stellar Mass is kept on Nebula resets" },
    { times: 0, dust: 1e4, name: "Accretion", reward: "×2.5 Nebula Dust, ×1.5 Stardust" },
    { times: 5, dust: 0, name: "Deep Nebula", reward: "×3 Nebula Dust, upgrades are 10% cheaper" },
    { times: 0, dust: 1e5, name: "Star Nursery", reward: "×2 Pre-Quantum Global Speed, ×2 Galactic Quarks" },
    { times: 8, dust: 0, name: "Nebula Engine", reward: "×4 Nebula Dust, unlock Nebula auto-collapse" },
    { times: 0, dust: 1e6, name: "Nebula Complete", reward: "×5 Nebula Dust, ×2 Harmony" },
];

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

const SUPERNOVA_NEBULA = {
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
    upgCost(i) {
        let def = NEB_UPGS[i];
        let c = E(def.base).mul(E(def.mult).pow(this.upgLvl(i)));
        if (this.milestoneReached(6)) c = c.mul(0.9);
        return c.floor().max(1);
    },
    upgEff(i) { return NEB_UPGS[i].eff(this.upgLvl(i)) },
    milestoneReached(i) { return !!this.state().milestones[i] },
    unlocked() { return !!this.state().unl },

    // ---- requirements & gain ----------------------------------------------
    reqStart() { return E(NEBULA_REQ_START) },
    req() {
        return E(NEBULA_REQ_BASE).pow(this.state().times).mul(this.reqStart()).floor().max(NEBULA_REQ_START);
    },
    canReset() { return !!this.state().unl && player.superCluster.gte(this.req()) },
    autoReq() { return this.req().mul(2) },

    harmony() {
        let x = this.upgEff(12).mul(this.milestoneReached(9) ? 2 : 1);
        if (player.exotic.times.gte(150)) x = x.mul(1.5);
        if (hasUpgrade('exotic', 30)) x = x.mul(1.25);
        if (player.exotic.times.gte(300)) x = x.mul(3);
        if (player.exotic.times.gte(500)) x = x.mul(2);
        if (hasUpgrade('exotic', 33)) x = x.mul(1.5);
        if (typeof nebElementMult === "function") x = x.mul(nebElementMult("harmony"));
        if (hasTree('neb12')) x = x.mul(treeEff('neb12'));
        if (hasTree('neb8')) x = x.mul(treeEff('neb8'));
        return x;
    },

    dustMult() {
        let x = E(1);
        x = x.mul(this.upgEff(1));
        if (this.milestoneReached(0)) x = x.mul(2);
        if (this.milestoneReached(3)) x = x.mul(2);
        if (this.milestoneReached(5)) x = x.mul(2.5);
        if (this.milestoneReached(6)) x = x.mul(3);
        if (this.milestoneReached(8)) x = x.mul(4);
        if (this.milestoneReached(9)) x = x.mul(5);
        if (player.exotic.times.gte(60)) x = x.mul(2);
        if (player.exotic.times.gte(300)) x = x.mul(3);
        if (hasUpgrade('exotic', 26)) x = x.mul(2);
        if (hasUpgrade('exotic', 32)) x = x.mul(2);
        if (player.exotic.times.gte(500)) x = x.mul(3);
        if (hasTree('neb13')) x = x.mul(treeEff('neb13'));
        if (hasTree('neb2')) x = x.mul(treeEff('neb2'));
        if (hasTree('neb11')) x = x.mul(treeEff('neb11'));
        if (hasTree('neb9')) x = x.mul(treeEff('neb9'));
        if (hasTree('neb12')) x = x.mul(treeEff('neb12'));
        if (typeof nebElementMult === "function") x = x.mul(nebElementMult("dust"));
        return x;
    },

    dustGain() {
        let s = this.state();
        if (!s.unl) return E(0);
        let start = this.reqStart();
        if (player.superCluster.lt(start)) return E(0);
        // deeper climbs pay more (linear in Clusters) and every collapse is worth
        // more than the last (exponential in collapse count)
        let depth = player.superCluster.sub(start).add(1);
        let x = E(NEBULA_DUST_BASE).pow(s.times).mul(depth);
        x = x.mul(this.dustMult()).pow(this.upgEff(9));
        return x.floor().max(1);
    },

    // ---- effects on the rest of the game ----------------------------------
    effects: {
        pqgs() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).log10().add(1).pow(0.5);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(2));
            if (SUPERNOVA_NEBULA.milestoneReached(1)) x = x.mul(1.5);
            if (SUPERNOVA_NEBULA.milestoneReached(7)) x = x.mul(2);
            if (hasUpgrade('exotic', 27)) x = x.mul(1.5);
            if (player.exotic.times.gte(150)) x = x.mul(2);
            if (hasTree('neb1')) x = x.mul(treeEff('neb1'));
            if (hasUpgrade('exotic', 35)) x = x.mul(2);
            if (hasTree('neb14')) x = x.mul(treeEff('neb14'));
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        entropy() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).log10().add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(3));
            if (SUPERNOVA_NEBULA.milestoneReached(4)) x = x.mul(2);
            if (hasUpgrade('exotic', 31)) x = x.mul(2);
            if (hasTree('neb6')) x = x.mul(treeEff('neb6'));
            if (hasUpgrade('exotic', 35)) x = x.mul(5);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        exotic() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.5).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(4));
            if (SUPERNOVA_NEBULA.milestoneReached(2)) x = x.mul(2);
            if (hasTree('neb3')) x = x.mul(treeEff('neb3'));
            if (hasUpgrade('exotic', 34)) x = x.mul(3);
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        stardust() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.4).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(5));
            if (SUPERNOVA_NEBULA.milestoneReached(5)) x = x.mul(1.5);
            if (hasTree('neb5')) x = x.mul(treeEff('neb5'));
            if (hasUpgrade('exotic', 33)) x = x.mul(2);
            if (hasTree('neb15')) x = x.mul(treeEff('neb15'));
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        galQk() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.4).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(6));
            if (SUPERNOVA_NEBULA.milestoneReached(7)) x = x.mul(2);
            if (hasTree('neb4')) x = x.mul(treeEff('neb4'));
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        stars() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = s.dust.add(1).pow(0.3).add(1);
            x = x.mul(SUPERNOVA_NEBULA.upgEff(8));
            if (hasTree('neb7')) x = x.mul(treeEff('neb7'));
            return x.mul(SUPERNOVA_NEBULA.harmony());
        },
        elemCost() {
            let s = SUPERNOVA_NEBULA.state();
            if (!s.unl) return E(1);
            let x = SUPERNOVA_NEBULA.upgEff(7).min(1);
            if (hasUpgrade('exotic', 34)) x = x.mul(0.95);
            if (hasTree('neb16')) x = x.mul(treeEff('neb16'));
            return x;
        },
    },

    // ---- unlock & milestones ----------------------------------------------
    checkUnlock() {
        let s = this.state();
        if (s.unl) return;
        if (hasTree("ax42") && player.mass.gte("eee100")) {
            s.unl = true;
            addNotify("Supernova Nebula unlocked — Clusters now collapse into Dust!", 6);
            tree_update = true;
        }
    },

    checkMilestones() {
        let s = this.state();
        for (let i = 0; i < NEB_MILESTONES.length; i++) {
            if (s.milestones[i]) continue;
            let m = NEB_MILESTONES[i];
            if (s.times.gte(m.times) && s.total.gte(m.dust)) {
                s.milestones[i] = true;
                addNotify("Nebula Milestone: " + m.name, 5);
            }
        }
    },

    // ---- tick --------------------------------------------------------------
    calc() {
        this.checkUnlock();
        let s = this.state();
        if (!s.unl) return;
        this.checkMilestones();
        if (s.autoBuy && this.upgLvl(10) >= 1) this.autoBuy();
        if (this.autoUnlocked() && (s.autoCollapse || this.upgLvl(11) >= 1) && player.superCluster.gte(this.autoReq())) {
            let now = Date.now();
            if (now - (this.lastAuto || 0) > 1000) {
                this.lastAuto = now;
                this.reset(true);
            }
        }
    },

    autoUnlocked() { return this.milestoneReached(NEBULA_AUTO_TIMES) || this.upgLvl(11) >= 1 },

    updateTemp() {
        let s = this.state();
        tmp.nebula.req = this.req();
        tmp.nebula.can = this.canReset();
        tmp.nebula.gain = this.dustGain();
        tmp.nebula.harmony = this.harmony();
        tmp.nebula.pqgs = this.effects.pqgs();
        tmp.nebula.entropy = this.effects.entropy();
        tmp.nebula.exotic = this.effects.exotic();
        tmp.nebula.stardust = this.effects.stardust();
        tmp.nebula.galQk = this.effects.galQk();
        tmp.nebula.stars = this.effects.stars();
        tmp.nebula.elemCost = this.effects.elemCost();
        tmp.nebula.dustMult = this.dustMult();
    },

    // ---- actions -----------------------------------------------------------
    buy(i, max = false) {
        let s = this.state();
        if (!NEB_UPGS[i] || !s.unl || this.upgMaxed(i)) return;
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
            save();
            updateNebulaTemp();
            updateNebulaHTML(true);
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
                    bought = true;
                    any = true;
                }
            }
            if (!bought) break;
        }
        if (any) updateNebulaTemp();
    },

    reset(force = false) {
        let s = this.state();
        if (!s.unl) return false;
        if (!force) {
            if (!this.canReset()) {
                addNotify("Not enough Supernova Clusters for a Nebula", 4);
                return false;
            }
            if (player.confirms.sg && !confirm("Reset for a Supernova Nebula?\n\nThis resets Supernova Clusters, Stardust, Stellar Mass and the Galaxy layer. Elements and Exotic Matter are kept.")) return false;
        }
        let gain = this.dustGain();
        s.dust = s.dust.add(gain);
        s.total = s.total.add(gain);
        s.best = s.best.max(gain);
        s.times = s.times.add(1);

        player.superCluster = E(0);
        let keptStardust = hasTree('neb10') ? player.stardust.mul(treeEff('neb10')) : E(0);
        if (!this.milestoneReached(4) && player.exotic.times.lt(60)) {
            player.stardust = keptStardust;
            player.stellar = E(0);
            player.stellar_gen = E(0);
        }
        player.galPow = [E(0), E(0), E(0), E(0), E(0), E(0), player.galPow[6]];
        SUPERNOVA_CLUSTER.reset(true);

        this.checkMilestones();
        updateNebulaTemp();
        updateNebulaHTML(true);
        save();
        addNotify("Nebula Collapse: +" + format(gain) + " Dust", 4);
        return true;
    },

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
};

// ---------------------------------------------------------------------------
// HTML (built once, then only the numbers change)
// ---------------------------------------------------------------------------

function setupNebulaHTML() {
    let upgs = new Element("nebUpgsTable");
    let table = "";
    for (let i = 1; i < NEB_UPGS.length; i++) {
        let def = NEB_UPGS[i];
        table += `<div class="neb_upg">
            <b>${def.name}</b> [<span id="nebUpgLvl${i}">0</span> / ${def.max}]<br>
            <span class="neb_sub">${def.desc}</span><br>
            Currently: <span id="nebUpgEff${i}">0</span><br>
            Cost: <span id="nebUpgCost${i}">0</span> Nebula Dust
            <div class="neb_btn_row">
                <button class="btn" id="nebUpgBtn${i}" onclick="nebBuy(${i}, false)">Buy</button>
                ${def.max > 1 ? `<button class="btn" id="nebUpgMaxBtn${i}" onclick="nebBuy(${i}, true)">Buy Max</button>` : ""}
            </div>
        </div>`;
    }
    upgs.setHTML(table);

    let miles = new Element("nebMilesTable");
    let table2 = "";
    for (let i = 0; i < NEB_MILESTONES.length; i++) {
        let m = NEB_MILESTONES[i];
        let req = [];
        if (m.times) req.push(format(m.times, 0) + " Nebula Collapses");
        if (m.dust) req.push(format(m.dust) + " total Dust earned");
        table2 += `<div class="neb_mile" id="nebMile${i}">
            <b>${m.name}</b><br>
            <span class="neb_sub">${req.join(" and ")}</span><br>
            <span class="neb_reward">${m.reward}</span>
        </div>`;
    }
    miles.setHTML(table2);
}

function updateNebulaTemp() {
    SUPERNOVA_NEBULA.updateTemp();
}

function updateNebulaHTML(force = false) {
    if (typeof SUPERNOVA_NEBULA === "undefined") return;
    let s = SUPERNOVA_NEBULA.state();
    if (!s.unl) return;

    let el = (id) => document.getElementById(id);
    let set = (id, val) => { let e = el(id); if (e) e.textContent = val; };
    let html = (id, val) => { let e = el(id); if (e && e.innerHTML !== val) e.innerHTML = val; };

    // ---- main ----
    set("nebDust", format(s.dust));
    set("nebGain", format(SUPERNOVA_NEBULA.dustGain()));
    set("nebDustMult", format(SUPERNOVA_NEBULA.dustMult()));
    set("nebReq", format(SUPERNOVA_NEBULA.req(), 0));
    set("nebSCCount", format(player.superCluster, 0));
    set("nebTimes", format(s.times, 0));
    set("nebBest", format(s.best));
    set("nebTotal", format(s.total));
    set("nebHarmony", format(SUPERNOVA_NEBULA.harmony()));
    let nextMile = "-";
    for (let i = 0; i < NEB_MILESTONES.length; i++) {
        if (s.milestones[i]) continue;
        let m = NEB_MILESTONES[i], parts = [];
        if (m.times) parts.push(format(m.times, 0) + "/" + format(s.times, 0) + " collapses");
        if (m.dust) parts.push(format(s.total) + "/" + format(m.dust) + " dust");
        nextMile = m.name + " — " + parts.join(", ");
        break;
    }
    set("nebNextMile", nextMile);
    set("nebDust2", format(s.dust));
    set("nebReady", SUPERNOVA_NEBULA.canReset() ? "Ready" : "Not yet");

    let btn = el("nebResetBtn");
    if (btn) btn.className = "btn" + (SUPERNOVA_NEBULA.canReset() ? "" : " locked");

    html("nebEff", `<b>Your ${format(player.superCluster, 0)} Supernova Clusters give you:</b><br>
        ${format(SUPERNOVA_NEBULA.effects.pqgs())}x Pre-Quantum Global Speed<br>
        ${format(SUPERNOVA_NEBULA.effects.entropy())}x Entropy gain<br>
        ${format(SUPERNOVA_NEBULA.effects.exotic())}x Exotic Matter<br>
        ${format(SUPERNOVA_NEBULA.effects.stardust())}x Stardust<br>
        ${format(SUPERNOVA_NEBULA.effects.galQk())}x Galactic Quark<br>
        ${format(SUPERNOVA_NEBULA.effects.stars())}x Neutron Star<br>
        Elements cost x${format(SUPERNOVA_NEBULA.effects.elemCost(), 3)}<br>
        Harmony: ${format(SUPERNOVA_NEBULA.harmony())}x (multiplies all of the above)`);

    let ab = el("nebAutoBuyBtn");
    if (ab) {
        ab.textContent = s.autoBuy ? "ON" : "OFF";
        ab.className = "btn" + (s.autoBuy ? " neb_on" : "") + (SUPERNOVA_NEBULA.upgLvl(10) < 1 ? " locked" : "");
    }
    let ac = el("nebAutoCollapseBtn");
    if (ac) {
        ac.textContent = s.autoCollapse ? "ON" : "OFF";
        ac.className = "btn" + (s.autoCollapse ? " neb_on" : "") + (SUPERNOVA_NEBULA.autoUnlocked() ? "" : " locked");
    }

    // ---- upgrades ----
    for (let i = 1; i < NEB_UPGS.length; i++) {
        let def = NEB_UPGS[i];
        let lvl = SUPERNOVA_NEBULA.upgLvl(i);
        let maxed = SUPERNOVA_NEBULA.upgMaxed(i);
        set("nebUpgLvl" + i, lvl);
        set("nebUpgEff" + i, def.effDesc(def.eff(lvl)));
        set("nebUpgCost" + i, maxed ? "MAX" : format(SUPERNOVA_NEBULA.upgCost(i)));
        let can = !maxed && s.dust.gte(SUPERNOVA_NEBULA.upgCost(i));
        let b1 = el("nebUpgBtn" + i);
        let bm = el("nebUpgMaxBtn" + i);
        if (b1) { b1.textContent = maxed ? "Maxed" : "Buy"; b1.className = "btn" + (can ? "" : " locked"); }
        if (bm) bm.className = "btn" + (can ? "" : " locked");
    }

    // ---- milestones ----
    for (let i = 0; i < NEB_MILESTONES.length; i++) {
        let e = el("nebMile" + i);
        if (e) e.className = "neb_mile" + (SUPERNOVA_NEBULA.milestoneReached(i) ? " neb_mile_done" : "");
    }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
function nebReset() { SUPERNOVA_NEBULA.reset(false); }
function nebBuy(i, max) { SUPERNOVA_NEBULA.buy(i, !!max); }
function nebToggleAutoBuy() { SUPERNOVA_NEBULA.state().autoBuy = !SUPERNOVA_NEBULA.state().autoBuy; save(); updateNebulaHTML(true); }
function nebToggleAutoCollapse() { SUPERNOVA_NEBULA.state().autoCollapse = !SUPERNOVA_NEBULA.state().autoCollapse; save(); updateNebulaHTML(true); }

function calcNebula() {
    SUPERNOVA_NEBULA.calc();
}

// ---------------------------------------------------------------------------
// Stats-tab section
// ---------------------------------------------------------------------------
function buildSection9Nebula() {
    if (!player.nebula || !player.nebula.unl) return "";
    let s = SUPERNOVA_NEBULA.state();
    let rows = [
        sRow("Nebula Dust", format(s.dust) + ` <span class="stats_subnote">+${format(SUPERNOVA_NEBULA.dustGain())} on Collapse</span>`),
        sRow("Nebula Collapses", format(s.times, 0)),
        sRow("Total Dust Earned", format(s.total)),
        sRow("Best Collapse", format(s.best)),
        sRow("Supernova Clusters", format(player.superCluster, 0) + " / " + format(SUPERNOVA_NEBULA.req(), 0)),
        sRow("Harmony", format(SUPERNOVA_NEBULA.harmony()) + "x"),
        sRow("Pre-Quantum Global Speed", format(SUPERNOVA_NEBULA.effects.pqgs()) + "x"),
        sRow("Entropy Gain", format(SUPERNOVA_NEBULA.effects.entropy()) + "x"),
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
