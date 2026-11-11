const STATS_STATE = {
    showLocked: true,
    query: "",
    collapsed: {},
    lastSummaryHTML: "",
    lastSectionHTML: {},
    lastFilterCount: "",
};

const STATS_SECTIONS = [
    { id: 0, tab: 0, title: "Main", desc: "Mass, Ranks, Prestiges, Ascensions, Black Hole, Atomic Generator, Stars, Blueprint Particles, Eternal & Stellar" },
    { id: 1, tab: 1, title: "Rewards & Scaling", desc: "Rank, Prestige & Ascension Rewards and Super / Hyper / Ultra / Meta / Exotic Scalings" },
    { id: 2, tab: 2, title: "Upgrades", desc: "Rage, Black Hole, Atom, Big Rip, Infinity & Exotic Main Upgrades" },
    { id: 3, tab: 3, title: "Challenges", desc: "Pre-Quantum Challenges 1–24, Quantum Challenge & Galactic Challenge" },
    { id: 4, tab: 4, title: "Atom", desc: "Atoms, Quarks, Particles, G-Particles, Elements, Mass Dilation & Break Dilation" },
    { id: 5, tab: 5, title: "Supernova", desc: "Supernova, Neutron Tree, Bosons, Fermions, Radiation, Galaxy, G-Fermions & Cluster" },
    { id: 6, tab: 6, title: "Quantum", desc: "Quantum Foam, Chroma, Milestones, Auto-Quantum, Primordium, Entropy & Big Rip" },
    { id: 7, tab: 7, title: "Exotic", desc: "Exotic Matter, Milestones, RC Boosters, Exotic Boosts, Darkness, Dark Run, Matters & Axions" },
    { id: 8, tab: 9, title: "Options & Misc", desc: "Session Time, Offline Progress, Display Preferences, Confirmations & Automators" },
];

function sSafe(fn, fallback = E(0)) {
    try {
        let v = fn();
        return (v === undefined || v === null) ? fallback : v;
    } catch (e) {
        return fallback;
    }
}

function sIsValidDec(x) {
    if (x === undefined || x === null) return false;
    let d = E(x);
    return !Number.isNaN(d.mag) && !Number.isNaN(d.layer) && !Number.isNaN(d.sign);
}

function sFormat(x, acc = 4) {
    if (x === Infinity) return "Infinity";
    if (!sIsValidDec(x)) return "0";
    let d = E(x);
    if (d.mag === Infinity) return (d.sign < 0 ? "-" : "") + "Infinity";
    return format(d, acc);
}

function sMass(x) {
    if (!sIsValidDec(x)) return "0.0000 u";
    let d = E(x);
    if (d.mag === Infinity) return "Infinity";
    if (d.lte(0) && player.mass_display == 3) return "0.0000 mlt";
    return formatMass(d);
}

function sGain(amt, gain, isMass = false) {
    if (!sIsValidDec(gain)) return isMass ? "(+0.0000 u/sec)" : "(+0/sec)";
    let g = E(gain);
    if (g.lte(0)) return isMass ? "(+0 g/sec)" : "(+0/sec)";
    if (!sIsValidDec(amt) || E(amt).lte(0)) {
        return "(+" + (isMass ? sMass(g) : sFormat(g)) + "/sec)";
    }
    return formatGain(E(amt), g, isMass);
}

function sMult(x, acc = 4) {
    if (!sIsValidDec(x)) return "×1";
    let d = E(x);
    if (d.lte(0)) return "×0";
    return formatMult(d, acc);
}

function sRed(x) {
    if (!sIsValidDec(x)) return "0%";
    return formatReduction(E(x));
}

function sBadge(text, cls = "") {
    return `<span class="stats_badge ${cls}">${text}</span>`;
}

function sEsc(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function sRow(label, value, opts = {}) {
    let locked = opts.locked === true;
    if (locked && !STATS_STATE.showLocked) return null;
    let q = STATS_STATE.query.trim().toLowerCase();
    let labelStr = String(label);
    let valStr = String(value);
    if (q) {
        let plainVal = valStr.replace(/<[^>]*>/g, " ");
        let extra = opts.tags ? " " + opts.tags : "";
        let hay = (labelStr + " " + plainVal + extra).toLowerCase();
        if (!hay.includes(q)) return null;
    }
    let badge = locked ? " " + sBadge("Locked", "locked") : (opts.badge ? " " + opts.badge : "");
    return `<div class="stats_row${locked ? " locked_row" : ""}">
        <div class="stats_label">${labelStr}${badge}</div>
        <div class="stats_val">${valStr}</div>
    </div>`;
}

function sCard(title, rows, opts = {}) {
    let locked = opts.locked === true;
    if (locked && !STATS_STATE.showLocked) return "";
    let q = STATS_STATE.query.trim().toLowerCase();
    let filtered = rows.filter(r => r !== null && r !== "");
    if (q && filtered.length === 0) {
        if (!String(title).toLowerCase().includes(q)) return "";
    }
    if (filtered.length === 0) return "";
    let rightMeta = opts.meta || (locked ? sBadge("Locked", "locked") : (opts.unlockedBadge ? sBadge("Unlocked", "unlocked") : ""));
    return `<div class="stats_card${locked ? " locked_card" : ""}">
        <div class="stats_card_title"><span>${title}</span><span>${rightMeta}</span></div>
        ${filtered.join("")}
    </div>`;
}

function isStatsTabUnlocked(tabIdx) {
    if (tabIdx === 9 || tabIdx === 0 || tabIdx === 1 || tabIdx === 8) return true;
    let t = TABS[1][tabIdx];
    return t ? (t.unl ? !!t.unl() : true) : false;
}

function toggleAllStatsShowLocked() {
    STATS_STATE.showLocked = !STATS_STATE.showLocked;
    let btn = document.getElementById("all_stats_locked_btn");
    if (btn) btn.textContent = "Show Locked Stats: " + (STATS_STATE.showLocked ? "ON" : "OFF");
    updateAllStatsHTML(true);
}

function setAllStatsFilter(val) {
    STATS_STATE.query = val || "";
    updateAllStatsHTML(true);
}

function clearAllStatsFilter() {
    STATS_STATE.query = "";
    let inp = document.getElementById("all_stats_search");
    if (inp) inp.value = "";
    updateAllStatsHTML(true);
}

function toggleAllStatsSection(secIdx) {
    if ((tmp.stab[8] || 0) !== 0) return;
    STATS_STATE.collapsed[secIdx] = !STATS_STATE.collapsed[secIdx];
    updateAllStatsHTML(true);
}

function setAllStatsCollapsed(collapsed) {
    for (let i = 0; i < STATS_SECTIONS.length; i++) STATS_STATE.collapsed[i] = collapsed;
    updateAllStatsHTML(true);
}

function jumpToStatsTargetTab(tabIdx, event) {
    if (event) event.stopPropagation();
    if (!isStatsTabUnlocked(tabIdx)) return;
    TABS.choose(tabIdx);
}

function setupAllStatsHTML() {
    let root = document.getElementById("tab_frame8");
    if (!root) return;

    let html = `<div class="stats_container">
        <div id="all_stats_controls" class="stats_controls">
            <button id="all_stats_locked_btn" class="btn stats_btn_sm" onclick="toggleAllStatsShowLocked()">Show Locked Stats: ON</button>
            <button class="btn stats_btn_sm" onclick="setAllStatsCollapsed(false)">Expand All</button>
            <button class="btn stats_btn_sm" onclick="setAllStatsCollapsed(true)">Collapse All</button>
            <input id="all_stats_search" class="stats_search" type="text" placeholder="Filter stats (e.g. tickspeed, quark, softcap)..." oninput="setAllStatsFilter(this.value)">
            <button class="btn stats_btn_sm" onclick="clearAllStatsFilter()">Clear</button>
            <span id="all_stats_filter_count" class="stats_filter_count"></span>
        </div>
        <div id="all_stats_summary" class="stats_summary"></div>`;

    for (let i = 0; i < STATS_SECTIONS.length; i++) {
        let s = STATS_SECTIONS[i];
        html += `<div id="all_stats_sec_${i}" class="stats_section stats_sec_${i}">
            <div class="stats_sec_header" onclick="toggleAllStatsSection(${i})">
                <div class="stats_sec_title">
                    <span id="all_stats_caret_${i}">▼</span>
                    <span>${s.title}</span>
                    <span id="all_stats_badge_${i}"></span>
                    <span style="font-size: 11px; font-weight: normal; color: #aaa;">${s.desc}</span>
                </div>
                <div class="stats_sec_actions">
                    <button id="all_stats_jump_${i}" class="btn stats_btn_sm" onclick="jumpToStatsTargetTab(${s.tab}, event)">Open Tab</button>
                </div>
            </div>
            <div id="all_stats_body_${i}" class="stats_sec_body"></div>
        </div>`;
    }
    html += `<div id="all_stats_sandbox" style="display: none;"></div></div>`;
    root.innerHTML = html;
}

function buildAllStatsSummary() {
    let gs = sSafe(() => tmp.preQUGlobalSpeed, E(1));
    let unlTabs = 0;
    for (let i = 0; i < TABS[1].length; i++) if (isStatsTabUnlocked(i)) unlTabs++;

    let modes = [];
    if (player.chal.active > 0) modes.push("C" + player.chal.active);
    if (player.qu.qc.active) modes.push("QC");
    if (player.qu.rip.active) modes.push("Big Rip");
    if (player.gc.active) modes.push("GC D" + player.gc.depth);
    if (player.exotic.dark_run.active) modes.push("Dark Run");
    if (player.md.active) modes.push("Mass Dilation");
    if (player.supernova.fermions.choosed) modes.push("Fermion " + player.supernova.fermions.choosed);
    let modeStr = modes.length ? modes.join(", ") : "Normal";

    let highRank = `Rank ${sFormat(player.ranks.rank, 0)} / Tier ${sFormat(player.ranks.tier, 0)}`;
    if (player.ranks.enne.gte(100)) {
        let hbr = sSafe(() => getHighestBeyondRank(), 8);
        highRank = `${getRankTierName(hbr)} ${sFormat(beyondRankTier(hbr), 0)}`;
    } else if (player.ranks.enne.gte(1)) {
        highRank = `Enne ${sFormat(player.ranks.enne, 0)}`;
    } else if (player.ranks.oct.gte(1)) {
        highRank = `Oct ${sFormat(player.ranks.oct, 0)}`;
    } else if (player.ranks.hept.gte(1)) {
        highRank = `Hept ${sFormat(player.ranks.hept, 0)}`;
    } else if (player.ranks.hex.gte(1)) {
        highRank = `Hex ${sFormat(player.ranks.hex, 0)}`;
    } else if (player.ranks.pent.gte(1)) {
        highRank = `Pent ${sFormat(player.ranks.pent, 0)}`;
    }

    let kpis = [
        ["Time Played", formatTime(player.time)],
        ["Current Mass", `${sMass(player.mass)}<span class="stats_subnote">${sGain(player.mass, sSafe(() => tmp.massGain, E(0)).mul(gs), true)}</span>`],
        ["Pre-QU Global Speed", sMult(gs)],
        ["Unlocked Tabs", `${unlTabs} / ${TABS[1].length}`],
        ["Highest Rank Tier", highRank],
        ["Supernovas / SG / SC", `${sFormat(player.supernova.times, 0)} / ${sFormat(player.superGal, 0)} / ${sFormat(player.superCluster, 0)}`],
        ["Qu / Inf / Et / Exotic", `${sFormat(player.qu.times, 0)} / ${sFormat(player.inf.times, 0)} / ${sFormat(player.et.times, 0)} / ${sFormat(player.exotic.times, 0)}`],
        ["Active Modes", modeStr],
    ];

    return kpis.map(([l, v]) => `<div class="stats_kpi"><div class="stats_kpi_label">${l}</div><div class="stats_kpi_val">${v}</div></div>`).join("");
}

function buildSection0Main() {
    let gs = sSafe(() => tmp.preQUGlobalSpeed, E(1));
    let cards = [];

    // 1. Core Resources & Speeds
    let coreRows = [
        sRow("Mass", `${sMass(player.mass)} <span class="stats_subnote">${sGain(player.mass, sSafe(() => tmp.massGain, E(0)).mul(gs), true)}</span>`),
        sRow("Raw Mass Gain (before Speed)", sMass(sSafe(() => tmp.massGain, E(0))) + "/sec"),
        sRow("Pre-Quantum Global Speed", sMult(gs)),
        sRow("Rage Power", `${sFormat(player.rp.points, 0)} <span class="stats_subnote">${player.mainUpg.bh.includes(6) || player.mainUpg.atom.includes(6) ? sGain(player.rp.points, sSafe(() => tmp.rp.gain, E(0)).mul(gs)) : "(+" + sFormat(sSafe(() => tmp.rp.gain, E(0)), 0) + " on reset)"}</span>`, { locked: !player.rp.unl }),
        sRow("Dark Matter", `${sFormat(player.bh.dm, 0)} <span class="stats_subnote">${player.mainUpg.atom.includes(6) ? sGain(player.bh.dm, sSafe(() => tmp.bh.dm_gain, E(0)).mul(gs)) : "(+" + sFormat(sSafe(() => tmp.bh.dm_gain, E(0)), 0) + " on reset)"}</span>`, { locked: !FORMS.bh.see() }),
        sRow("Black Hole Mass", `${sMass(player.bh.mass)} <span class="stats_subnote">${sGain(player.bh.mass, player.bh.unl ? sSafe(() => tmp.bh.mass_gain, E(0)).mul(gs) : E(0), true)}</span>`, { locked: !player.bh.unl }),
        sRow("Atoms", `${sFormat(player.atom.points, 0)} <span class="stats_subnote">${hasElement(24) ? sGain(player.atom.points, sSafe(() => tmp.atom.gain, E(0)).mul(gs)) : "(+" + sFormat(sSafe(() => tmp.atom.gain, E(0)), 0) + " on reset)"}</span>`, { locked: !player.atom.unl }),
        sRow("Quarks", `${sFormat(player.atom.quarks, 0)} <span class="stats_subnote">${hasElement(14) ? sGain(player.atom.quarks, sSafe(() => tmp.atom.quarkGain.mul(tmp.atom.quarkGainSec).mul(gs), E(0))) : "(+" + sFormat(sSafe(() => tmp.atom.quarkGain, E(0)), 0) + " on atom reset)"}</span>`, { locked: !player.atom.unl }),
        sRow("Collapsed Stars", `${sFormat(player.stars.points, 2)} <span class="stats_subnote">${sGain(player.stars.points, sSafe(() => tmp.stars.gain, E(0)).mul(gs))}</span>`, { locked: !STARS.unlocked() }),
    ];
    cards.push(sCard("Core Resources & Speeds", coreRows));

    // 2. Mass Softcaps, Overflows & Collapse
    let softGains = [tmp.massSoftGain, tmp.massSoftGain2, tmp.massSoftGain3, tmp.massSoftGain4, tmp.massSoftGain5, tmp.massSoftGain6, tmp.massSoftGain7, tmp.massSoftGain8, tmp.massSoftGain9];
    let softPows = [tmp.massSoftPower, tmp.massSoftPower2, tmp.massSoftPower3, tmp.massSoftPower4, tmp.massSoftPower5, tmp.massSoftPower6, tmp.massSoftPower7, tmp.massSoftPower8, tmp.massSoftPower9];
    let hexRemoved = [1, 4, 8, 13, 21, 33, 54, 64, 75];
    let softRows = [];
    for (let i = 0; i < 9; i++) {
        let sg = softGains[i] || EINF;
        let sp = softPows[i] || E(1);
        let removed = player.ranks.hex.gte(hexRemoved[i]);
        let active = !removed && sSafe(() => tmp.massGain, E(0)).gte(sg);
        let status = removed ? sBadge("Removed (Hex " + hexRemoved[i] + ")", "unlocked") : active ? sBadge("Active", "active") : sBadge("Inactive", "locked");
        softRows.push(sRow(`Mass Softcap ^${i + 1}`, `Start: ${sMass(sg)} | Power: ^${sFormat(sp)}`, { badge: status }));
    }
    let mOverStart = sSafe(() => tmp.massOverflowStart, E("ee84"));
    let mOverPow = sSafe(() => tmp.massOverflowPower, E(0.8));
    let mOverRemoved = hasUpgrade("exotic", 1);
    let mOverActive = !mOverRemoved && sSafe(() => tmp.massGain, E(0)).gte(mOverStart);
    softRows.push(sRow("Mass Overflow",
        `Start: ${sMass(mOverStart)} | Power: ^${sFormat(mOverPow)}` +
        (mOverActive && sIsValidDec(tmp.massOverflow) ? `<span class="stats_subnote">Current effect: ^${sFormat(tmp.massOverflow)}</span>` : ""),
        { badge: mOverRemoved ? sBadge("Removed (exotic1)", "unlocked") : mOverActive ? sBadge("Active", "active") : sBadge("Inactive", "locked") }
    ));
    let sOverStart = sSafe(() => tmp.strongerOverflowStart, E("e4e6"));
    let sOverPow = sSafe(() => tmp.strongerOverflowPower, 0.5);
    let sOverActive = sIsValidDec(tmp.strongerOverflow) && E(tmp.strongerOverflow).lt(1);
    softRows.push(sRow("Stronger Overflow",
        `Start: ${sFormat(sOverStart)} | Power: ^${sFormat(sOverPow)}` +
        (sOverActive ? `<span class="stats_subnote">Current effect: ^${sFormat(tmp.strongerOverflow)}</span>` : ""),
        { badge: sOverActive ? sBadge("Active", "active") : sBadge("Inactive", "locked") }
    ));
    let rcVal = sSafe(() => tmp.rankCollapse, E(1));
    softRows.push(sRow("Rank Collapse", `${sFormat(rcVal)}x`, { badge: rcVal.gt(1) ? sBadge("Active", "active") : sBadge("Inactive", "locked") }));
    cards.push(sCard("Mass Softcaps, Overflows & Collapse", softRows));

    // 3. Ranks & Beyond Ranks
    let rankRows = [];
    for (let x = 0; x < RANKS.names.length; x++) {
        let rn = RANKS.names[x];
        let unl = RANKS.unl[rn] ? RANKS.unl[rn]() : true;
        let sc = getScalingName(rn);
        let amt = player.ranks[rn] || E(0);
        let req = sSafe(() => tmp.ranks[rn].req, EINF);
        let bulk = sSafe(() => tmp.ranks[rn].bulk, E(0));
        let autoUnl = sSafe(() => RANKS.autoUnl[rn](), false);
        let autoStr = autoUnl ? (player.auto_ranks[rn] ? "Auto: ON" : "Auto: OFF") : "Auto: Locked";
        let reqText = x === 0 ? sMass(req) : `${RANKS.fullNames[x - 1]} ${sFormat(req, 0)}`;
        rankRows.push(sRow(`${RANKS.fullNames[x]}${sc ? " (" + sc.trim() + ")" : ""}`,
            `<b>${sFormat(amt, 0)}</b> | Bulk: ${sFormat(bulk, 0)}<span class="stats_subnote">Next: ${reqText} | ${autoStr}</span>`,
            { locked: !unl }
        ));
    }
    if (player.ranks.enne.gte(100)) {
        let hbr = sSafe(() => getHighestBeyondRank(), 8);
        rankRows.push(sRow("Highest Beyond Rank", `<b>${getRankTierName(hbr)} ${sFormat(beyondRankTier(hbr), 0)}</b> (Tier #${hbr})`));
        for (let i = Math.max(9, hbr - 1); i <= hbr + 1; i++) {
            rankRows.push(sRow(`Beyond Rank: ${getRankTierName(i)}`,
                `<b>${sFormat(beyondRankTier(i), 0)}</b><span class="stats_subnote">Next at ${getRankTierName(i - 1)} ${sFormat(getNextBeyondRank(i), 0)}${i > 9 ? " (Enne " + sFormat(getEnneforNextBeyondRank(i), 0) + ")" : ""}</span>`
            ));
        }
    }
    cards.push(sCard("Ranks & Beyond Ranks", rankRows));

    // 4. Prestiges & Prestige Resources
    let presUnl = hasUpgrade("br", 9) || player.prestiges.some(p => p.gt(0));
    let presRows = [
        sRow("Prestige Base", `${sFormat(sSafe(() => tmp.prestiges.baseMul, E(0)), 0)}<sup>${sFormat(sSafe(() => tmp.prestiges.baseExp, E(1)))}</sup> = ${sFormat(sSafe(() => tmp.prestiges.base, E(0)), 0)}`, { locked: !presUnl })
    ];
    for (let x = 0; x < PRES_LEN; x++) {
        let unl = PRESTIGES.unl[x] ? PRESTIGES.unl[x]() : true;
        let sc = getScalingName("prestige" + x);
        let p = player.prestiges[x] || E(0);
        let req = sSafe(() => tmp.prestiges.req[x], EINF);
        let bulk = sSafe(() => PRESTIGES.bulk(x), E(0));
        let noRes = PRESTIGES.noReset[x] ? PRESTIGES.noReset[x]() : false;
        let reqStr = x === 0 ? `${sFormat(req, 0)} Prestige Base` : `${PRESTIGES.fullNames[x - 1]} ${sFormat(req, 0)}`;
        presRows.push(sRow(`${PRESTIGES.fullNames[x]}${sc ? " (" + sc.trim() + ")" : ""}`,
            `<b>${sFormat(p, 0)}</b> | Bulk: ${sFormat(bulk, 0)}<span class="stats_subnote">Next: ${reqStr}${noRes ? " | Resets Nothing" : ""}</span>`,
            { locked: !presUnl || !unl }
        ));
    }
    presRows.push(sRow("Prestige Mass", `${sMass(player.prestigeMass)} <span class="stats_subnote">${sGain(player.prestigeMass, sSafe(() => tmp.prestigeMassGain, E(0)), true)} | Tetr scaling ${sRed(sSafe(() => prestigeMassEffect(), E(1)))} weaker</span>`, { locked: player.prestiges[1].lt(10) }));
    presRows.push(sRow("Prestige Rage Power", `${sFormat(player.prestigeRP, 0)} <span class="stats_subnote">${sGain(player.prestigeRP, sSafe(() => tmp.prestigeRPGain, E(0)))} | +${sFormat(sSafe(() => prestigeRPEffect(), E(0)))} Overpower Power</span>`, { locked: player.prestiges[2].lt(165) }));
    presRows.push(sRow("Prestige Black Hole", `${sMass(player.prestigeBH)} <span class="stats_subnote">${sGain(player.prestigeBH, sSafe(() => tmp.prestigeBHGain, E(0)), true)} | ${sFormat(sSafe(() => prestigeBHEffect(), E(1)))}x Prestige Mass</span>`, { locked: player.prestiges[3].lt(34) }));
    presRows.push(sRow("Prestige Dark Matter", `${sFormat(player.prestigeDM, 0)} <span class="stats_subnote">${sGain(player.prestigeDM, sSafe(() => tmp.prestigeDMGain, E(0)))} | 2nd BH Overflow ${sRed(sSafe(() => prestigeDMEffect(), E(1)))} weaker</span>`, { locked: player.prestiges[3].lt(37) }));
    cards.push(sCard("Prestiges & Prestige Resources", presRows, { locked: !presUnl }));

    // 5. Ascensions & Ascension Mass
    let asUnl = hasPrestige(3, 23) || hasAscension(0, 1);
    let asRows = [
        sRow("Ascension Base", `${sFormat(sSafe(() => tmp.ascensions.baseMul, E(0)), 0)}<sup>${sFormat(sSafe(() => tmp.ascensions.baseExp, E(1)))}</sup> = ${sFormat(sSafe(() => tmp.ascensions.base, E(0)), 0)}`, { locked: !asUnl })
    ];
    for (let x = 0; x < AS_LEN; x++) {
        let unl = ASCENSIONS.unl[x] ? ASCENSIONS.unl[x]() : true;
        let p = player.ascensions[x] || E(0);
        let req = sSafe(() => tmp.ascensions.req[x], EINF);
        let bulk = sSafe(() => ASCENSIONS.bulk(x), E(0));
        let noRes = ASCENSIONS.noReset[x] ? ASCENSIONS.noReset[x]() : false;
        let reqStr = x === 0 ? `${sFormat(req, 0)} Ascension Base` : `${ASCENSIONS.fullNames[x - 1]} ${sFormat(req, 0)}`;
        asRows.push(sRow(ASCENSIONS.fullNames[x],
            `<b>${sFormat(p, 0)}</b> | Bulk: ${sFormat(bulk, 0)}<span class="stats_subnote">Next: ${reqStr}${noRes ? " | Resets Nothing" : ""}</span>`,
            { locked: !asUnl || !unl }
        ));
    }
    asRows.push(sRow("Ascension Mass", `${sMass(player.ascensionMass)} <span class="stats_subnote">${sGain(player.ascensionMass, sSafe(() => tmp.ascensionMassGain, E(0)), true)} | +${sFormat(sSafe(() => ascensionMassEffect(), E(0)))} Prestige Base Exp</span>`, { locked: player.ascensions[1].lt(3) }));
    cards.push(sCard("Ascensions & Ascension Mass", asRows, { locked: !asUnl }));

    // 6. Mass Upgrades, Tickspeed, Accelerator & Prestige/Ascension Buyables
    let upgRows = [];
    for (let x = 1; x <= UPGS.mass.cols; x++) {
        let u = UPGS.mass[x];
        let tu = tmp.upgs.mass[x] || {};
        let lvl = player.massUpg[x] || E(0);
        let bonus = tu.bonus || E(0);
        let sc = x === 4 ? getScalingName("massUpg4", x) : getScalingName("massUpg", x);
        let autoStr = player.mainUpg.rp.includes(3) ? (player.autoMassUpg[x] ? "ON" : "OFF") : "Locked";
        upgRows.push(sRow(`${u.title}${sc ? " (" + sc.trim() + ")" : ""}`,
            `Lvl <b>${sFormat(lvl, 0)}</b>${bonus.gt(0) ? (hasAscension(2, 1) ? " × " : " + ") + sFormat(bonus, 0) : ""} | Cost: ${sMass(tu.cost)}<span class="stats_subnote">Power: ${tu.effDesc ? tu.effDesc.step : "-"} | Effect: ${tu.effDesc ? tu.effDesc.eff : "-"} | Auto: ${autoStr}</span>`,
            { locked: !u.unl() }
        ));
    }
    let teff = tmp.tickspeedEffect || { step: E(1.5), eff: E(1), bonus: E(0), ss: E(1e50), eff_bottom: E(1) };
    upgRows.push(sRow(`Tickspeed${getScalingName("tickspeed") ? " (" + getScalingName("tickspeed").trim() + ")" : ""}`,
        `Lvl <b>${sFormat(player.tickspeed, 0)}</b>${teff.bonus.gte(1) ? (hasAscension(2, 1) ? " × " : " + ") + sFormat(teff.bonus, 0) : ""} | Cost: ${sFormat(tmp.tickspeedCost, 0)} RP<span class="stats_subnote">Power: ${teff.step.gte(10) ? sFormat(teff.step) + "x" : sFormat(teff.step.sub(1).mul(100)) + "%"} (SS: ${sFormat(teff.ss)}) | Effect: ${hasElement(134) ? "^" : ""}${sFormat(teff.eff)}${hasElement(134) ? "" : "x"} | Auto: ${FORMS.tickspeed.autoUnl() ? (player.autoTickspeed ? "ON" : "OFF") : "Locked"}</span>`,
        { locked: !player.rp.unl }
    ));
    let aeff = tmp.accelEffect || { step: E(0.0004), eff: E(1), ss: E(100) };
    upgRows.push(sRow("Accelerator",
        `Lvl <b>${sFormat(player.accelerator, 0)}</b> | Cost: ${sFormat(tmp.accelCost, 0)} RP<span class="stats_subnote">Power: +^${sFormat(aeff.step)} | Effect: ^${sFormat(aeff.eff)} (SS: ${sFormat(aeff.ss)}) | Auto: ${player.autoAccel ? "ON" : "OFF"}</span>`,
        { locked: !hasElement(134) }
    ));
    for (let x = 1; x <= UPGS.prestigeMass.cols; x++) {
        let u = UPGS.prestigeMass[x];
        let tu = tmp.upgs.prestigeMass[x] || {};
        upgRows.push(sRow(u.title,
            `Lvl <b>${sFormat(player.prestigeMassUpg[x] || 0, 0)}</b> | Cost: ${sMass(tu.cost)} PM<span class="stats_subnote">Power: ${tu.effDesc ? tu.effDesc.step : "-"} | Effect: ${tu.effDesc ? tu.effDesc.eff : "-"} | Auto: ${player.autoprestigeMassUpg[x] ? "ON" : "OFF"}</span>`,
            { locked: !u.unl() }
        ));
    }
    let ptEff = tmp.prestigeTickspeedEffect || { step: E(1), eff: E(1), bonus: E(0) };
    upgRows.push(sRow("Prestige Tickspeed",
        `Lvl <b>${sFormat(player.prestigeTickspeed, 0)}</b> | Cost: ${sFormat(tmp.prestigeTickspeedCost, 0)} PRP<span class="stats_subnote">Power: ${sFormat(ptEff.step)}x | Effect: ${sFormat(ptEff.eff)}x | Auto: ${player.autoPrestigeTickspeed ? "ON" : "OFF"}</span>`,
        { locked: !hasPrestige(2, 165) }
    ));
    let pbEff = tmp.prestigeBHCEffect || { step: E(1), eff: E(1), bonus: E(0) };
    upgRows.push(sRow("Prestige BH Condenser",
        `Lvl <b>${sFormat(player.prestigeBHC, 0)}</b> | Cost: ${sFormat(tmp.prestigeBHCCost, 0)} PDM<span class="stats_subnote">Power: ${sFormat(pbEff.step)}x | Effect: ${sFormat(pbEff.eff)}x | Auto: ${player.autoPrestigeBHC ? "ON" : "OFF"}</span>`,
        { locked: !hasPrestige(3, 37) }
    ));
    for (let x = 1; x <= UPGS.ascensionMass.cols; x++) {
        let u = UPGS.ascensionMass[x];
        let tu = tmp.upgs.ascensionMass[x] || {};
        upgRows.push(sRow(u.title,
            `Lvl <b>${sFormat(player.ascensionMassUpg[x] || 0, 0)}</b> | Cost: ${sMass(tu.cost)} AM<span class="stats_subnote">Power: ${tu.effDesc ? tu.effDesc.step : "-"} | Effect: ${tu.effDesc ? tu.effDesc.eff : "-"} | Auto: ${player.autoascensionMassUpg[x] ? "ON" : "OFF"}</span>`,
            { locked: !u.unl() }
        ));
    }
    cards.push(sCard("Mass Buyables, Tickspeed & Accelerator", upgRows));

    // 7. Black Hole
    let bh = tmp.bh || {};
    let bhOverStart = sSafe(() => tmp.bhOverflowStart, E("e1e34"));
    let bhOverActive = sSafe(() => bh.mass_gain, E(0)).gte(bhOverStart);
    let bhRows = [
        sRow("Black Hole Mass", `${sMass(player.bh.mass)} <span class="stats_subnote">${sGain(player.bh.mass, player.bh.unl ? sSafe(() => bh.mass_gain, E(0)).mul(gs) : E(0), true)}</span>`),
        sRow("Black Hole Mass Effect", `${sFormat(bh.effect)}x to Mass gain`),
        sRow("BH Formula Power / f", `Power: ^${sFormat(bh.massPowerGain)} | f: ${sFormat(bh.f)}<span class="stats_subnote">f Softcap: ${hasUpgrade("bh", 17) ? "Removed" : sFormat(bh.fSoftStart) + " (^" + sFormat(bh.fSoftPower) + ")"}</span>`),
        sRow("BH Gain Softcap", `Start: ${sMass(bh.massSoftGain)} | Power: ^${sFormat(bh.massSoftPower)}`),
        sRow("BH Overflow", `Start: ${sMass(bhOverStart)}${bhOverActive && sIsValidDec(tmp.bhOverflow) ? ` | Effect: ^${sFormat(tmp.bhOverflow)}${hasElement(327) ? " (2nd)" : ""}` : ""}`, { badge: bhOverActive ? sBadge("Active", "active") : sBadge("Inactive", "locked") }),
        sRow(`BH Condenser${getScalingName("bh_condenser") ? " (" + getScalingName("bh_condenser").trim() + ")" : ""}`,
            `Lvl <b>${sFormat(player.bh.condenser, 0)}</b>${sSafe(() => bh.condenser_bonus, E(0)).gte(1) ? (hasAscension(0, 26) ? " × " + sFormat(bh.condenser_bonus.add(1), 0) : " + " + sFormat(bh.condenser_bonus, 0)) : ""} | Cost: ${sFormat(bh.condenser_cost, 0)} DM<span class="stats_subnote">Power: ${sFormat(sSafe(() => bh.condenser_eff.pow, E(1)))}x | Effect: ${sFormat(sSafe(() => bh.condenser_eff.eff, E(1)))}x | Auto: ${FORMS.bh.condenser.autoUnl() ? (player.bh.autoCondenser ? "ON" : "OFF") : "Locked"}</span>`
        ),
    ];
    cards.push(sCard("Black Hole", bhRows, { locked: !player.bh.unl }));

    // 8. Atomic Generator
    let atomOverActive = sSafe(() => tmp.atom.atomicGain, E(0)).gte("ee3000") && !hasUpgrade("atom", 24);
    let atomicRows = [
        sRow("Atomic Power", `${sFormat(player.atom.atomic)} <span class="stats_subnote">${sGain(player.atom.atomic, player.atom.unl ? sSafe(() => tmp.atom.atomicGain, E(0)).mul(gs) : E(0))}</span>`),
        sRow("Atomic Effect", `+${sFormat(sSafe(() => tmp.atom.atomicEff, E(0)), 0)} Free Tickspeeds${sSafe(() => tmp.atom.atomicEff, E(0)).gte(5e4) ? " " + sBadge("Softcapped", "active") : ""}`),
        sRow("Atomic Overflow", `${hasUpgrade("atom", 24) ? "Removed (atom24)" : atomOverActive && sIsValidDec(tmp.atomicOverflow) ? "^" + sFormat(tmp.atomicOverflow) : "Inactive (Starts e1e3000)"}`),
        sRow(`Cosmic Rays${getScalingName("gamma_ray") ? " (" + getScalingName("gamma_ray").trim() + ")" : ""}`,
            `Lvl <b>${sFormat(player.atom.gamma_ray, 0)}</b>${sSafe(() => tmp.atom.gamma_ray_bonus, E(0)).gte(1) ? (hasAscension(0, 26) ? " × " + sFormat(tmp.atom.gamma_ray_bonus.add(1), 0) : " + " + sFormat(tmp.atom.gamma_ray_bonus, 0)) : ""} | Cost: ${sFormat(sSafe(() => tmp.atom.gamma_ray_cost, E(1)), 0)} Atoms<span class="stats_subnote">Power: ${sFormat(sSafe(() => tmp.atom.gamma_ray_eff.pow, E(1)))}x | Effect: ${sFormat(sSafe(() => tmp.atom.gamma_ray_eff.eff, E(1)))}x | Auto: ${hasElement(18) ? (player.atom.auto_gr ? "ON" : "OFF") : "Locked"}</span>`
        ),
    ];
    cards.push(sCard("Atomic Generator", atomicRows, { locked: !player.atom.unl }));

    // 9. Stars
    let st = tmp.stars || {};
    let starOverActive = !hasUpgrade("exotic", 1) && sSafe(() => st.gain, E(0)).gte("ee43");
    let starEffStr = `${sFormat(st.effect)}x`;
    if (player.ranks.hex.gte(36)) starEffStr += `, ^${sFormat(st.effectPower)}`;
    if (hasElement(530)) starEffStr += `, exp ^${sFormat(st.effectExpPower, 5)}`;
    let starRows = [
        sRow("Collapsed Stars", `${sFormat(player.stars.points, 2)} / ${sFormat(sSafe(() => tmp.supernova.maxlimit, E(1e90)), 2)} <span class="stats_subnote">${sGain(player.stars.points, sSafe(() => st.gain, E(0)).mul(gs))}</span>`),
        sRow("Stars Effect", starEffStr),
        sRow("Star Softcap & Overflow", `Softcap: ${sFormat(st.softGain)} (^${sFormat(st.softPower)})<span class="stats_subnote">Overflow: ${hasUpgrade("exotic", 1) ? "Removed (exotic1)" : starOverActive && sIsValidDec(tmp.starOverflow) ? "^" + sFormat(tmp.starOverflow) : "Inactive (Starts ee43)"}</span>`),
        sRow("Star Generators Unlocked", `${player.stars.unls} / 5 (Next Req: ${player.stars.unls < 5 ? sFormat(st.generator_req) + " Quarks" : "All Unlocked"})`),
        sRow("Star Booster", `Lvl <b>${sFormat(player.stars.boost, 0)}</b> | Req: ${sFormat(st.generator_boost_req)} Quarks<span class="stats_subnote">Base: ${sFormat(st.generator_boost_base)}x | Effect: ${sFormat(st.generator_boost_eff)}x</span>`, { locked: !hasTree("s4") }),
    ];
    for (let x = 0; x < 5; x++) {
        starRows.push(sRow(`Star Generator #${x + 1}`,
            `${sFormat(player.stars.generators[x], 2)} <span class="stats_subnote">${sGain(player.stars.generators[x], sSafe(() => st.generators_gain[x], E(0)).mul(gs))}</span>`,
            { locked: player.stars.unls <= x }
        ));
    }
    cards.push(sCard("Stars", starRows, { locked: !STARS.unlocked() }));

    // 10. Indescribable Matter (Blueprint Particles & Cosmic Strings)
    let imRows = [
        sRow("Blueprint Particles", `${sFormat(player.qu.bp, 1)} <span class="stats_subnote">${sGain(player.qu.bp, sSafe(() => tmp.qu.bpGain, E(0)))}</span>`),
        sRow("BP Effect (to Global Speed)", `${sFormat(sSafe(() => tmp.qu.bpEff, E(1)))}x`),
        sRow(`Cosmic Strings${getScalingName("cosmic_str") ? " (" + getScalingName("cosmic_str").trim() + ")" : ""}`,
            `Lvl <b>${sFormat(player.qu.cosmic_str, 0)}</b> | Cost: ${sFormat(sSafe(() => tmp.qu.cosmic_str_cost, E(2)), 0)} QF<span class="stats_subnote">Power: ${sFormat(sSafe(() => tmp.qu.cosmic_str_eff.pow, E(2)))}x | Effect: ${sFormat(sSafe(() => tmp.qu.cosmic_str_eff.eff, E(1)))}x | Auto: ${hasElement(131) ? (player.qu.auto_cs ? "ON" : "OFF") : "Locked"}</span>`
        ),
    ];
    cards.push(sCard("Indescribable Matter", imRows, { locked: !quUnl() }));

    // 11. Eternal & Infinity
    let infUnl = player.inf.reached || player.exotic.times.gte(1);
    let etUnl = hasUpgrade("inf", 14) || player.et.times.gt(0);
    let shardEff = tmp.et && tmp.et.shard_gen_eff ? tmp.et.shard_gen_eff : { pow: E(2), eff: E(1) };
    let etRows = [
        sRow("Infinity Mass", `${sMass(player.inf.points)} <span class="stats_subnote">${hasUpgrade("inf", 11) ? sGain(player.inf.points, sSafe(() => tmp.inf.gain, E(0)), true) : "(+" + sMass(sSafe(() => tmp.inf.gain, E(0))) + " on reset)"}</span>`, { locked: !infUnl }),
        sRow("Infinity Times", `${sFormat(player.inf.times, 0)} <span class="stats_subnote">${hasUpgrade("inf", 11) ? sGain(player.inf.times, sSafe(() => tmp.inf.gainTimes, E(0))) : "(+" + sFormat(sSafe(() => tmp.inf.gainTimes, E(0)), 0) + " on reset)"}</span>`, { locked: !infUnl }),
        sRow("Eternal Mass", `${sMass(player.et.points)} <span class="stats_subnote">${hasElement(195) ? sGain(player.et.points, sSafe(() => tmp.et.gain, E(0)), true) : "(+" + sMass(sSafe(() => tmp.et.gain, E(0))) + " on reset)"}</span>`, { locked: !etUnl }),
        sRow("Eternity Times", `${sFormat(player.et.times, 0)} <span class="stats_subnote">${hasElement(195) ? sGain(player.et.times, sSafe(() => tmp.et.gainTimes, E(0))) : "(+" + sFormat(sSafe(() => tmp.et.gainTimes, E(0)), 0) + " on reset)"}</span>`, { locked: !etUnl }),
        sRow("Timeshards", `${sFormat(player.et.shards, 0)} <span class="stats_subnote">${sGain(player.et.shards, sSafe(() => tmp.et.shardsGain, E(0)))}</span>`, { locked: player.et.times.lte(0) }),
        sRow("Timeshards Effect", `^${sFormat(sSafe(() => calcShardsEffect(), E(1)))} to Pre-QU Global Speed`, { locked: player.et.times.lte(0) }),
        sRow(`Shard Generators${getScalingName("shard_gen") ? " (" + getScalingName("shard_gen").trim() + ")" : ""}`,
            `Lvl <b>${sFormat(player.et.shard_gen, 0)}</b> | Cost: ${sMass(sSafe(() => tmp.et.shard_gen_cost, E(0.002)))} EM<span class="stats_subnote">Power: ${sFormat(shardEff.pow)}x | Effect: ${sFormat(shardEff.eff)}x</span>`,
            { locked: player.et.times.lte(0) }
        ),
    ];
    cards.push(sCard("Infinity & Eternal", etRows, { locked: !infUnl && !etUnl }));

    // 12. Stellar
    let stlUnl = player.superCluster.gte(21);
    let stlGenCost = tmp.stellar && tmp.stellar.cost !== undefined ? tmp.stellar.cost : E(2).pow(player.stellar_gen.add(1)).mul(1e30);
    let stlGenEff = tmp.stellar && tmp.stellar.gen_eff !== undefined ? { pow: tmp.stellar.pow, eff: tmp.stellar.gen_eff } : SUPERNOVA_CLUSTER.stellar_gen.eff();
    let stlGain = tmp.stellar && tmp.stellar.gain !== undefined ? tmp.stellar.gain : SUPERNOVA_CLUSTER.stellarGain();
    let stlEff = tmp.stellar && tmp.stellar.eff !== undefined ? tmp.stellar.eff : SUPERNOVA_CLUSTER.stellarEff();
    let stlRows = [
        sRow("Stardust", `${sFormat(player.stardust)} <span class="stats_subnote">${sGain(player.stardust, sSafe(() => SUPERNOVA_CLUSTER.stardustGain(), E(0)))} | Super SG starts +${sFormat(sSafe(() => SUPERNOVA_CLUSTER.stardustEff(), E(0)))} later</span>`, { locked: player.superCluster.lt(14) }),
        sRow("Stellar Mass", `${sMass(player.stellar)} <span class="stats_subnote">${sGain(player.stellar, stlGain, true)}</span>`),
        sRow("Stellar Effect", `${sFormat(stlEff)}x to Galactic Quarks`),
        sRow("Stellar Generators", `Lvl <b>${sFormat(player.stellar_gen, 0)}</b> | Cost: ${sFormat(stlGenCost, 0)} Stardust<span class="stats_subnote">Power: ${sFormat(stlGenEff.pow)}x | Effect: ${sFormat(stlGenEff.eff)}x</span>`),
    ];
    cards.push(sCard("Stellar", stlRows, { locked: !stlUnl && player.superCluster.lt(14) }));

    return cards.join("");
}

function buildSection1RewardsScaling() {
    let cards = [];

    // 1. Rank Rewards Progress & Active Effects
    let rankRows = [];
    for (let x = 0; x < RANKS.names.length; x++) {
        let rn = RANKS.names[x];
        let unlTier = RANKS.unl[rn] ? RANKS.unl[rn]() : true;
        let keys = Object.keys(RANKS.desc[rn]);
        let unlockedCnt = 0;
        let nextKey = null;
        let effParts = [];
        for (let y = 0; y < keys.length; y++) {
            let k = keys[y];
            if (player.ranks[rn].gte(k)) {
                unlockedCnt++;
                if (RANKS.effect[rn][k] && RANKS.effDesc[rn][k]) {
                    let val = sSafe(() => RANKS.effDesc[rn][k](RANKS.effect[rn][k]()), "");
                    if (val) effParts.push(`${RANKS.fullNames[x]} ${k}: <b>${val}</b>`);
                }
            } else if (nextKey === null) {
                nextKey = k;
            }
        }
        let sub = nextKey !== null ? `Next at ${RANKS.fullNames[x]} ${sFormat(nextKey, 0)}` : "All rewards unlocked";
        if (effParts.length) sub += `<br>${effParts.join(" | ")}`;
        rankRows.push(sRow(RANKS.fullNames[x], `<b>${unlockedCnt} / ${keys.length}</b> rewards<span class="stats_subnote">${sub}</span>`, { locked: !unlTier }));
    }
    cards.push(sCard("Ranks Rewards Summary", rankRows));

    // 2. Prestige Rewards Progress & Active Effects
    let presUnl = hasUpgrade("br", 9) || player.prestiges.some(p => p.gt(0));
    let presRows = [];
    for (let x = 0; x < PRES_LEN; x++) {
        let unlTier = PRESTIGES.unl[x] ? PRESTIGES.unl[x]() : true;
        let keys = Object.keys(PRESTIGES.rewards[x]);
        let p = player.prestiges[x] || E(0);
        let unlockedCnt = 0;
        let nextKey = null;
        let effParts = [];
        for (let y = 0; y < keys.length; y++) {
            let k = keys[y];
            if (p.gte(k)) {
                unlockedCnt++;
                let rew = PRESTIGES.rewardEff[x][k];
                if (rew && tmp.prestiges.eff[x][k] !== undefined) {
                    let txt = sSafe(() => rew[1](tmp.prestiges.eff[x][k]), "");
                    if (txt) effParts.push(`${PRESTIGES.fullNames[x]} ${k}: <b>${txt}</b>`);
                }
            } else if (nextKey === null) {
                nextKey = k;
            }
        }
        let sub = nextKey !== null ? `Next at ${PRESTIGES.fullNames[x]} ${sFormat(nextKey, 0)}` : "All rewards unlocked";
        if (effParts.length) sub += `<br>${effParts.join(" | ")}`;
        presRows.push(sRow(PRESTIGES.fullNames[x], `<b>${unlockedCnt} / ${keys.length}</b> rewards<span class="stats_subnote">${sub}</span>`, { locked: !presUnl || !unlTier }));
    }
    cards.push(sCard("Prestige Rewards Summary", presRows, { locked: !presUnl }));

    // 3. Ascension Rewards Progress & Active Effects
    let asUnl = hasAscension(0, 1);
    let asRows = [];
    for (let x = 0; x < AS_LEN; x++) {
        let unlTier = ASCENSIONS.unl[x] ? ASCENSIONS.unl[x]() : true;
        let keys = Object.keys(ASCENSIONS.rewards[x]);
        let p = player.ascensions[x] || E(0);
        let unlockedCnt = 0;
        let nextKey = null;
        let effParts = [];
        for (let y = 0; y < keys.length; y++) {
            let k = keys[y];
            if (p.gte(k)) {
                unlockedCnt++;
                let rew = ASCENSIONS.rewardEff[x][k];
                if (rew && tmp.ascensions.eff[x][k] !== undefined) {
                    let txt = sSafe(() => rew[1](tmp.ascensions.eff[x][k]), "");
                    if (txt) effParts.push(`${ASCENSIONS.fullNames[x]} ${k}: <b>${txt}</b>`);
                }
            } else if (nextKey === null) {
                nextKey = k;
            }
        }
        let sub = nextKey !== null ? `Next at ${ASCENSIONS.fullNames[x]} ${sFormat(nextKey, 0)}` : "All rewards unlocked";
        if (effParts.length) sub += `<br>${effParts.join(" | ")}`;
        asRows.push(sRow(ASCENSIONS.fullNames[x], `<b>${unlockedCnt} / ${keys.length}</b> rewards<span class="stats_subnote">${sub}</span>`, { locked: !asUnl || !unlTier }));
    }
    cards.push(sCard("Ascension Rewards Summary", asRows, { locked: !asUnl }));

    // 4. Scaling Cards (one per SCALE_TYPE)
    let qc8List = tmp.scaling_qc8 && tmp.scaling_qc8.length ? tmp.scaling_qc8.map(k => NAME_FROM_RES[k] || k).join(", ") : "None";
    let overviewRows = [
        sRow("QC8 Scaling Resistant", qc8List, { locked: !QCs.active() && !hasTree("unl3") }),
    ];
    for (let x = 0; x < SCALE_TYPE.length; x++) {
        let type = SCALE_TYPE[x];
        let keys = Object.keys(SCALE_START[type]);
        let activeList = tmp.scaling && tmp.scaling[type] ? tmp.scaling[type] : [];
        overviewRows.push(sRow(`${FULL_SCALE_NAME[x]} Scaling`, `<b>${activeList.length} / ${keys.length}</b> active`, { badge: activeList.length > 0 ? sBadge("Active", "active") : sBadge("Inactive", "locked") }));
    }
    cards.push(sCard("Scaling Tier Overview", overviewRows));

    for (let x = 0; x < SCALE_TYPE.length; x++) {
        let type = SCALE_TYPE[x];
        let keys = Object.keys(SCALE_START[type]);
        let activeList = tmp.scaling && tmp.scaling[type] ? tmp.scaling[type] : [];
        let rows = [];
        for (let y = 0; y < keys.length; y++) {
            let k = keys[y];
            let isActive = activeList.includes(k);
            let start = sSafe(() => getScalingStart(type, k), SCALE_START[type][k]);
            let power = sSafe(() => getScalingPower(type, k), E(1));
            let curVal = E(0);
            if (k === "massUpg") {
                for (let m = 1; m <= 3; m++) curVal = curVal.max(E(player.massUpg[m] || 0));
            } else if (k === "massUpg4") {
                curVal = E(player.massUpg[4] || 0);
            } else if (k === "fTier") {
                for (let i = 0; i < 2; i++) for (let j = 0; j < 6; j++) curVal = curVal.max(player.supernova.fermions.tiers[i][j] || 0);
            } else if (k === "gfTier") {
                for (let i = 2; i < 4; i++) for (let j = 0; j < 6; j++) curVal = curVal.max(player.supernova.fermions.tiers[i][j] || 0);
            } else if (SCALING_RES[k]) {
                curVal = E(SCALING_RES[k]());
            }
            rows.push(sRow(NAME_FROM_RES[k] || k,
                `Start: <b>${sFormat(start, 0)}</b> | Power: <b>${sFormat(power.mul(100))}%</b><span class="stats_subnote">Current: ${sFormat(curVal, 0)}</span>`,
                { locked: !isActive, badge: isActive ? sBadge("Active", "active") : sBadge("Inactive", "locked") }
            ));
        }
        cards.push(sCard(`${FULL_SCALE_NAME[x]} Scaling Details`, rows, {
            locked: activeList.length === 0,
            meta: `${activeList.length} / ${keys.length} active`
        }));
    }

    return cards.join("");
}

function buildSection2Upgrades() {
    let cards = [];
    for (let x = 1; x <= UPGS.main.cols; x++) {
        let upg = UPGS.main[x];
        let id = UPGS.main.ids[x];
        let unl = upg.unl();
        let bought = player.mainUpg[id] || [];
        let unlCnt = 0;
        for (let y = 1; y <= upg.lens; y++) {
            if (!upg[y].unl || upg[y].unl()) unlCnt++;
        }
        let resText = x === 5 ? sMass(upg.getRes()) : sFormat(upg.getRes(), 0);
        let autoStr = upg.auto_unl && upg.auto_unl() ? (player.auto_mainUpg[id] ? "ON" : "OFF") : "Locked";

        let rows = [
            sRow("Currency Owned", `${resText} ${upg.res}`),
            sRow("Purchased / Unlocked / Total", `<b>${bought.length}</b> / ${unlCnt} / ${upg.lens}`),
            sRow("Auto-Buy", autoStr),
        ];

        for (let y = 1; y <= upg.lens; y++) {
            let u = upg[y];
            let uUnl = u.unl ? u.unl() : true;
            let hasBought = bought.includes(y);
            if (u.effDesc) {
                let effTxt = tmp.upgs.main[x] && tmp.upgs.main[x][y] ? tmp.upgs.main[x][y].effDesc : sSafe(() => u.effDesc(), "");
                let descShort = typeof u.desc === "function" ? u.desc() : u.desc;
                rows.push(sRow(`#${y}${descShort ? ": " + descShort : ""}`,
                    effTxt || "-",
                    {
                        locked: !uUnl && !hasBought,
                        badge: hasBought ? sBadge("Bought", "unlocked") : sBadge("Not Bought", "locked"),
                    }
                ));
            }
        }
        cards.push(sCard(upg.title, rows, {
            locked: !unl,
            meta: `${bought.length} / ${upg.lens}`
        }));
    }
    return cards.join("");
}

function buildSection3Challenges() {
    let cards = [];

    // 1. Active Status
    let totalComps = E(0);
    let unlChals = 0;
    for (let x = 1; x <= CHALS.cols; x++) {
        totalComps = totalComps.add(player.chal.comps[x] || 0);
        if (!CHALS[x].unl || CHALS[x].unl()) unlChals++;
    }
    let activeRows = [
        sRow("Challenges Unlocked", `${player.chal.unl ? unlChals : 0} / ${CHALS.cols}`),
        sRow("Total Challenge Completions", sFormat(totalComps, 0)),
        sRow("Active Pre-QU Challenge", player.chal.active ? `[C${player.chal.active}] ${CHALS[player.chal.active].title} (+${sFormat(tmp.chal.gain, 0)})` : "None"),
        sRow("Quantum Challenge", QCs.active() ? (player.exotic.dark_run.active ? "Forced (Dark Run)" : player.qu.rip.active ? "Forced (Big Rip)" : "Active") : "Inactive"),
        sRow("Galactic Challenge", player.gc.active ? `Active (Difficulty ${player.gc.depth})` : "Inactive", { locked: !hasElement(267) }),
    ];
    cards.push(sCard("Challenge Overview", activeRows, { locked: !player.chal.unl }));

    // 2. Challenges 1-12 & 13-24 split into two clean cards
    for (let group = 0; group < 2; group++) {
        let start = group === 0 ? 1 : 13;
        let end = group === 0 ? 12 : CHALS.cols;
        let rows = [];
        let groupUnl = false;
        for (let x = start; x <= end; x++) {
            let c = CHALS[x];
            let unl = player.chal.unl && (c.unl ? c.unl() : true);
            if (unl) groupUnl = true;
            let comp = player.chal.comps[x] || E(0);
            let maxC = tmp.chal && tmp.chal.max[x] ? tmp.chal.max[x] : c.max;
            let maxStr = maxC === Infinity || (E(maxC).mag === Infinity) ? "∞" : sFormat(maxC, 0);
            let goal = tmp.chal && tmp.chal.goal[x] ? tmp.chal.goal[x] : c.start;
            let effHtml = sSafe(() => c.effDesc(tmp.chal.eff[x]), "-");
            let scaleName = CHALS.getScaleName(x).trim();
            rows.push(sRow(`[C${x}] ${c.title}${scaleName ? " (" + scaleName + ")" : ""}`,
                `<b>${sFormat(comp, 0)} / ${maxStr}</b> | Goal: ${CHALS.getFormat(x)(goal)}${CHALS.getResName(x)}<span class="stats_subnote">Effect: ${effHtml}</span>`,
                {
                    locked: !unl,
                    badge: CHALS.inChal(x) ? sBadge("In Challenge", "active") : undefined,
                }
            ));
        }
        cards.push(sCard(`Challenges ${start}–${end}`, rows, { locked: !groupUnl }));
    }

    // 3. Quantum Challenge
    let qcUnl = hasTree("unl3");
    let qcMax = hasTree("qc4") ? Math.min(Math.max(Math.floor(player.qu.qc.shard / 8), 10), 50) : 10;
    let qcDelta = (tmp.qu.qc_s || 0) + (tmp.qu.qc_s_bouns || 0) - player.qu.qc.shard;
    let qcRows = [
        sRow("Quantum Shards", `<b>${sFormat(player.qu.qc.shard, 0)}</b>${qcDelta !== 0 ? ` (${qcDelta >= 0 ? "+" : ""}${qcDelta})` : ""}`),
        sRow("Shard Base & Effect", `Base: ${sFormat(sSafe(() => tmp.qu.qc_s_b, E(2)), 1)} | Effect: <b>${sFormat(sSafe(() => tmp.qu.qc_s_eff, E(1)), 1)}x</b> to Quantum Foam`),
        sRow("Active Modifier Total / Bonus", `${tmp.qu.qc_s || 0} (Bonus: +${tmp.qu.qc_s_bouns || 0})`),
        sRow("Saved Presets", `${player.qu.qc.presets.length} / 5`),
    ];
    for (let x = 0; x < QCs_len; x++) {
        let mod = QCs.getMod(x);
        let eff = tmp.qu.qc_eff[x] !== undefined ? tmp.qu.qc_eff[x] : QCs.ctn[x].eff(mod);
        qcRows.push(sRow(`[${x + 1}] ${QCs.names[x]}`,
            `<b>${mod} / ${qcMax}</b><span class="stats_subnote">${QCs.ctn[x].effDesc(eff)}</span>`
        ));
    }
    cards.push(sCard("Quantum Challenge", qcRows, { locked: !qcUnl }));

    // 4. Galactic Challenge
    let gcUnl = hasElement(267);
    let gcRows = [
        sRow("Galactic Shards", `<b>${sFormat(player.gc.shard, 0)}</b> (Pending: +${sFormat(sSafe(() => tmp.gc.shards, E(0)), 0)})`),
        sRow("Galactic Shard Effect", `^${sFormat(sSafe(() => tmp.gc.GSeffect, E(1)))} to Galactic Power`),
        sRow("Difficulty & Nerf", `Difficulty <b>${player.gc.depth} / ${tmp.gc.maxdiff || 10}</b> | Nerf: <b>${tmp.gc.nerf || 0}</b>`),
        sRow("Current Goal", `${sFormat(sSafe(() => GC.goal(), 1e6), 0)} Supernovas`),
        sRow("Trapped Challenges", `${player.gc.trap} / ${tmp.gc.maxtrap || 0}${player.gc.trap > 0 ? " (C1–C" + player.gc.trap + ")" : ""}`),
        sRow("Extra Modifiers", `U-Fermions: ${player.gc.trapu ? "ON" : "OFF"} | Big Rip: ${player.gc.rip ? "ON" : "OFF"} | No EB: ${player.gc.noeb ? "ON" : "OFF"} | No GP: ${player.gc.nogp ? "ON" : "OFF"}`),
    ];
    cards.push(sCard("Galactic Challenge", gcRows, { locked: !gcUnl }));

    return cards.join("");
}

function buildSection4Atom() {
    let gs = sSafe(() => tmp.preQUGlobalSpeed, E(1));
    let cards = [];

    // 1. Atoms & Quarks
    let atomRows = [
        sRow("Atoms", `${sFormat(player.atom.points, 0)} <span class="stats_subnote">${hasElement(24) ? sGain(player.atom.points, sSafe(() => tmp.atom.gain, E(0)).mul(gs)) : "(+" + sFormat(sSafe(() => tmp.atom.gain, E(0)), 0) + " on reset)"}</span>`),
        sRow("Unassigned Quarks", `${sFormat(player.atom.quarks, 0)} <span class="stats_subnote">${hasElement(14) ? sGain(player.atom.quarks, sSafe(() => tmp.atom.quarkGain.mul(tmp.atom.quarkGainSec).mul(gs), E(0))) : "(+" + sFormat(sSafe(() => tmp.atom.quarkGain, E(0)), 0) + " on reset)"}</span>`),
        sRow("Passive Quark Rate", `${sFormat(E(tmp.atom ? tmp.atom.quarkGainSec : 0.05).mul(100))}% of quark gain/sec`),
        sRow("Assign Ratio / Dist Ratio", `${RATIO_ID[player.atom.ratio]} | [${player.atom.dRatio.join(" : ")}]`),
    ];
    cards.push(sCard("Atoms & Quarks", atomRows, { locked: !player.atom.unl }));

    // 2. Quark Particles
    let pRows = [];
    for (let x = 0; x < ATOM.particles.names.length; x++) {
        let p = tmp.atom && tmp.atom.particles ? tmp.atom.particles[x] : null;
        let desc = p ? ATOM.particles.desc[x](p.powerEffect) : "-";
        pRows.push(sRow(ATOM.particles.names[x],
            `Count: <b>${sFormat(player.atom.particles[x], 0)}</b> | Power: <b>${sFormat(player.atom.powers[x])}</b><span class="stats_subnote">${p ? sGain(player.atom.powers[x], p.powerGain.mul(gs)) : ""}<br>${desc}</span>`
        ));
    }
    cards.push(sCard("Quark Particles", pRows, { locked: !player.atom.unl }));

    // 3. Galactic Particles
    let gpUnl = hasElement(251) || player.superGal.gte(10);
    let gpRows = [
        sRow("Unassigned Galactic Quarks", `${sFormat(player.galQk, 0)} <span class="stats_subnote">${sGain(player.galQk, sSafe(() => SUPERNOVA_GALAXY.galQkGain(), E(0)))}</span>`),
    ];
    for (let x = 0; x < ATOM.particles.names.length; x++) {
        gpRows.push(sRow(`Galactic ${ATOM.particles.names[x]}`,
            `Count: <b>${sFormat(player.galParticles[x], 0)}</b><span class="stats_subnote">Raises ${ATOM.particles.names[x]} Power & gain by ^${sFormat(sSafe(() => galParticleEffect(x), E(1)))}</span>`
        ));
    }
    cards.push(sCard("Galactic Quarks & Particles", gpRows, { locked: !gpUnl }));

    // 4. Periodic Elements
    let elemUnl = player.chal.comps[7].gte(16) || player.supernova.times.gte(1) || quUnl();
    let totalElems = tmp.elements.upg_length || (ELEMENTS.upgs.length - 1);
    let tierCounts = [0, 0, 0, 0];
    let tierTotals = [0, 0, 0, 0];
    for (let id = 1; id <= totalElems; id++) {
        let t = id <= 118 ? 0 : id <= 218 ? 1 : id <= 362 ? 2 : 3;
        if (ELEMENTS.upgs[id] && ELEMENTS.upgs[id].cost !== EINF) tierTotals[t]++;
        if (hasElement(id)) tierCounts[t]++;
    }
    let chargeMax = 0;
    for (let id = 1; id <= totalElems; id++) if (ELEMENTS.upgs[id] && ELEMENTS.upgs[id].ccost) chargeMax++;
    let elemRows = [
        sRow("Elements Bought / Unlocked", `<b>${player.atom.elements.length}</b> / ${tmp.elements.unl_length || 0} (Max defined: ${totalElems})`),
        sRow("Selected Element Tier", `Tier ${player.atom.elemTier || 1}`),
        sRow("Tier 1 Elements (1–118)", `${tierCounts[0]} / ${tierTotals[0]}`),
        sRow("Tier 2 Elements (119–218)", `${tierCounts[1]} / ${tierTotals[1]}`, { locked: (tmp.elements.unl_length || 0) <= 118 }),
        sRow("Tier 3 Elements (219–362)", `${tierCounts[2]} / ${tierTotals[2]}`, { locked: (tmp.elements.unl_length || 0) <= 218 }),
        sRow("Tier 4 Elements (363–558)", `${tierCounts[3]} / ${tierTotals[3]}`, { locked: (tmp.elements.unl_length || 0) <= 362 }),
        sRow("Charged Elements", `<b>${player.atom.chargedElements.length}</b> / ${chargeMax}`, { locked: !hasElement(380) }),
        sRow("Blocked in Big Rip", tmp.elements.cannot && tmp.elements.cannot.length ? tmp.elements.cannot.join(", ") : "None"),
    ];
    cards.push(sCard("Periodic Elements", elemRows, { locked: !elemUnl }));

    // 5. Mass Dilation
    let mdUnl = MASS_DILATION.unlocked();
    let dmOverActive = player.md.mass.gte("e5e28") && sIsValidDec(tmp.dmOverflow);
    let mdRows = [
        sRow("Mass Dilation Status", player.md.active ? sBadge("Active", "active") : sBadge("Inactive", "locked")),
        sRow("Dilation Penalty", `^${sFormat(sSafe(() => tmp.md.pen, E(0.8)))}`),
        sRow("Relativistic Particles", `${sFormat(player.md.particles, 0)} <span class="stats_subnote">${player.md.active ? "(+" + sFormat(sSafe(() => tmp.md.rp_gain, E(0)), 0) + " on cancel)" : hasTree("qol3") ? sGain(player.md.particles, sSafe(() => tmp.md.passive_rp_gain, E(0)).mul(gs)) : "(inactive)"}</span>`),
        sRow("RP Gain Formula Params", `Exp: ${sFormat(sSafe(() => tmp.md.rp_exp_gain, E(2)))} | Mult: ${sFormat(sSafe(() => tmp.md.rp_mult_gain, E(1)))} | Next RP at: ${sMass(sSafe(() => tmp.md.mass_req, EINF))}`),
        sRow("Dilated Mass", `${sMass(player.md.mass)} <span class="stats_subnote">${sGain(player.md.mass, sSafe(() => tmp.md.mass_gain, E(0)).mul(gs), true)}</span>`),
        sRow("DM Effect (to Tickspeed)", tmp.md.bd3 ? `^${sFormat(sSafe(() => tmp.md.mass_eff, E(1)))}` : `${sFormat(sSafe(() => tmp.md.mass_eff, E(1)))}x`),
        sRow("DM Softcap & Overflow", `Softcap: ${hasElement(158) ? "Disabled (E158)" : sMass(mlt(1e12))}<span class="stats_subnote">Overflow: ${dmOverActive ? "^" + sFormat(tmp.dmOverflow) : "Inactive (Starts e5e28)"}</span>`),
    ];
    for (let x = 0; x < MASS_DILATION.upgs.ids.length; x++) {
        let u = MASS_DILATION.upgs.ids[x];
        let tu = tmp.md && tmp.md.upgs ? tmp.md.upgs[x] : {};
        let lvl = player.md.upgs[x] || E(0);
        let unl = u.unl ? u.unl() : true;
        mdRows.push(sRow(`MD Upgrade #${x + 1}`,
            `Lvl <b>${sFormat(lvl, 0)}</b>${u.maxLvl ? " / " + sFormat(u.maxLvl, 0) : ""} | Cost: ${sMass(tu.cost)}<span class="stats_subnote">${u.effDesc && tu.eff !== undefined ? u.effDesc(tu.eff) : u.desc}</span>`,
            { locked: !unl }
        ));
    }
    cards.push(sCard("Mass Dilation", mdRows, { locked: !mdUnl }));

    // 6. Break Dilation
    let bdUnl = hasUpgrade("br", 9);
    let bd = player.md.break;
    let bdRows = [
        sRow("Break Dilation Status", bd.active ? sBadge("Broken", "active") : sBadge("Fixed", "locked")),
        sRow("Relativistic Energy", `${sFormat(bd.energy, 1)} <span class="stats_subnote">${sGain(bd.energy, sSafe(() => tmp.bd.energyGain, E(0)))}</span>`),
        sRow("Relativistic Mass", `${sMass(bd.mass)} <span class="stats_subnote">${sGain(bd.mass, sSafe(() => tmp.bd.massGain, E(0)), true)}</span>`),
    ];
    for (let x = 0; x < MASS_DILATION.break.upgs.ids.length; x++) {
        let u = MASS_DILATION.break.upgs.ids[x];
        let tu = tmp.bd && tmp.bd.upgs ? tmp.bd.upgs[x] : {};
        let lvl = bd.upgs[x] || E(0);
        let unl = u.unl ? u.unl() : true;
        bdRows.push(sRow(`BD Upgrade #${x + 1}`,
            `Lvl <b>${sFormat(lvl, 0)}</b>${u.maxLvl ? " / " + sFormat(u.maxLvl, 0) : ""} | Cost: ${sMass(tu.cost)}<span class="stats_subnote">${u.effDesc && tu.eff !== undefined ? u.effDesc(tu.eff) : u.desc}</span>`,
            { locked: !unl }
        ));
    }
    cards.push(sCard("Break Dilation", bdRows, { locked: !bdUnl }));

    return cards.join("");
}

function buildSection5Supernova() {
    let gs = sSafe(() => tmp.preQUGlobalSpeed, E(1));
    let cards = [];

    // 1. Supernova Core & Neutron Tree
    let snUnl = player.supernova.times.gte(1) || quUnl() || player.superGal.gte(1);
    let totalBought = player.supernova.tree.length + player.exotic.tree.length;
    let totalTree = tmp.supernova.tree_had ? tmp.supernova.tree_had.length : 0;
    let snRows = [
        sRow(`Supernovas${getScalingName("supernova") ? " (" + getScalingName("supernova").trim() + ")" : ""}`,
            `<b>${sFormat(player.supernova.times, 0)}</b> | Bulk: ${sFormat(sSafe(() => tmp.supernova.bulk, E(0)), 0)}<span class="stats_subnote">Next at ${sFormat(sSafe(() => tmp.supernova.maxlimit, E(1e90)), 2)} Stars</span>`),
        sRow("Neutron Stars", `${sFormat(player.supernova.stars, 2)} <span class="stats_subnote">${sGain(player.supernova.stars, sSafe(() => tmp.supernova.star_gain, E(0)).mul(gs))}</span>`),
        sRow("Post-10 Unlocked", player.supernova.post_10 ? "Yes" : "No"),
        sRow("Total Neutron Tree Upgrades", `<b>${totalBought}</b> / ${totalTree}`),
    ];
    for (let j = 0; j < TREE_TAB.length; j++) {
        let t = TREE_TAB[j];
        let tabUnl = t.unl ? t.unl() : true;
        let ids = tmp.supernova.tree_had2[j] || [];
        let bought = ids.filter(id => hasTree(id)).length;
        let aff = tmp.supernova.tree_afford2[j] ? tmp.supernova.tree_afford2[j].length : 0;
        snRows.push(sRow(`Tree: ${t.title}`, `<b>${bought} / ${ids.length}</b> bought (Affordable: ${aff})`, { locked: !tabUnl }));
    }
    cards.push(sCard("Supernova Core & Neutron Tree", snRows, { locked: !snUnl }));

    // 2. Bosons & Boson Upgrades
    let bosonLabels = {
        pos_w: "W+ Bosons",
        neg_w: "W- Bosons",
        z_boson: "Z0 Bosons",
        photon: "Photons",
        gluon: "Gluons",
        graviton: "Gravitons",
        hb: "Higgs Bosons",
    };
    let bosonRows = [];
    for (let x = 0; x < BOSONS.names.length; x++) {
        let id = BOSONS.names[x];
        let amt = player.supernova.bosons[id];
        let gain = sSafe(() => tmp.bosons.gain[id], E(0));
        let eff = tmp.bosons && tmp.bosons.effect ? tmp.bosons.effect[id] : null;
        let effDesc = "-";
        if (id === "pos_w" && eff) effDesc = `Mass ${sFormat(eff[0])}x | W- gain ${sFormat(eff[1])}x`;
        else if (id === "neg_w" && eff) effDesc = `Mass gain^2 SS ^${sFormat(eff[0])} | W+ gain ${sFormat(eff[1])}x`;
        else if (id === "z_boson" && eff) effDesc = `Tickspeed Power ${sFormat(eff[0])}x | W± gain ${sFormat(eff[1])}x`;
        else if (id === "graviton" && eff) effDesc = `All Bosons ${sFormat(eff[0])}x`;
        else if (id === "hb" && eff) effDesc = `Graviton effect ^${sFormat(eff[0])}`;
        else if (id === "photon") effDesc = "Fuels Photon Upgrades";
        else if (id === "gluon") effDesc = "Fuels Gluon Upgrades";
        bosonRows.push(sRow(bosonLabels[id] || id, `${sFormat(amt)} <span class="stats_subnote">${sGain(amt, gain.mul(gs))}<br>${effDesc}</span>`));
    }
    for (let x = 0; x < BOSONS.upgs.ids.length; x++) {
        let id = BOSONS.upgs.ids[x];
        for (let y = 0; y < BOSONS.upgs[id].length; y++) {
            let u = BOSONS.upgs[id][y];
            let tu = tmp.bosons.upgs[id] && tmp.bosons.upgs[id][y] ? tmp.bosons.upgs[id][y] : {};
            let lvl = player.supernova.b_upgs[id][y] || E(0);
            bosonRows.push(sRow(`${capitalFirst(id)} Upgrade #${y + 1}`,
                `Lvl <b>${sFormat(lvl, 0)}</b> | Cost: ${sFormat(tu.cost)} ${capitalFirst(id)}<span class="stats_subnote">${u.effDesc && tu.effect !== undefined ? u.effDesc(tu.effect) : "-"}</span>`
            ));
        }
    }
    cards.push(sCard("Bosons & Boson Upgrades", bosonRows, { locked: !player.supernova.post_10 }));

    // 3. Fermions (U-Quarks & U-Leptons)
    let fUnl = player.supernova.fermions.unl;
    let fRows = [
        sRow("Active Fermion", player.supernova.fermions.choosed || "None"),
        sRow("Fermion Scaling FP", `${sFormat(sSafe(() => tmp.fermions.fp, E(1)))}x`),
        sRow("U-Quarks", `${sFormat(player.supernova.fermions.points[0], 2)} <span class="stats_subnote">${sGain(player.supernova.fermions.points[0], sSafe(() => tmp.fermions.gains[0], E(0)).mul(gs))}</span>`),
        sRow("U-Leptons", `${sFormat(player.supernova.fermions.points[1], 2)} <span class="stats_subnote">${sGain(player.supernova.fermions.points[1], sSafe(() => tmp.fermions.gains[1], E(0)).mul(gs))}</span>`),
    ];
    for (let i = 0; i < 2; i++) {
        let unls = FERMIONS.getUnlLength(i);
        for (let j = 0; j < FERMIONS.types[i].length; j++) {
            let f = FERMIONS.types[i][j];
            let tier = player.supernova.fermions.tiers[i][j];
            let maxT = tmp.fermions.maxTier[i][j] || Infinity;
            let bon = tmp.fermions.bonuses[i][j] || E(0);
            let effVal = tmp.fermions.effs[i][j];
            if (hasUpgrade("bh", 24) && i === 1 && j === 5 && effVal !== undefined) effVal = effVal.add(10).log10();
            let fm = f.isMass ? sMass : sFormat;
            let nextAt = sSafe(() => f.nextTierAt(tier), EINF);
            fRows.push(sRow(`[${i === 0 ? "Quark" : "Lepton"}] ${FERMIONS.sub_names[i][j]}`,
                `Tier <b>${sFormat(tier, 0)}</b>${maxT < Infinity ? " / " + sFormat(maxT, 0) : ""}${bon.gt(0) ? " + " + sFormat(bon) : ""}<span class="stats_subnote">Next at: ${fm(nextAt)} ${f.inc} | ${effVal !== undefined ? f.desc(effVal) : "-"}</span>`,
                { locked: j >= unls }
            ));
        }
    }
    cards.push(sCard("Fermions (U-Quarks & U-Leptons)", fRows, { locked: !fUnl }));

    // 4. Galactic Fermions
    let gfUnl = hasElement(237);
    let gfRows = [];
    for (let i = 2; i < 4; i++) {
        let unls = FERMIONS.getGUnlLength(i);
        for (let j = 0; j < FERMIONS.types[i].length; j++) {
            let f = FERMIONS.types[i][j];
            let tier = player.supernova.fermions.tiers[i][j];
            let maxT = tmp.fermions.maxTier[i][j] || Infinity;
            let effVal = tmp.fermions.effs[i][j];
            let eff2Val = tmp.fermions.effs2[i][j];
            let nextAt = sSafe(() => f.nextTierAt(tier), EINF);
            let descStr = effVal !== undefined ? f.desc(effVal) : "-";
            if (hasElement(503) && eff2Val !== undefined && f.desc2) descStr += "<br>" + f.desc2(eff2Val);
            gfRows.push(sRow(`[${i === 2 ? "G-Quark" : "G-Lepton"}] ${FERMIONS.sub_names[i - 2][j]}`,
                `Tier <b>${sFormat(tier, 0)}</b>${maxT < Infinity ? " / " + sFormat(maxT, 0) : ""}<span class="stats_subnote">Next at: ${sFormat(nextAt, 0)} ${f.inc} | ${descStr}</span>`,
                { locked: j >= unls }
            ));
        }
    }
    cards.push(sCard("Galactic Fermions", gfRows, { locked: !gfUnl }));

    // 5. Radiation
    let radUnl = !!tmp.radiation.unl;
    let radRows = [
        sRow("Frequency", `${sFormat(player.supernova.radiation.hz, 1)} Hz <span class="stats_subnote">${sGain(player.supernova.radiation.hz, sSafe(() => tmp.radiation.hz_gain, E(0)).mul(gs))} | Effect: ${sFormat(sSafe(() => tmp.radiation.hz_effect, E(1)))}x Fermion gain</span>`),
        sRow("Radiation Boost FP", `${sFormat(sSafe(() => tmp.radiation.bs.fp, E(1)))}x`),
    ];
    for (let x = 0; x < RAD_LEN; x++) {
        let wUnl = x === 0 || player.supernova.radiation.hz.gte(RADIATION.unls[x]);
        let ds = player.supernova.radiation.ds[x] || E(0);
        let dGain = sSafe(() => tmp.radiation.ds_gain[x], E(0));
        let dEff = sSafe(() => tmp.radiation.ds_eff[x], E(1));
        let amp = player.supernova.radiation.bs[2 * x] || E(0);
        let vel = player.supernova.radiation.bs[2 * x + 1] || E(0);
        let boostLines = [];
        for (let y = 0; y < 3; y++) {
            let idx = 3 * x + y;
            let lvl = sSafe(() => tmp.radiation.bs.lvl[idx], E(0));
            let bon = sSafe(() => tmp.radiation.bs.bonus_lvl[idx], E(0));
            let eff = sSafe(() => tmp.radiation.bs.eff[idx], E(1));
            boostLines.push(`${RADIATION.boosts[idx].title} [${sFormat(lvl, 0)}${bon.gt(0) ? " + " + sFormat(bon) : ""}]: ${RADIATION.boosts[idx].desc(eff)}`);
        }
        radRows.push(sRow(`${RADIATION.names[x]} Wave`,
            `${sFormat(ds, 1)} m | ${sFormat(dEff)}x | Amp ${sFormat(amp, 0)} / Vel ${sFormat(vel, 0)}<span class="stats_subnote">${sGain(ds, dGain.mul(gs))}<br>${boostLines.join("<br>")}</span>`,
            { locked: !wUnl }
        ));
    }
    cards.push(sCard("Radiation & Wavelength Boosts", radRows, { locked: !radUnl }));

    // 6. Supernova Galaxy & Cluster
    let sgUnl = hasElement(218) || player.superGal.gte(1);
    let scUnl = hasElement(387) || player.superCluster.gte(1);
    let galNames = ["Star Power", "Atom Power", "Dark Matter Power", "Boson Power", "Fermion Power", "Radiation Power"];
    let galGainFns = [SUPERNOVA_GALAXY.galPow0_gain, SUPERNOVA_GALAXY.galPow1_gain, SUPERNOVA_GALAXY.galPow2_gain, SUPERNOVA_GALAXY.galPow3_gain, SUPERNOVA_GALAXY.galPow4_gain, SUPERNOVA_GALAXY.galPow5_gain];
    let galEffFns = [SUPERNOVA_GALAXY.galPow0_eff, SUPERNOVA_GALAXY.galPow1_eff, SUPERNOVA_GALAXY.galPow2_eff, SUPERNOVA_GALAXY.galPow3_eff, SUPERNOVA_GALAXY.galPow4_eff, SUPERNOVA_GALAXY.galPow5_eff];
    let galReqSG = [1, 6, 6, 7, 9, 9];
    let sgRows = [
        sRow(`Supernova Galaxies${getScalingName("superGal") ? " (" + getScalingName("superGal").trim() + ")" : ""}`,
            `<b>${sFormat(player.superGal, 0)}</b> | Bulk: ${sFormat(sSafe(() => SUPERNOVA_GALAXY.bulk(), E(0)), 0)}<span class="stats_subnote">Next at ${sFormat(sSafe(() => SUPERNOVA_GALAXY.req(), E(1e6)), 0)} Supernovas</span>`),
        sRow("Galaxy Passive Multipliers",
            `Pre-QU Speed & Mass: ${sFormat(SUPERNOVA_GALAXY.effects.pqgs())}x | RP: ^${sFormat(SUPERNOVA_GALAXY.effects.rp())} | BH: ^${sFormat(SUPERNOVA_GALAXY.effects.bh())}` +
            `<span class="stats_subnote">Tickspeed: ${sFormat(SUPERNOVA_GALAXY.effects.tsMult())}x & ^${sFormat(SUPERNOVA_GALAXY.effects.ts())} | Accel Pow: ${sFormat(SUPERNOVA_GALAXY.effects.apMult())}x | Meta-Scaling Start: ${sFormat(SUPERNOVA_GALAXY.effects.meta())}x</span>` +
            `<span class="stats_subnote">NS: ${sFormat(SUPERNOVA_GALAXY.effects.nsMult())}x & ^${sFormat(SUPERNOVA_GALAXY.effects.ns())} | Entropy Gain: ${sFormat(SUPERNOVA_GALAXY.effects.entropyg())}x | Cap: ${sFormat(SUPERNOVA_GALAXY.effects.entropy())}x</span>` +
            `<span class="stats_subnote">+C1–16 Max: +${sFormat(SUPERNOVA_GALAXY.effects.chal(), 0)} | +C17–20 Max: +${sFormat(SUPERNOVA_GALAXY.effects.chal2(), 0)} | Start QS: ${SUPERNOVA_GALAXY.effects.qs()} | Accel SS: ${sFormat(SUPERNOVA_GALAXY.effects.aesc())}x</span>` +
            `<span class="stats_subnote">Inf/Et Mass: ${sFormat(SUPERNOVA_GALAXY.effects.inf())}x | Start QUT: ${sFormat(SUPERNOVA_GALAXY.effects.qut(), 0)} | QUT/Inf/Et Gain: ${sFormat(SUPERNOVA_GALAXY.effects.qut2())}x | EM & GM: ${sFormat(SUPERNOVA_GALAXY.effects.em())}x</span>`,
            { locked: player.superGal.lt(1) }
        ),
    ];
    for (let i = 0; i < 6; i++) {
        sgRows.push(sRow(`Galactic ${galNames[i]}`,
            `${sFormat(player.galPow[i])} | Effect: <b>^${sFormat(sSafe(() => galEffFns[i](), E(1)))}</b><span class="stats_subnote">${sGain(player.galPow[i], sSafe(() => galGainFns[i](), E(0)))}</span>`,
            { locked: player.superGal.lt(galReqSG[i]) }
        ));
    }
    sgRows.push(sRow("Supernova Clusters",
        `<b>${sFormat(player.superCluster, 0)}</b> | Bulk: ${sFormat(sSafe(() => SUPERNOVA_CLUSTER.bulk(), E(0)), 0)}<span class="stats_subnote">Next at ${sFormat(sSafe(() => SUPERNOVA_CLUSTER.req(), E(100)), 0)} Supernova Galaxies</span>`,
        { locked: !scUnl }
    ));
    sgRows.push(sRow("Galactic Mass",
        `${sMass(player.galPow[6])} | Effect: <b>${sFormat(sSafe(() => SUPERNOVA_GALAXY.galPow6_eff(), E(1)))}x</b><span class="stats_subnote">${sGain(player.galPow[6], sSafe(() => SUPERNOVA_GALAXY.galPow6_gain(), E(0)), true)}</span>`,
        { locked: player.superCluster.lt(9) }
    ));
    sgRows.push(sRow("Cluster Passive Effects",
        `Eff1 (Mult): ${sFormat(SUPERNOVA_CLUSTER.effects.eff1())}x | Eff2 (+Super SG): +${sFormat(SUPERNOVA_CLUSTER.effects.eff2(), 0)} | Eff3 (+EB): +${sFormat(SUPERNOVA_CLUSTER.effects.eff3(), 0)}<span class="stats_subnote">Eff4 (+Inf Exp): +${sFormat(SUPERNOVA_CLUSTER.effects.eff4(), 0)} | Eff5 (Meta-SN): ${sRed(SUPERNOVA_CLUSTER.effects.eff5())} | Eff6 (+Matter Exp): +${sFormat(SUPERNOVA_CLUSTER.effects.eff6())} | Eff7 (AxG): ${sFormat(SUPERNOVA_CLUSTER.effects.eff7())}x | Eff8 (Entropy): ${sFormat(SUPERNOVA_CLUSTER.effects.eff8())}x</span>`,
        { locked: player.superCluster.lt(1) }
    ));
    cards.push(sCard("Supernova Galaxy & Cluster", sgRows, { locked: !sgUnl && !scUnl }));

    return cards.join("");
}

function buildSection6Quantum() {
    let cards = [];
    let qUnl = quUnl() || player.chal.comps[12].gte(1);
    let qGain = sSafe(() => tmp.qu.gain, E(0));
    let qTimesGain = sSafe(() => tmp.qu.gainTimes, E(0));
    let qMilCount = 0;
    for (let x = 0; x < QUANTUM.mils.length; x++) if (tmp.qu.mil_reached && tmp.qu.mil_reached[x]) qMilCount++;

    // 1. Quantum Core, Milestones & Auto-Quantum
    let qRows = [
        sRow("Quantum Foam", `${sFormat(player.qu.points, 0)} <span class="stats_subnote">${hasUpgrade("br", 8) ? sGain(player.qu.points, qGain.div(hasTree("qu_qol11") ? 1 : 10)) : "(+" + sFormat(qGain, 0) + " on reset)"}</span>`),
        sRow("Quantizes", `${sFormat(player.qu.times, 0)} <span class="stats_subnote">${hasTree("qu_qol11") ? sGain(player.qu.times, qTimesGain) : "(+" + sFormat(qTimesGain, 0) + " on reset)"}</span>`),
        sRow("Quantum Theories Remaining", `${sFormat(tmp.qu.theories || 0, 0)} (${player.qu.chr_get.length} / ${CHROMA_LEN} Chromas picked)`),
        sRow("Quantum Milestones Reached", `<b>${qMilCount} / ${QUANTUM.mils.length}</b>`),
        sRow("Auto-Quantum",
            `${player.qu.auto.enabled ? "ON" : "OFF"} | Mode: ${QUANTUM.auto.mode[player.qu.auto.mode]} (${player.qu.auto.mode == 0 ? sFormat(tmp.qu.auto_input || 1, 0) : formatTime(tmp.qu.auto_input || 1, 1) + "s"})`,
            { locked: !(tmp.qu.mil_reached && tmp.qu.mil_reached[6]) }
        ),
    ];
    cards.push(sCard("Quantum Core & Auto-Quantum", qRows, { locked: !qUnl }));

    // 2. Chroma
    let chrRows = [];
    for (let x = 0; x < CHROMA_LEN; x++) {
        let n = CHROMA.names[x];
        let picked = player.qu.chr_get.includes(x);
        let amt = player.qu.chroma[x] || E(0);
        let gain = sSafe(() => tmp.qu.chroma_gain[x], E(0));
        let eff = tmp.qu.chroma_eff[x] !== undefined ? tmp.qu.chroma_eff[x] : CHROMA.eff[x](amt);
        chrRows.push(sRow(`${n[0]} Chroma (${n[1]})`,
            `${sFormat(amt, 1)} <span class="stats_subnote">${sGain(amt, gain)}<br>${CHROMA.effDesc[x](eff)}</span>`,
            { locked: !picked && !quUnl(), badge: picked ? sBadge("Active", "unlocked") : sBadge("Unpicked", "locked") }
        ));
    }
    cards.push(sCard("Chroma", chrRows, { locked: !quUnl() }));

    // 3. Primordium
    let primUnl = PRIM.unl();
    let getPureFreePrim = (id) => {
        let res = E(0);
        if (hasTree("prim4") && id === 0) res = player.qu.prim.theorems;
        if (hasTree("prim5") && id === 2) res = player.qu.prim.theorems;
        if (hasTree("prim6") && id === 1) res = player.qu.prim.theorems;
        if (hasTree("prim7") && id === 3) res = player.qu.prim.theorems;
        if (hasTree("prim8") && id === 4) res = player.qu.prim.theorems;
        if (hasTree("prim8") && id >= 5) res = player.qu.prim.theorems.div(hasElement(166) ? 1 : hasElement(152) ? 1.5 : hasElement(132) ? 2 : hasPrestige(0, 130) ? 2.5 : 3).floor();
        if (hasPrestige(1, 4)) res = res.add(5);
        if (hasPrestige(1, 9)) res = res.add(prestigeEff(1, 9, 0));
        return res;
    };
    let primRows = [
        sRow("Primordium Theorems", `Unspent: <b>${sFormat(sSafe(() => tmp.prim.unspent, E(0)), 0)}</b> / Total: <b>${sFormat(player.qu.prim.theorems, 0)}</b><span class="stats_subnote">Base: ${sFormat(sSafe(() => tmp.prim.t_base, E(5)), 0)} | Next at ${sFormat(sSafe(() => tmp.prim.next_theorem, E(5)), 1)} BP</span>`),
    ];
    for (let i = 0; i < PRIM.particle.names.length; i++) {
        let baseP = player.qu.prim.particles[i] || E(0);
        let freeP = getPureFreePrim(i);
        let eff = tmp.prim.eff && tmp.prim.eff[i] !== undefined ? tmp.prim.eff[i] : PRIM.particle.eff[i](baseP.add(freeP));
        let prim8Lvl = i >= 5 ? player.qu.prim.theorems.div(hasElement(166) ? 1 : hasElement(152) ? 1.5 : hasElement(132) ? 2 : hasPrestige(0, 130) ? 2.5 : 3).floor() : player.qu.prim.theorems;
        let amtTxt = hasTree("prim8")
            ? `Level ${sFormat(prim8Lvl, 0)} (+${sFormat(freeP.sub(prim8Lvl).max(0), 0)})`
            : `${sFormat(baseP, 0)}${freeP.gt(0) ? " + " + sFormat(freeP, 0) : ""}`;
        primRows.push(sRow(PRIM.particle.names[i], `${amtTxt}<span class="stats_subnote">${PRIM.particle.effDesc[i](eff)}</span>`));
    }
    cards.push(sCard("Primordium Particles", primRows, { locked: !primUnl }));

    // 4. Entropy
    let enUnl = player.qu.en.unl;
    let enRows = [
        sRow("Entropy", `${sFormat(player.qu.en.amt, 1)} / ${sFormat(sSafe(() => tmp.en.cap, E(0)), 1)} <span class="stats_subnote">${sGain(player.qu.en.amt, sSafe(() => tmp.en.gain.amt, E(0)))}</span>`),
        sRow("Enthalpy", `Best: <b>${sFormat(player.qu.en.eth[2])}</b>${player.qu.en.eth[0] ? " (Evaporating: " + sFormat(player.qu.en.eth[1]) + ")" : ""}<span class="stats_subnote">Rate: ${sFormat(sSafe(() => tmp.en.gain.eth, E(1)))}/s | Entropy gain: ${sFormat(sSafe(() => tmp.en.eff.eth, E(0)), 1)}x</span>`),
        sRow("Hawking Radiation", `Best: <b>${sFormat(player.qu.en.hr[2])}</b>${player.qu.en.hr[0] ? " (Evaporating: " + sFormat(player.qu.en.hr[1]) + ")" : ""}<span class="stats_subnote">Rate: ${sFormat(sSafe(() => tmp.en.gain.hr, E(1)))}/s | Entropy cap: ${sFormat(sSafe(() => tmp.en.eff.hr, E(0)), 1)}x</span>`),
    ];
    for (let x = 0; x < ENTROPY.rewards.length; x++) {
        let rc = ENTROPY.rewards[x];
        let rs = player.qu.en.rewards[x] || E(0);
        let next = sSafe(() => ENTROPY.nextReward(x), rc.start);
        let eff = getEnRewardEff(x);
        enRows.push(sRow(rc.title, `Lvl <b>${sFormat(rs, 0)}</b> (Next: ${sFormat(next)})<span class="stats_subnote">${rc.desc(eff)}</span>`));
    }
    cards.push(sCard("Entropy & Evaporation", enRows, { locked: !enUnl }));

    // 5. Big Rip
    let brUnl = hasTree("unl4") || player.qu.rip.first;
    let ripGain = sSafe(() => tmp.rip.gain, E(0));
    let brRows = [
        sRow("Big Rip Status", player.qu.rip.active ? sBadge("Big Ripped", "active") : sBadge("Normal Dimension", "locked")),
        sRow("First Big Rip Reached", player.qu.rip.first ? "Yes" : "No"),
        sRow("Death Shards", `${sFormat(player.qu.rip.amt, 0)} <span class="stats_subnote">${hasUpgrade("br", 8) && (player.qu.rip.active || hasTree("qu_qol12")) ? sGain(player.qu.rip.amt, ripGain.div(10)) : "(+" + sFormat(ripGain, 0) + ")"}</span>`),
    ];
    cards.push(sCard("Big Rip", brRows, { locked: !brUnl }));

    return cards.join("");
}

function buildSection7Exotic() {
    let cards = [];
    let exUnl = player.exotic.times.gte(1) || hasElement(359);
    let exMils = 0;
    for (let x = 0; x < EXOTIC.mils.length; x++) if (player.exotic.times.gte(EXOTIC.mils[x][0])) exMils++;

    // 1. Exotic Core & Milestones
    let exRows = [
        sRow("Exotic Matter", `${sFormat(player.exotic.points, 0)} <span class="stats_subnote">${hasChargedElement(24) ? sGain(player.exotic.points, sSafe(() => tmp.ex.gain, E(0))) : "(+" + sFormat(sSafe(() => tmp.ex.gain, E(0)), 0) + " on reset)"}</span>`),
        sRow("Exotic Resets", `${sFormat(player.exotic.times, 0)} <span class="stats_subnote">${player.exotic.dark_run.upgs[4].gte(1) ? sGain(player.exotic.times, sSafe(() => tmp.ex.gainTimes, E(1))) : "(+" + sFormat(sSafe(() => tmp.ex.gainTimes, E(1)), 0) + " on reset)"}</span>`),
        sRow("Exotic Milestones Reached", `<b>${exMils} / ${EXOTIC.mils.length}</b>`),
    ];
    cards.push(sCard("Exotic Core & Milestones", exRows, { locked: !exUnl }));

    // 2. RC Boosters
    let rcbNames = ["Quantum Count Boosters", "Infinity Count Boosters", "Eternity Count Boosters", "Exotic Count Boosters"];
    let rcbUnl = hasUpgrade("exotic", 5);
    let rcbRows = [];
    for (let i = 0; i <= 3; i++) {
        let lvl = player.exotic.rcb[i] || E(0);
        let cost = sSafe(() => tmp.ex.rcb_cost[i], E(2 + i));
        let eff = tmp.ex.rcb_eff && tmp.ex.rcb_eff[i] ? tmp.ex.rcb_eff[i] : EXOTIC.rcb.eff(i);
        rcbRows.push(sRow(rcbNames[i],
            `Lvl <b>${sFormat(lvl, 0)}</b> | Cost: ${sFormat(cost, 0)} EM<span class="stats_subnote">Power: ${i === 3 ? "+" + sFormat(eff.pow) : sFormat(eff.pow) + "x"} | Effect: ${sFormat(eff.eff)}x</span>`,
            { locked: i === 3 ? !hasElement(402) : !rcbUnl }
        ));
    }
    cards.push(sCard("Reset Count Boosters", rcbRows, { locked: !rcbUnl }));

    // 3. Exotic Boosts
    let ebUnl = hasUpgrade("exotic", 10);
    let ebNames = ["Rage Boost (RP Exp)", "Dark Matter Boost (DM Exp)", "Atom Boost (Atom Exp)", "Star Boost (Star Exp)", "Supernova Boost (NS Exp)", "Quantum Boost (QF Exp)", "Exotic Meta-Boost (+Prev Boosts)"];
    let ebReq = [true, true, hasUpgrade("exotic", 11), hasUpgrade("exotic", 18), hasUpgrade("exotic", 20), hasUpgrade("exotic", 24), hasUpgrade("exotic", 25)];
    let usedBP = sSafe(() => EXOTIC_BOOST.used_bp(), E(0));
    let nextBP = Decimal.pow(1e3, player.exotic.bp.add(1).sub(sSafe(() => EXOTIC_BOOST.fgain(), E(0))));
    let ebRows = [
        sRow("Exotic Boost Points", `Used: <b>${sFormat(usedBP, 0)} / ${sFormat(player.exotic.bp, 0)}</b> (Free: +${sFormat(sSafe(() => EXOTIC_BOOST.fgain(), E(0)), 0)})<span class="stats_subnote">Next BP at ${sFormat(nextBP, 0)} EM</span>`),
    ];
    for (let i = 0; i < EXOTIC_BOOST_LENGTH; i++) {
        let lvl = player.exotic.boosts[i] || E(0);
        let eff = tmp.ex.exb_eff && tmp.ex.exb_eff[i] !== undefined ? tmp.ex.exb_eff[i] : E(i === 6 ? 0 : 1);
        ebRows.push(sRow(ebNames[i],
            `Lvl <b>${sFormat(lvl, 0)}</b> | Effect: ${i === 6 ? "+" + sFormat(eff) + " levels" : "^" + sFormat(eff)}`,
            { locked: !ebUnl || !ebReq[i] }
        ));
    }
    cards.push(sCard("Exotic Boosts", ebRows, { locked: !ebUnl }));

    // 4. Darkness
    let dkUnl = hasUpgrade("exotic", 15);
    let drEff = tmp.ex.drEff || EXOTIC.drEff();
    let dsEff = tmp.ex.dsEff || EXOTIC.dsEff();
    let abEff = tmp.ex.abEff || EXOTIC.abEff();
    let drEffects = [`DS: ${sFormat(drEff.ds, 3)}x`];
    if (hasElement(406) && drEff.ex) drEffects.push(`EM: ${sFormat(drEff.ex, 3)}x`);
    if (hasElement(456) && drEff.gm) drEffects.push(`GM: ${sFormat(drEff.gm, 3)}x`);
    if (hasElement(524) && drEff.me) drEffects.push(`Matter Exp: +${sFormat(drEff.me, 3)}`);

    let dsEffects = [`EM & DR: ${sFormat(dsEff.ex, 3)}x`];
    if (hasElement(376) && dsEff.sn) dsEffects.push(`Meta-SN: ${sRed(dsEff.sn)}`);
    if (hasElement(394) && dsEff.en) dsEffects.push(`Entropy: ${sFormat(dsEff.en, 3)}x`);
    if (hasElement(400) && dsEff.bp) dsEffects.push(`BP: ^${sFormat(dsEff.bp, 3)}`);
    if (hasElement(414) && dsEff.ab) dsEffects.push(`AB: ${sFormat(dsEff.ab, 3)}x`);
    if (hasElement(474) && dsEff.qf) dsEffects.push(`QF: ^${sFormat(dsEff.qf, 3)}`);
    if (hasElement(492) && dsEff.me) dsEffects.push(`Matter Exp: +${sFormat(dsEff.me, 3)}`);

    let abEffects = [`DS: ${sFormat(abEff.ds, 3)}x`, `EB: ${sFormat(abEff.exb, 3)}x`];
    if (hasElement(420) && abEff.csp) abEffects.push(`CS Pow: ${sFormat(abEff.csp, 3)}x`);
    if (hasElement(436) && abEff.em) abEffects.push(`EMass: ${sFormat(abEff.em, 3)}x`);
    if (hasElement(512) && abEff.me) abEffects.push(`Matter Exp: +${sFormat(abEff.me, 3)}`);

    let dkRows = [
        sRow("Dark Ray", `${sFormat(player.exotic.dr, 0)} (Gain: +${sFormat(sSafe(() => EXOTIC.drGain(), E(0)), 0)})<span class="stats_subnote">${drEffects.join(" | ")}</span>`),
        sRow("Dark Shadow", `${sFormat(player.exotic.ds, 0)} <span class="stats_subnote">${sGain(player.exotic.ds, sSafe(() => EXOTIC.dsGain(), E(0)))}<br>${dsEffects.join(" | ")}</span>`),
        sRow("Abyssal Blot", `${sFormat(player.exotic.ab, 0)} <span class="stats_subnote">${sGain(player.exotic.ab, sSafe(() => EXOTIC.abGain(), E(0)))}<br>${abEffects.join(" | ")}</span>`, { locked: !hasElement(414) }),
    ];
    cards.push(sCard("Darkness", dkRows, { locked: !dkUnl }));

    // 5. Dark Run
    let druUnl = hasElement(450);
    let druRows = [
        sRow("Dark Run Status", player.exotic.dark_run.active ? sBadge("Active", "active") : sBadge("Inactive", "locked")),
        sRow("Glyphic Mass", `${sMass(player.exotic.dark_run.points)} <span class="stats_subnote">${sGain(player.exotic.dark_run.points, sSafe(() => DARK_RUN.gain(), E(0)), true)}</span>`),
    ];
    for (let x = 0; x < DARK_RUN.upgs.ids.length; x++) {
        let u = DARK_RUN.upgs.ids[x];
        let tu = tmp.dark_run && tmp.dark_run.upgs ? tmp.dark_run.upgs[x] : {};
        let lvl = player.exotic.dark_run.upgs[x] || E(0);
        let unl = u.unl ? u.unl() : true;
        druRows.push(sRow(`DR Upgrade #${x + 1}`,
            `Lvl <b>${sFormat(lvl, 0)}</b>${u.maxLvl ? " / " + sFormat(u.maxLvl, 0) : ""} | Cost: ${sMass(tu.cost)}<span class="stats_subnote">${u.desc}${u.effDesc && tu.eff !== undefined ? " (<b>" + u.effDesc(tu.eff) + "</b>)" : ""}</span>`,
            { locked: !unl }
        ));
    }
    cards.push(sCard("Dark Run", druRows, { locked: !druUnl }));

    // 6. The Matters & FSS
    let matUnl = hasElement(486);
    let matNames = ["Red Matter", "Pink Matter", "Magenta Matter", "Purple Matter", "Violet Matter", "Blue Matter", "Cyan Matter", "Green Matter", "Lime Matter", "Yellow Matter", "Orange Matter", "White Matter", "Fading Matter"];
    let matRows = [
        sRow("Matter Exponent / Extend Pow", `Pow: <b>${sFormat(sSafe(() => MATTERS.pow(), E(1)))}</b> | Extend: <b>${sFormat(sSafe(() => MATTERS.extendPow(), E(0)))}</b><span class="stats_subnote">${hasElement(487) ? "Exotic Matter Bonus: +" + sFormat(sSafe(() => MATTERS.exeff(), E(0))) : ""}</span>`),
    ];
    for (let i = 0; i < MATTERS_LENGTH; i++) {
        let amt = player.exotic.matters[i] || E(0);
        let gain = sSafe(() => MATTERS.gain(i), E(0));
        let eff = sSafe(() => MATTERS.eff(i), E(i === 4 || i === 8 ? 0 : 1));
        let effStr = "";
        if (i === 0) effStr = `EM ${sFormat(eff)}x`;
        else if (i === 1) effStr = amt.gte("1e200") ? `Meta-SN strength /${sFormat(eff.pow(-1))}` : `Meta-SN ${sRed(eff)} weaker`;
        else if (i === 2) effStr = `Eternal Mass Exp +${sFormat(eff)}`;
        else if (i === 3) effStr = `Galactic Quarks ${sFormat(eff)}x`;
        else if (i === 4) effStr = `Prestige Base Exp +${sFormat(eff)}`;
        else if (i === 5) effStr = `Atom Boost ${sFormat(eff)}x`;
        else if (i === 6) effStr = `Supernova Boost ${sFormat(eff)}x`;
        else if (i === 7) effStr = `Quantum Foam ^${sFormat(eff)}`;
        else if (i === 8) effStr = `Ascension Base Exp +${sFormat(eff)}`;
        else if (i === 9) effStr = `Dark Matter Boost ${sFormat(eff)}x`;
        else if (i === 10) effStr = `Infinity Mass Exp +${sFormat(eff)}`;
        else if (i === 11) effStr = `Abyssal Blot ${sFormat(eff)}x`;
        else if (i === 12) effStr = `Dark Ray ${sFormat(eff)}x`;
        matRows.push(sRow(matNames[i], `${sFormat(amt)} <span class="stats_subnote">${sGain(amt, gain)} | ${effStr}</span>`));
    }
    matRows.push(sRow("Final Star Shards (FSS)",
        `<b>${sFormat(player.exotic.fss, 0)}</b> (Base: ${sFormat(sSafe(() => MATTERS.fssBase(), E(0)))} / Req: ${sFormat(sSafe(() => MATTERS.fssReq(), E(40)))})<span class="stats_subnote">Effect: ${sFormat(sSafe(() => MATTERS.fssEff(), E(1)))}x Axion Generators Power</span>`,
        { locked: !hasElement(542) }
    ));
    cards.push(sCard("The Matters & Final Star Shards", matRows, { locked: !matUnl }));

    // 7. Axions & Axionic Space
    let axUnl = hasElement(534);
    let axNames = ["X Axions", "Y Axions", "Z Axions", "W Axions"];
    let axBonuses = ["Exotic Matter", "Dark Ray", "Stardust", "Glyphic Mass"];
    let axReqs = [hasElement(534), hasElement(540), hasElement(554), hasTree("ax20")];
    let axRows = [];
    for (let i = 0; i <= 3; i++) {
        let amt = player.exotic.ax[i] || E(0);
        let genLvl = player.exotic.axg[i] || E(0);
        let cost = sSafe(() => tmp.ex.axg_cost[i], E(0));
        let eff = tmp.ex.axg_eff && tmp.ex.axg_eff[i] ? tmp.ex.axg_eff[i] : EXOTIC.ax.eff(i);
        axRows.push(sRow(axNames[i],
            `<b>${sFormat(amt, 0)}</b> (${sFormat(amt.add(1), 0)}x ${axBonuses[i]}) | Gen Lvl: <b>${sFormat(genLvl, 0)}</b><span class="stats_subnote">Cost: ${sFormat(cost, 0)} EM | Power: +${sFormat(eff.pow)} | Rate: +${sFormat(eff.eff)}/sec</span>`,
            { locked: !axReqs[i] }
        ));
    }
    axRows.push(sRow("Axionic Space",
        `Remaining: ${formatSpace(sSafe(() => EXOTIC.axsRem(), E(1)))} / Total: ${formatSpace(sSafe(() => EXOTIC.axsVal(), E(1)))}<span class="stats_subnote">Effect: ${sFormat(sSafe(() => EXOTIC.axsEff(), E(2)))}x Glyphic Mass</span>`,
        { locked: !hasElement(554) }
    ));
    cards.push(sCard("Axions & Axionic Space", axRows, { locked: !axUnl }));

    return cards.join("");
}

function buildSection8Options() {
    let cards = [];

    // 1. Session & Display Settings
    let massDispNames = ["Normal", "Always show g", "Always show uni", "Always show mlt"];
    let sessRows = [
        sRow("Total Time Played", formatTime(player.time)),
        sRow("Offline Time Bank", `${formatTime(player.offline.time)} (Speed: ${sFormat(tmp.offlineMult || 1)}x)`),
        sRow("Offline Production", player.offline.active ? "ON" : "OFF"),
        sRow("Notation", String(player.options.notation || "sc")),
        sRow("Font", String(player.options.font || "Verdana")),
        sRow("Mass Display Mode", massDispNames[player.mass_display || 0] || "Normal"),
        sRow("Supernova Star Background", player.show_supernova == 1 ? "Hidden" : "Shown"),
        sRow("Neutron Tree Animation", TREE_ANIM[player.options.tree_animation || 0] || "Circle"),
        sRow("Omega Secret Badge", localStorage.getItem("imr_secret_badge1") == "1" ? "Unlocked" : "Locked"),
    ];
    cards.push(sCard("Session & Display Preferences", sessRows));

    // 2. Confirmations
    let confRows = [];
    for (let x = 0; x < CONFIRMS.length; x++) {
        let key = CONFIRMS[x];
        let unl =
            key == "sn" ? (player.supernova.times.gte(1) || quUnl() || player.superGal.gte(1))
            : key == "qu" ? (quUnl() || player.superGal.gte(1))
            : key == "br" ? (player.qu.rip.first || player.superGal.gte(1))
            : key == "inf" ? (player.inf.times.gte(1) || player.superGal.gte(1))
            : key == "et" ? (player.et.times.gte(1) || player.superGal.gte(1))
            : key == "sg" ? player.superGal.gte(1)
            : key == "exotic" ? player.exotic.times.gte(1)
            : (player[key].unl || player.superGal.gte(1));
        confRows.push(sRow(`Confirm: ${key.toUpperCase()}`, player.confirms[key] ? "ON" : "OFF", { locked: !unl }));
    }
    cards.push(sCard("Confirmation Settings", confRows));

    // 3. Automators Overview
    let autoRows = [];
    for (let x = 0; x < RANKS.names.length; x++) {
        let rn = RANKS.names[x];
        let unl = RANKS.autoUnl[rn]();
        autoRows.push(sRow(`Auto ${RANKS.fullNames[x]}`, unl ? (player.auto_ranks[rn] ? "ON" : "OFF") : "Locked", { locked: !unl }));
    }
    for (let x = 1; x <= UPGS.mass.cols; x++) {
        let unl = player.mainUpg.rp.includes(3) && UPGS.mass[x].unl();
        autoRows.push(sRow(`Auto ${UPGS.mass[x].title}`, unl ? (player.autoMassUpg[x] ? "ON" : "OFF") : "Locked", { locked: !unl }));
    }
    for (let x = 1; x <= UPGS.prestigeMass.cols; x++) {
        let unl = UPGS.prestigeMass[x].unl();
        autoRows.push(sRow(`Auto ${UPGS.prestigeMass[x].title}`, unl ? (player.autoprestigeMassUpg[x] ? "ON" : "OFF") : "Locked", { locked: !unl }));
    }
    for (let x = 1; x <= UPGS.ascensionMass.cols; x++) {
        let unl = UPGS.ascensionMass[x].unl();
        autoRows.push(sRow(`Auto ${UPGS.ascensionMass[x].title}`, unl ? (player.autoascensionMassUpg[x] ? "ON" : "OFF") : "Locked", { locked: !unl }));
    }
    autoRows.push(sRow("Auto Tickspeed", FORMS.tickspeed.autoUnl() ? (player.autoTickspeed ? "ON" : "OFF") : "Locked", { locked: !FORMS.tickspeed.autoUnl() }));
    autoRows.push(sRow("Auto Accelerator", hasElement(134) ? (player.autoAccel ? "ON" : "OFF") : "Locked", { locked: !hasElement(134) }));
    autoRows.push(sRow("Auto Prestige Tickspeed", hasPrestige(2, 165) ? (player.autoPrestigeTickspeed ? "ON" : "OFF") : "Locked", { locked: !hasPrestige(2, 165) }));
    autoRows.push(sRow("Auto Prestige BHC", hasPrestige(3, 37) ? (player.autoPrestigeBHC ? "ON" : "OFF") : "Locked", { locked: !hasPrestige(3, 37) }));
    autoRows.push(sRow("Auto BH Condenser", FORMS.bh.condenser.autoUnl() ? (player.bh.autoCondenser ? "ON" : "OFF") : "Locked", { locked: !FORMS.bh.condenser.autoUnl() }));
    autoRows.push(sRow("Auto Cosmic Rays", hasElement(18) ? (player.atom.auto_gr ? "ON" : "OFF") : "Locked", { locked: !hasElement(18) }));
    autoRows.push(sRow("Auto Cosmic Strings", hasElement(131) ? (player.qu.auto_cs ? "ON" : "OFF") : "Locked", { locked: !hasElement(131) }));
    autoRows.push(sRow("Auto-Quantum", (tmp.qu.mil_reached && tmp.qu.mil_reached[6]) ? (player.qu.auto.enabled ? "ON" : "OFF") : "Locked", { locked: !(tmp.qu.mil_reached && tmp.qu.mil_reached[6]) }));
    for (let x = 1; x <= UPGS.main.cols; x++) {
        let upg = UPGS.main[x];
        let id = UPGS.main.ids[x];
        let unl = upg.auto_unl ? upg.auto_unl() : false;
        autoRows.push(sRow(`Auto ${upg.title}`, unl ? (player.auto_mainUpg[id] ? "ON" : "OFF") : "Locked", { locked: !unl }));
    }
    cards.push(sCard("Automators Status", autoRows));

    return cards.join("");
}

const STATS_BUILDERS = [
    buildSection0Main,
    buildSection1RewardsScaling,
    buildSection2Upgrades,
    buildSection3Challenges,
    buildSection4Atom,
    buildSection5Supernova,
    buildSection6Quantum,
    buildSection7Exotic,
    buildSection8Options,
];

function updateAllStatsHTML(force = false) {
    let sub = tmp.stab[8] || 0;
    let ctrlEl = document.getElementById("all_stats_controls");
    let summaryEl = document.getElementById("all_stats_summary");
    let sbEl = document.getElementById("all_stats_sandbox");

    if (sub === 10) {
        if (ctrlEl) ctrlEl.style.display = "none";
        if (summaryEl) summaryEl.style.display = "none";
        for (let i = 0; i < STATS_SECTIONS.length; i++) {
            let secEl = document.getElementById("all_stats_sec_" + i);
            if (secEl) secEl.style.display = "none";
        }
        if (sbEl) {
            sbEl.style.display = "";
            if (typeof SANDBOX !== "undefined") SANDBOX.updateHTML(force);
        }
        return;
    }

    if (ctrlEl) ctrlEl.style.display = "";
    if (summaryEl) summaryEl.style.display = "";
    if (sbEl) sbEl.style.display = "none";

    if (summaryEl) {
        let sumHtml = buildAllStatsSummary();
        if (force || STATS_STATE.lastSummaryHTML !== sumHtml) {
            summaryEl.innerHTML = sumHtml;
            STATS_STATE.lastSummaryHTML = sumHtml;
        }
    }

    let q = STATS_STATE.query.trim().toLowerCase();
    let totalMatchedSections = 0;

    for (let i = 0; i < STATS_SECTIONS.length; i++) {
        let secInfo = STATS_SECTIONS[i];
        let secEl = document.getElementById("all_stats_sec_" + i);
        let bodyEl = document.getElementById("all_stats_body_" + i);
        let badgeEl = document.getElementById("all_stats_badge_" + i);
        let jumpEl = document.getElementById("all_stats_jump_" + i);
        let caretEl = document.getElementById("all_stats_caret_" + i);
        if (!secEl || !bodyEl) continue;

        let tabMatch = (sub === 0) || (sub === i + 1);
        let unl = isStatsTabUnlocked(secInfo.tab);
        if (!tabMatch || (!unl && !STATS_STATE.showLocked)) {
            secEl.style.display = "none";
            continue;
        }

        let bodyHtml = STATS_BUILDERS[i]();
        if (q && !bodyHtml && !secInfo.title.toLowerCase().includes(q)) {
            secEl.style.display = "none";
            continue;
        }

        totalMatchedSections++;
        secEl.style.display = "";
        secEl.className = `stats_section stats_sec_${i}${unl ? "" : " locked_sec"}`;

        if (badgeEl) badgeEl.innerHTML = unl ? sBadge("Unlocked", "unlocked") : sBadge("Locked", "locked");
        if (jumpEl) jumpEl.style.display = unl ? "" : "none";

        let isCollapsed = sub === 0 && !!STATS_STATE.collapsed[i] && !q;
        if (caretEl) caretEl.textContent = isCollapsed ? "▶" : "▼";
        bodyEl.style.display = isCollapsed ? "none" : "";

        let finalBody = bodyHtml || `<div class="stats_empty">No matching stats in ${sEsc(secInfo.title)}.</div>`;
        if (force || STATS_STATE.lastSectionHTML[i] !== finalBody) {
            bodyEl.innerHTML = finalBody;
            STATS_STATE.lastSectionHTML[i] = finalBody;
        }
    }

    let filterEl = document.getElementById("all_stats_filter_count");
    if (filterEl) {
        let txt = q ? `Showing ${totalMatchedSections} matching section(s)` : "";
        if (STATS_STATE.lastFilterCount !== txt) {
            filterEl.textContent = txt;
            STATS_STATE.lastFilterCount = txt;
        }
    }
}
