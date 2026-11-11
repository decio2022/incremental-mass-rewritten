const SANDBOX_MAX_SLOG = 1e308;
const SANDBOX_MAX = Decimal.tetrate(10, SANDBOX_MAX_SLOG);
const SANDBOX_MAX_STR = "Fe308";

const SANDBOX_STATE = {
    query: "",
    category: "all",
    onlyCapped: false,
    builtKey: "",
    draftValues: {},
    draftCaps: {},
    feedback: {},
    lastValCache: {},
    lastGainCache: {},
    lastCapBtnCache: {},
    lastCapInfoCache: {},
    lastHeaderCache: "",
    globalCapInput: "Fe308",
    globalFeedback: "",
    capObjCache: {},
};

const SANDBOX_CATEGORIES = [
    { id: "all", label: "All Currencies" },
    { id: "Core", label: "Core" },
    { id: "Atom", label: "Atom & Dilation" },
    { id: "Supernova", label: "Supernova" },
    { id: "Galaxy", label: "Galaxy & Cluster" },
    { id: "Quantum", label: "Quantum" },
    { id: "Infinity & Eternity", label: "Inf & Et" },
    { id: "Exotic & Matters", label: "Exotic & Matters" },
    { id: "Nebula", label: "Nebula & Genesis" },
];

function sbSafe(fn, fallback = E(0)) {
    try {
        const v = fn();
        return (v === undefined || v === null) ? fallback : v;
    } catch (e) {
        return fallback;
    }
}

function sbIsFiniteDec(x) {
    if (x === undefined || x === null) return false;
    const d = E(x);
    return !Number.isNaN(d.mag) && !Number.isNaN(d.layer) && !Number.isNaN(d.sign)
        && Number.isFinite(d.mag) && Number.isFinite(d.layer) && Number.isFinite(d.sign);
}

function sbFormat(x, acc = 4) {
    if (typeof x === "number") {
        if (Number.isNaN(x)) return "NaN";
        if (!Number.isFinite(x)) return x < 0 ? "-Infinity" : "Infinity";
        return format(E(x), acc);
    }
    if (x === undefined || x === null) return "0";
    const d = E(x);
    if (Number.isNaN(d.mag) || Number.isNaN(d.layer) || Number.isNaN(d.sign)) return "NaN";
    if (d.mag === Infinity || d.layer === Infinity) return (d.sign < 0 ? "-" : "") + "Infinity";
    return format(d, acc);
}

function sbFormatMass(x) {
    if (!sbIsFiniteDec(x)) {
        const d = E(x || 0);
        if (d.mag === Infinity || d.layer === Infinity) return (d.sign < 0 ? "-" : "") + "Infinity";
        return "0.0000 u";
    }
    const d = E(x);
    if (d.lte(0) && player.mass_display == 3) return "0.0000 mlt";
    return formatMass(d);
}

function sbClampDec(d, maxDec = SANDBOX_MAX) {
    if (d === undefined || d === null) return E(0);
    const x = E(d);
    if (Number.isNaN(x.mag) || Number.isNaN(x.layer) || Number.isNaN(x.sign)) return E(0);
    if (x.sign < 0) return E(0);
    if (x.mag === Infinity || x.layer === Infinity || x.gt(maxDec)) return new Decimal(maxDec);
    return new Decimal(x);
}

function sbApplyPositiveTower(baseVal, height) {
    const h = Number(height);
    if (!Number.isFinite(h)) return { value: new Decimal(SANDBOX_MAX), clampedMax: true };
    if (h >= SANDBOX_MAX_SLOG) {
        return {
            value: new Decimal(SANDBOX_MAX),
            clampedMax: h > SANDBOX_MAX_SLOG || baseVal > 10,
        };
    }
    if (h < -2) return { value: E(0), clampedMax: false };
    const b = (Number.isFinite(baseVal) && baseVal > 1) ? baseVal : 10;
    const res = Decimal.tetrate(b, h);
    if (!sbIsFiniteDec(res) || res.gt(SANDBOX_MAX)) {
        return { value: new Decimal(SANDBOX_MAX), clampedMax: true };
    }
    return { value: res, clampedMax: false };
}

function parseSandboxDecimal(raw, opts = {}) {
    if (raw === undefined || raw === null) return { ok: false, error: "Empty input" };
    let s = String(raw).trim().replace(/,/g, "").replace(/\s+/g, "");
    if (!s) return { ok: false, error: "Empty input" };
    if (s[0] === "+") s = s.slice(1);
    if (!s) return { ok: false, error: "Empty input" };
    if (s[0] === "-") {
        if (/^-0(?:\.0+)?$/.test(s)) s = "0";
        else return { ok: false, error: "Value must be >= 0" };
    }

    const isNum = !!opts.isNumber;
    const finalize = (d, preClamped = false) => {
        if (!d || Number.isNaN(d.mag) || Number.isNaN(d.layer) || Number.isNaN(d.sign)) {
            return { ok: false, error: "Invalid number" };
        }
        if (d.sign < 0) return { ok: false, error: "Value must be >= 0" };
        let clampedMax = !!preClamped;
        let out = new Decimal(d);
        if (out.mag === Infinity || out.layer === Infinity || out.gt(SANDBOX_MAX)) {
            out = new Decimal(SANDBOX_MAX);
            clampedMax = true;
        }
        if (isNum) {
            const n = out.toNumber();
            if (!Number.isFinite(n) || n > 1e308) {
                out = E(1e308);
                clampedMax = true;
            } else {
                out = E(Math.floor(Math.max(0, n)));
            }
        }
        return { ok: true, value: out, clampedMax };
    };

    const lower = s.toLowerCase();
    if (lower === "inf" || lower === "infinity" || lower === "einf") {
        return finalize(SANDBOX_MAX, true);
    }

    // Break Eternity serialized string: (e^layer)mag
    const beMatch = s.match(/^\(e\^([^)]+)\)(.+)$/i);
    if (beMatch) {
        const layerNum = Number(beMatch[1]);
        const magNum = Number(beMatch[2]);
        if (!Number.isFinite(magNum) || Number.isNaN(layerNum) || layerNum < 0 || magNum < 0) {
            return { ok: false, error: "Invalid Break Eternity literal" };
        }
        if (!Number.isFinite(layerNum) || layerNum > SANDBOX_MAX_SLOG) {
            return finalize(SANDBOX_MAX, true);
        }
        const dec = Decimal.fromComponents(1, layerNum, magNum);
        return finalize(dec, dec.gt(SANDBOX_MAX));
    }

    // Tetration: [coeff]F[height], e.g. Fe308, F1e308, F100, 2.5F10
    const fMatch = s.match(/^(\d+(?:\.\d+)?)?[fF](.+)$/);
    if (fMatch) {
        const coeff = fMatch[1] ? Number(fMatch[1]) : 1;
        let hStr = fMatch[2];
        if (!Number.isFinite(coeff) || coeff <= 0) return { ok: false, error: "Invalid F notation" };
        if (/^[eE][+-]?\d/.test(hStr)) hStr = "1" + hStr;
        const hParsed = parseSandboxDecimal(hStr, { isNumber: false });
        if (!hParsed.ok) return { ok: false, error: "Invalid F exponent" };
        const hDec = hParsed.value;
        const offset = fMatch[1] ? Math.log10(coeff) : 0;
        if (hDec.gt(SANDBOX_MAX_SLOG)) {
            return finalize(SANDBOX_MAX, true);
        }
        const hNum = hDec.toNumber() + offset;
        const { value, clampedMax } = sbApplyPositiveTower(10, hNum);
        return finalize(value, clampedMax || hParsed.clampedMax);
    }

    // Arrow tetration: base^^height, e.g. 10^^1e308, 10^^5
    const arrowMatch = s.match(/^(\d+(?:\.\d+)?)\^\^(.+)$/);
    if (arrowMatch) {
        const base = Number(arrowMatch[1]);
        let hStr = arrowMatch[2];
        if (!Number.isFinite(base) || base <= 1) return { ok: false, error: "Tetration base must be > 1" };
        if (/^[eE][+-]?\d/.test(hStr)) hStr = "1" + hStr;
        const hParsed = parseSandboxDecimal(hStr, { isNumber: false });
        if (!hParsed.ok) return { ok: false, error: "Invalid ^^ height" };
        if (hParsed.value.gt(SANDBOX_MAX_SLOG)) return finalize(SANDBOX_MAX, true);
        const { value, clampedMax } = sbApplyPositiveTower(base, hParsed.value.toNumber());
        return finalize(value, clampedMax || hParsed.clampedMax);
    }

    // Chained e notation: e100, ee84, eee12, 1.5e1e20, 2.5ee100, 1e-5
    if (s.toLowerCase().includes("e") && /^(?:\d+(?:\.\d+)?)?(?:[eE]+[+-]?\d+(?:\.\d+)?)+$/.test(s)) {
        // Check simple standard float/sci first when only one e and exponent fits safely
        const singleSci = s.match(/^(\d+(?:\.\d+)?)[eE]([+-]?\d+(?:\.\d+)?)$/);
        if (singleSci) {
            const mant = Number(singleSci[1]);
            const expVal = Number(singleSci[2]);
            if (Number.isFinite(mant) && Number.isFinite(expVal)) {
                if (expVal <= 300 && expVal >= -300) {
                    return finalize(new Decimal(s));
                }
                if (mant === 0) return finalize(E(0));
                return finalize(Decimal.pow(10, expVal).mul(mant));
            }
        }
        // Right-associative e chain (no negative inside multi-tower base)
        const parts = s.split(/[eE]/);
        const tokens = [];
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (p === "") {
                tokens.push(1);
            } else {
                const n = Number(p);
                if (!Number.isFinite(n)) return { ok: false, error: "Exponent overflow / invalid e chain" };
                tokens.push(n);
            }
        }
        // Evaluate right-to-left: [a, b, c] => a * 10^(b * 10^c)
        let acc = E(tokens[tokens.length - 1]);
        let clamped = false;
        for (let i = tokens.length - 2; i >= 0; i--) {
            const coeff = tokens[i];
            if (coeff === 0) {
                acc = E(0);
                continue;
            }
            if (coeff < 0) return { ok: false, error: "Negative factor in exponent chain" };
            if (acc.gt(SANDBOX_MAX) || !sbIsFiniteDec(acc)) {
                acc = new Decimal(SANDBOX_MAX);
                clamped = true;
                continue;
            }
            acc = Decimal.pow(10, acc).mul(coeff);
            if (!sbIsFiniteDec(acc) || acc.gt(SANDBOX_MAX)) {
                acc = new Decimal(SANDBOX_MAX);
                clamped = true;
            }
        }
        return finalize(acc, clamped);
    }

    // Pure numeric literal
    if (/^\d+(?:\.\d+)?$/.test(s)) {
        try {
            return finalize(new Decimal(s));
        } catch (e) {
            return { ok: false, error: "Invalid number" };
        }
    }

    return { ok: false, error: "Invalid format (use e.g. 1e100, ee50, Fe308, 10^^1e308)" };
}

class FormulaBuilder {
    constructor(baseLabel, baseExpr, baseVal, isMass = false) {
        if (baseVal !== undefined) {
            const vStr = isMass ? sbFormatMass(baseVal) : sbFormat(baseVal);
            this.expr = `${baseExpr} (${vStr})`;
            this.full = `${baseLabel}: ${baseExpr} [= ${vStr}]`;
        } else {
            this.expr = baseExpr;
            this.full = `${baseLabel}: ${baseExpr}`;
        }
    }
    add(label, val, isMass = false) {
        if (val === undefined || val === null) return this;
        const d = E(val);
        if (!sbIsFiniteDec(d) || d.eq(0)) return this;
        const s = isMass ? sbFormatMass(d) : sbFormat(d);
        this.expr = `(${this.expr} + ${s})`;
        this.full = `(${this.full} + ${s} [${label}])`;
        return this;
    }
    sub(label, val, isMass = false) {
        if (val === undefined || val === null) return this;
        const d = E(val);
        if (!sbIsFiniteDec(d) || d.eq(0)) return this;
        const s = isMass ? sbFormatMass(d) : sbFormat(d);
        this.expr = `(${this.expr} - ${s})`;
        this.full = `(${this.full} - ${s} [${label}])`;
        return this;
    }
    mul(label, val) {
        if (val === undefined || val === null) return this;
        const d = E(val);
        if (!sbIsFiniteDec(d) || d.eq(1)) return this;
        const s = sbFormat(d);
        this.expr += ` × ${s}`;
        this.full += ` × ${s} [${label}]`;
        return this;
    }
    div(label, val) {
        if (val === undefined || val === null) return this;
        const d = E(val);
        if (!sbIsFiniteDec(d) || d.eq(1) || d.eq(0)) return this;
        const s = sbFormat(d);
        this.expr += ` / ${s}`;
        this.full += ` / ${s} [${label}]`;
        return this;
    }
    pow(label, val) {
        if (val === undefined || val === null) return this;
        const d = E(val);
        if (!sbIsFiniteDec(d) || d.eq(1)) return this;
        const s = sbFormat(d);
        this.expr = `(${this.expr})^${s}`;
        this.full = `(${this.full})^${s} [${label}]`;
        return this;
    }
    root(label, val) {
        if (val === undefined || val === null) return this;
        const d = E(val);
        if (!sbIsFiniteDec(d) || d.eq(1) || d.eq(0)) return this;
        const s = sbFormat(d);
        this.expr = `(${this.expr})^(1/${s})`;
        this.full = `(${this.full})^(1/${s}) [${label}]`;
        return this;
    }
    expMult(label, p) {
        if (p === undefined || p === null) return this;
        const d = E(p);
        if (!sbIsFiniteDec(d) || d.eq(1)) return this;
        const s = sbFormat(d);
        this.expr = `expMult(${this.expr}, ^${s})`;
        this.full = `expMult(${this.full}, ^${s} [${label}])`;
        return this;
    }
    softcap(label, start, power) {
        const s = sbFormat(start);
        const p = sbFormat(power);
        this.expr += ` [SC@${s}^${p}]`;
        this.full += ` -> softcap(${label}: start ${s}, pow ${p})`;
        return this;
    }
    overflow(label, start, power) {
        const s = sbFormat(start);
        const p = sbFormat(power);
        this.expr += ` [OF@${s}^${p}]`;
        this.full += ` -> overflow(${label}: start ${s}, pow ${p})`;
        return this;
    }
    gc(nerf) {
        const n = sbFormat(nerf, 2);
        this.expr = `10^^(slog(${this.expr})-${n})`;
        this.full = `GC(10^^(slog(${this.full}) - ${n}))`;
        return this;
    }
    gs(gsVal) {
        if (gsVal === undefined || gsVal === null) return this;
        const d = E(gsVal);
        if (!sbIsFiniteDec(d) || d.eq(1)) return this;
        const s = sbFormat(d);
        this.expr += ` × ${s} (GS)`;
        this.full += ` × ${s} [Pre-QU Global Speed]`;
        return this;
    }
    note(txt) {
        this.expr += ` (${txt})`;
        this.full += ` [${txt}]`;
        return this;
    }
    done(suffix = "/sec") {
        return { expr: this.expr + suffix, full: this.full + (suffix ? " " + suffix : "") };
    }
}

function sbBuildPreQUGSFormula() {
    const f = new FormulaBuilder("Base", "1");
    if (tmp.qu?.mil_reached?.[1]) f.mul("QU Milestone 2", 10);
    if (quUnl()) f.mul("Blueprint Eff", tmp.qu.bpEff);
    if (hasElement(103) && !hasChargedElement(103)) f.mul("Elem 103", tmp.elements.effect[103]);
    if (hasTree("qc5")) f.mul("Tree qc5", sbSafe(() => treeEff("qc5"), 1));
    if (hasPrestige(0, 60)) f.mul("Prestige 60", sbSafe(() => prestigeEff(0, 60, [E(1), E(1)])[0], 1));
    if (hasUpgrade("inf", 9)) f.mul("Inf Upg 9", sbSafe(() => upgEffect(5, 9), 1));
    if (hasElement(136)) f.mul("Elem 136", tmp.elements.effect[136]);
    if (player.ranks.hept.gte(6)) f.mul("Hept 6", player.ranks.hept.add(1));
    f.mul("Galaxy Speed", sbSafe(() => SUPERNOVA_GALAXY.effects.pqgs(), 1));
    if (player.mainUpg.br.includes(3)) f.pow("BR Upg 3", tmp.upgs?.main?.[4]?.[3]?.effect || 1);
    if (hasPrestige(0, 5)) f.pow("Prestige 5", 2);
    f.pow("Timeshards", sbSafe(() => calcShardsEffect(), 1));
    if (hasChargedElement(103)) f.pow("Charged Elem 103", tmp.elements.ceffect[103]);
    if (QCs.active()) f.div("QC1 Nerf", tmp.qu?.qc_eff?.[1] || 1);
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    if ((player.gc.active || player.chal.active >= 21) && hasElement(423)) f.add("Elem 423", 1);
    if (CHALS.inChal(20) && !hasElement(558)) f.note("capped ee50 in C20");
    return f.done("");
}

function sbBuildMassFormula() {
    const gs = sbSafe(() => tmp.preQUGlobalSpeed, E(1));
    const u1 = sbSafe(() => tmp.upgs?.mass?.[1]?.eff?.eff, E(1));
    const f = new FormulaBuilder("Base + Muscler", `1 + ${sbFormat(u1)}`);
    if (player.ranks.rank.gte(6)) f.mul("Rank 6", sbSafe(() => RANKS.effect.rank[6](), 1));
    if (player.ranks.rank.gte(13)) f.mul("Rank 13", 3);
    const tsEff = sbSafe(() => tmp.tickspeedEffect?.eff, E(1));
    f.mul("Tickspeed", tsEff);
    if (player.bh.unl) f.mul("Black Hole", sbSafe(() => tmp.bh?.effect, 1));
    if (player.mainUpg.bh.includes(10)) f.mul("BH Upg 10", tmp.upgs?.main?.[2]?.[10]?.effect || 1);
    const nEff2 = sbSafe(() => tmp.atom?.particles?.[1]?.powerEffect?.eff2, E(1));
    if (!hasElement(355)) f.mul("Neutron Eff 2", nEff2);
    if (player.ranks.rank.gte(380)) f.mul("Rank 380", sbSafe(() => RANKS.effect.rank[380](), 1));
    f.mul("Stars Eff", sbSafe(() => tmp.stars?.effect, 1));
    if (hasTree("m1")) f.mul("Tree m1", tmp.supernova?.tree_eff?.m1 || 1);
    f.mul("W+ Boson", tmp.bosons?.effect?.pos_w?.[0] || 1);
    f.mul("Galaxy Speed", sbSafe(() => SUPERNOVA_GALAXY.effects.pqgs(), 1));
    const pEff1 = sbSafe(() => tmp.atom?.particles?.[0]?.powerEffect?.eff1, E(1));
    if (!hasElement(105)) f.mul("Proton Eff 1", pEff1);
    else f.pow("Proton Eff 1 (e105)", pEff1);
    if (!hasElement(134)) f.mul("Tickspeed x2", tsEff);
    else f.pow("Tickspeed (e134)", tsEff);
    if (hasElement(355)) f.pow("Neutron Eff 2 (e355)", nEff2);
    if (player.ranks.tier.gte(2)) f.pow("Tier 2", 1.15);
    if (player.ranks.rank.gte(180)) f.pow("Rank 180", 1.025);
    if (player.chal.active != 3) f.pow("C3 Reward", tmp.chal?.eff?.[3] || 1);
    if (player.md.active || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("02") || FERMIONS.onActive("03") || CHALS.inChal(11)) {
        f.expMult("Dilation Penalty", tmp.md?.pen || 1);
        if (hasElement(28)) f.pow("Elem 28", 1.5);
    } else if (hasElement(28) && player.ranks.hex.gte(28)) {
        f.pow("Hex 28 + e28", 1.5);
    }
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    if (player.ranks.hex.gte(36)) f.pow("Hex 36 Star Pow", tmp.stars?.effectPower || 1);
    if (hasUpgrade("bh", 19)) f.pow("BH Upg 19", tmp.upgs?.main?.[2]?.[19]?.effect || 1);
    if (hasUpgrade("br", 20)) f.pow("BR Upg 20", tmp.upgs?.main?.[4]?.[20]?.effect || 1);
    if (hasElement(213)) f.pow("Elem 213 (C20)", tmp.chal?.eff?.[20] || 1);
    if (hasChargedElement(18)) f.pow("Charged e18", tmp.elements.effect[18] || 1);
    if (hasChargedElement(28)) f.pow("Charged e28", tmp.elements.ceffect[28] || 1);
    f.pow("Gal Fermion 2-2", tmp.fermions?.effs?.[2]?.[2] || 1);
    f.pow("Galactic Power", sbSafe(() => SUPERNOVA_GALAXY.galPow0_eff(), 1));
    if (CHALS.inChal(9) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("12")) f.expMult("C9/F12 Nerf", 0.9);
    const rawGain = sbSafe(() => tmp.massGain, E(0));
    if (rawGain.gte(tmp.massSoftGain || EINF) && player.ranks.hex.lt(1)) f.softcap("Softcap 1", tmp.massSoftGain, tmp.massSoftPower);
    if (rawGain.gte(tmp.massSoftGain2 || EINF) && player.ranks.hex.lt(4)) f.softcap("Softcap 2", tmp.massSoftGain2, tmp.massSoftPower2);
    if (rawGain.gte(tmp.massSoftGain3 || EINF) && player.ranks.hex.lt(8)) f.softcap("Softcap 3", tmp.massSoftGain3, tmp.massSoftPower3);
    if (rawGain.gte(tmp.massSoftGain4 || EINF) && player.ranks.hex.lt(13)) f.softcap("Softcap 4", tmp.massSoftGain4, tmp.massSoftPower4);
    if (rawGain.gte(tmp.massSoftGain5 || EINF) && player.ranks.hex.lt(21)) f.softcap("Softcap 5", tmp.massSoftGain5, tmp.massSoftPower5);
    if (rawGain.gte(tmp.massSoftGain6 || EINF) && player.ranks.hex.lt(33)) f.softcap("Softcap 6", tmp.massSoftGain6, tmp.massSoftPower6);
    if (rawGain.gte(tmp.massSoftGain7 || EINF) && player.ranks.hex.lt(54)) f.softcap("Softcap 7", tmp.massSoftGain7, tmp.massSoftPower7);
    if (rawGain.gte(tmp.massSoftGain8 || EINF) && player.ranks.hex.lt(64)) f.softcap("Softcap 8", tmp.massSoftGain8, tmp.massSoftPower8);
    if (rawGain.gte(tmp.massSoftGain9 || EINF) && player.ranks.hex.lt(75)) f.softcap("Softcap 9", tmp.massSoftGain9, tmp.massSoftPower9);
    if (hasElement(117)) f.pow("Elem 117", 10);
    if (hasChargedElement(51)) f.expMult("Charged e51", 1.005);
    if (hasChargedElement(117)) f.expMult("Charged e117", 1.01);
    if (hasElement(503)) f.expMult("Elem 503", tmp.fermions?.effs2?.[2]?.[2] || 1);
    if (hasElement(530)) f.expMult("Elem 530", tmp.stars?.effectExpPower || 1);
    if (CHALS.inChal(20)) {
        f.expr = `log10(${f.expr} + 1)`;
        f.full = `log10(${f.full} + 1) [C20]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    if (!hasUpgrade("exotic", 1) && rawGain.gte(tmp.massOverflowStart || EINF)) {
        f.overflow("Mass Overflow", tmp.massOverflowStart, tmp.massOverflowPower);
    }
    f.gs(gs);
    return f.done("/sec");
}

function sbBuildRPFormula() {
    if (player.mass.lt(1e15) || CHALS.inChal(7) || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19)) {
        return {
            expr: "0 (req 1e15 g, inactive in C7/10/14/19)",
            full: "0 — Requires >= 1e15 g Mass and not in C7/C10/C14/C19",
            inactive: true,
        };
    }
    const f = new FormulaBuilder("Base", "(mass / 1e15)^(1/3)", player.mass.div(1e15).root(3));
    if (player.ranks.rank.gte(14)) f.mul("Rank 14", 2);
    if (player.ranks.rank.gte(45)) f.mul("Rank 45", sbSafe(() => RANKS.effect.rank[45](), 1));
    if (player.ranks.tier.gte(6)) f.mul("Tier 6", sbSafe(() => RANKS.effect.tier[6](), 1));
    if (player.mainUpg.bh.includes(6)) f.mul("BH Upg 6", tmp.upgs?.main?.[2]?.[6]?.effect || 1);
    if (hasTree("rp1")) f.mul("Tree rp1", tmp.supernova?.tree_eff?.rp1 || 1);
    const n1 = sbSafe(() => tmp.atom?.particles?.[1]?.powerEffect?.eff1, E(1));
    if (!hasElement(105)) f.mul("Neutron Eff 1", n1);
    else f.pow("Neutron Eff 1 (e105)", n1);
    if (player.mainUpg.bh.includes(8)) f.pow("BH Upg 8", 1.15);
    f.pow("C4 Reward", tmp.chal?.eff?.[4] || 1);
    if (CHALS.inChal(4) || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("03")) f.root("C4/F03", 10);
    f.pow("Primordium Beta", tmp.prim?.eff?.[1]?.[0] || 1);
    f.pow("Galaxy RP", sbSafe(() => SUPERNOVA_GALAXY.effects.rp(), 1));
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    f.pow("Gal Fermion 2-3", tmp.fermions?.effs?.[2]?.[3] || 1);
    if (hasElement(479)) f.pow("Elem 479 (GalPow0)", sbSafe(() => SUPERNOVA_GALAXY.galPow0_eff(), 1));
    if (hasElement(348)) {
        const e348 = E(2).pow(player.chal.comps[7].mul((tmp.chal?.eff?.[7] || E(1)).add(1).log10()).pow(0.625).add(1));
        f.pow("Elem 348", e348);
    }
    if (hasUpgrade("exotic", 10)) f.expMult("Rage Exotic Boost", tmp.ex?.exb_eff?.[0] || 1);
    if (hasElement(503)) f.expMult("Elem 503", tmp.fermions?.effs2?.[2]?.[3] || 1);
    if (player.md.active || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("02") || FERMIONS.onActive("03") || CHALS.inChal(11)) {
        f.expMult("Dilation Penalty", tmp.md?.pen || 1);
    }
    if (FERMIONS.onActive("23")) {
        f.expr = `log10(${f.expr} + 1)`;
        f.full = `log10(${f.full} + 1) [Gal Fermion 2-3 Active]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    const passive = player.mainUpg.bh.includes(6) || player.mainUpg.atom.includes(6);
    if (passive) f.gs(tmp.preQUGlobalSpeed);
    return f.done(passive ? "/sec" : " on reset");
}

function sbBuildDMFormula() {
    const useMass = CHALS.inChal(7) || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19);
    const base = useMass ? player.mass.div(1e180) : player.rp.points.div(1e20);
    if (base.lt(1)) {
        return {
            expr: useMass ? "0 (req 1e180 g)" : "0 (req 1e20 RP)",
            full: useMass ? "0 — Requires >= 1e180 g Mass (C7/10/14/19)" : "0 — Requires >= 1e20 Rage Power",
            inactive: true,
        };
    }
    const f = new FormulaBuilder("Base", useMass ? "(mass / 1e180)^(1/4)" : "(RP / 1e20)^(1/4)", base.root(4));
    if (hasTree("bh1")) f.mul("Tree bh1", tmp.supernova?.tree_eff?.bh1 || 1);
    if (hasElement(404)) f.pow("Photon Upg 1 (e404)", tmp.bosons?.upgs?.photon?.[0]?.effect || 1);
    else f.mul("Photon Upg 1", tmp.bosons?.upgs?.photon?.[0]?.effect || 1);
    if (useMass) f.root("C7/10/14/19", 6);
    const e1 = sbSafe(() => tmp.atom?.particles?.[2]?.powerEffect?.eff1, E(1));
    if (!hasElement(105)) f.mul("Electron Eff 1", e1);
    else f.pow("Electron Eff 1 (e105)", e1);
    if (CHALS.inChal(8) || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("12")) f.root("C8/F12", 8);
    f.pow("C8 Reward", tmp.chal?.eff?.[8] || 1);
    f.pow("Primordium Gamma", tmp.prim?.eff?.[2]?.[0] || 1);
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    if (hasUpgrade("exotic", 10)) f.expMult("DM Exotic Boost", tmp.ex?.exb_eff?.[1] || 1);
    if (player.md.active || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("02") || FERMIONS.onActive("03") || CHALS.inChal(11)) {
        f.expMult("Dilation Penalty", tmp.md?.pen || 1);
    }
    if (FERMIONS.onActive("32")) {
        f.expr = `log10(${f.expr} + 1)^5`;
        f.full = `log10(${f.full} + 1)^5 [Gal Fermion 3-2]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    const passive = player.mainUpg.atom.includes(6);
    if (passive) f.gs(tmp.preQUGlobalSpeed);
    return f.done(passive ? "/sec" : " on reset");
}

function sbBuildBHFormula() {
    if (player.chal.active == 22) return { expr: "0 (C22)", full: "0 — Disabled in Challenge 22", inactive: true };
    const fBase = sbSafe(() => tmp.bh?.f, E(1));
    const condEff = sbSafe(() => tmp.bh?.condenser_eff?.eff, E(1));
    const mp = sbSafe(() => tmp.bh?.massPowerGain, E(0.33));
    const f = new FormulaBuilder("Base", `(bhMass + 1)^${sbFormat(mp)} × ${sbFormat(condEff)}`, fBase.mul(condEff));
    if (player.mainUpg.rp.includes(11)) f.mul("RP Upg 11", tmp.upgs?.main?.[1]?.[11]?.effect || 1);
    if (player.mainUpg.bh.includes(14)) f.mul("BH Upg 14", tmp.upgs?.main?.[2]?.[14]?.effect || 1);
    if (hasElement(46) && !player.ranks.hex.gte(46)) f.mul("Elem 46", tmp.elements.effect[46] || 1);
    if (hasElement(404)) f.pow("Photon Upg 1 (e404)", tmp.bosons?.upgs?.photon?.[0]?.effect || 1);
    else f.mul("Photon Upg 1", tmp.bosons?.upgs?.photon?.[0]?.effect || 1);
    if (CHALS.inChal(8) || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("12")) f.root("C8/F12", 8);
    f.pow("C8 Reward", tmp.chal?.eff?.[8] || 1);
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    if (hasElement(46) && player.ranks.hex.gte(46)) f.pow("Hex 46 + e46", tmp.elements.effect[46] || 1);
    f.pow("Galaxy BH", sbSafe(() => SUPERNOVA_GALAXY.effects.bh(), 1));
    f.pow("Gal Dark Energy", sbSafe(() => SUPERNOVA_GALAXY.galPow2_eff(), 1));
    if (player.ranks.enne.gte(200)) f.expMult("Enne 200", tmp.ex?.exb_eff?.[1] || 1);
    if (player.md.active || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("02") || FERMIONS.onActive("03") || CHALS.inChal(11)) {
        f.expMult("Dilation Penalty", tmp.md?.pen || 1);
    }
    const g = sbSafe(() => tmp.bh?.mass_gain, E(0));
    if (g.gte(tmp.bh?.massSoftGain || EINF)) f.softcap("BH Softcap", tmp.bh.massSoftGain, tmp.bh.massSoftPower);
    if (FERMIONS.onActive("31")) {
        f.expr = `log10(${f.expr} + 1)^100`;
        f.full = `log10(${f.full} + 1)^100 [Gal Fermion 3-1]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    if (!hasElement(327) && g.gte(tmp.bhOverflowStart || EINF)) {
        f.overflow("BH Overflow 1", tmp.bhOverflowStart, CHALS.inChal(19) ? 0.04 : CHALS.inChal(15) ? 0.05 : (hasElement(262) ? 0.9 : hasElement(241) ? 0.82 : hasUpgrade("bh", 20) ? 0.81 : 0.8));
    }
    if (player.bh.unl && !player.qu.en.hr[0]) f.gs(tmp.preQUGlobalSpeed);
    else if (!player.bh.unl) f.note("BH locked");
    else if (player.qu.en.hr[0]) f.note("Paused: Evaporating for HR");
    return f.done("/sec");
}

function sbBuildAtomFormula() {
    if (CHALS.inChal(12) || CHALS.inChal(14) || CHALS.inChal(19)) {
        return { expr: "0 (inactive in C12/14/19)", full: "0 — Disabled in C12/C14/C19", inactive: true };
    }
    const useC22 = CHALS.inChal(22) && hasElement(482);
    const reqDiv = player.mainUpg.br.includes(1) ? 1.5e156 ** 0.5 : 1.5e156;
    const base = useC22 ? player.mass.add(10).log10() : player.bh.mass.div(reqDiv);
    if (base.lt(1)) {
        return {
            expr: useC22 ? "0 (req mass)" : `0 (req ${sbFormatMass(reqDiv)} BH)`,
            full: `0 — Requires >= ${sbFormatMass(reqDiv)} BH Mass`,
            inactive: true,
        };
    }
    const f = new FormulaBuilder(
        "Base",
        useC22 ? "log10(mass + 10)" : `(bhMass / ${sbFormat(reqDiv)})^(1/5)`,
        useC22 ? base : base.root(5)
    );
    if (player.mainUpg.rp.includes(15)) f.mul("RP Upg 15", tmp.upgs?.main?.[1]?.[15]?.effect || 1);
    if (hasElement(404)) f.pow("Gluon Upg 1 (e404)", tmp.bosons?.upgs?.gluon?.[0]?.effect || 1);
    else f.mul("Gluon Upg 1", tmp.bosons?.upgs?.gluon?.[0]?.effect || 1);
    if (hasElement(17)) f.pow("Elem 17", 1.1);
    if (player.ranks.hex.gte(17)) f.pow("Hex 17", 1.1);
    f.pow("Primordium Delta", tmp.prim?.eff?.[3]?.[0] || 1);
    if (hasElement(111)) f.pow("Elem 111", tmp.elements.effect[111] || 1);
    if (hasUpgrade("exotic", 11)) f.expMult("Atom Exotic Boost", tmp.ex?.exb_eff?.[2] || 1);
    if (hasChargedElement(17)) f.expMult("Charged e17", 1.01);
    if (hasChargedElement(47)) f.expMult("Charged e47", 1.02);
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    if (FERMIONS.onActive("10")) f.expMult("F10 Nerf", 0.625);
    if (FERMIONS.onActive("34")) {
        f.expr = `log10(${f.expr} + 1)^3000`;
        f.full = `log10(${f.full} + 1)^3000 [Gal Fermion 3-4]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    const passive = hasElement(24);
    if (passive) f.gs(tmp.preQUGlobalSpeed);
    return f.done(passive ? "/sec" : " on atom reset");
}

function sbBuildAtomicFormula() {
    const cr = sbSafe(() => tmp.atom?.gamma_ray_eff?.eff, E(0));
    if (cr.lte(0)) return { expr: "0 (buy Cosmic Ray)", full: "0 — Cosmic Ray Effect = 0", inactive: true };
    const f = new FormulaBuilder("Cosmic Ray Eff", sbFormat(cr));
    if (hasElement(3)) f.mul("Elem 3", tmp.elements.effect[3] || 1);
    if (hasElement(52)) f.mul("Elem 52", tmp.elements.effect[52] || 1);
    if (hasElement(404)) f.pow("Gluon Upg 1 (e404)", tmp.bosons?.upgs?.gluon?.[0]?.effect || 1);
    else f.mul("Gluon Upg 1", tmp.bosons?.upgs?.gluon?.[0]?.effect || 1);
    f.pow("Gal Fermion 2-0", tmp.fermions?.effs?.[2]?.[0] || 1);
    if (hasChargedElement(52)) f.pow("Charged e52", tmp.elements.effect[52] || 1);
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    if (hasElement(503)) f.expMult("Elem 503", tmp.fermions?.effs2?.[2]?.[0] || 1);
    if (FERMIONS.onActive("00")) f.expMult("F00 Nerf", 0.6);
    if (player.md.active || CHALS.inChal(10) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("02") || FERMIONS.onActive("03") || CHALS.inChal(11)) {
        f.expMult("Dilation Penalty", tmp.md?.pen || 1);
    }
    if (FERMIONS.onActive("20")) {
        f.expr = `log10(${f.expr} + 1)`;
        f.full = `log10(${f.full} + 1) [Gal Fermion 2-0]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    if (!hasUpgrade("atom", 24) && sbSafe(() => tmp.atom?.atomicGain, E(0)).gte("e1e3000")) {
        f.overflow("Atomic Overflow", "e1e3000", 0.8);
    }
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildQuarksFormula() {
    const ag = sbSafe(() => tmp.atom?.gain, E(0));
    if (ag.lt(1)) return { expr: "0 (Atom gain < 1)", full: "0 — Requires Atom gain >= 1", inactive: true };
    let baseDesc = "log10(atomGain)^1.1 + 1";
    let baseVal = ag.max(1).log10().pow(1.1).add(1);
    if (hasElement(1)) {
        const b = player.ranks.hex.gte(1) ? 1.5 : 1.25;
        const p = hasUpgrade("atom", 21) ? 1.1 : 1;
        baseDesc = `${b}^(log10(atomGain)${p === 1 ? "" : "^1.1"})`;
        baseVal = E(b).pow(ag.max(1).log10().pow(p));
    }
    const f = new FormulaBuilder("Base", baseDesc, baseVal);
    if (player.mainUpg.bh.includes(13)) f.mul("BH Upg 13", 10);
    if (player.mainUpg.atom.includes(8)) f.mul("Atom Upg 8", tmp.upgs?.main?.[3]?.[8]?.effect || 1);
    if (player.ranks.rank.gte(300)) f.mul("Rank 300", sbSafe(() => RANKS.effect.rank[300](), 1));
    if (hasElement(6)) f.mul("Elem 6", tmp.elements.effect[6] || 1);
    if (hasElement(42)) f.mul("Elem 42", tmp.elements.effect[42] || 1);
    if (hasElement(67)) f.mul("Elem 67", tmp.elements.effect[67] || 1);
    if (player.md.upgs[6].gte(1)) f.mul("MD Upg 7", tmp.md?.upgs?.[6]?.eff || 1);
    f.mul("MD Upg 10", tmp.md?.upgs?.[9]?.eff || 1);
    if (hasElement(47)) f.pow("Elem 47", 1.1);
    if (player.ranks.hex.gte(47)) f.pow("Hex 47", 1.1);
    if (hasPrestige(1, 7)) f.pow("Honor 7", sbSafe(() => prestigeEff(1, 7), 1));
    if (hasElement(67) && (player.ranks.hex.gte(67) || hasChargedElement(67))) f.pow("Hex/Charged e67", tmp.elements.effect[67] || 1);
    f.pow("Gal Atoms", sbSafe(() => SUPERNOVA_GALAXY.galPow1_eff(), 1));
    if (hasElement(231)) f.pow("Elem 231", tmp.elements.effect[231] || 1);
    if (hasChargedElement(42)) f.pow("Charged e42", tmp.elements.effect[42] || 1);
    if (hasElement(363)) f.expMult("Elem 363 Exotic", tmp.ex?.exb_eff?.[2] || 1);
    if (hasChargedElement(1)) f.expMult("Charged e1", 1.01);
    if (FERMIONS.onActive("30")) {
        f.expr = `log10(${f.expr} + 1)`;
        f.full = `log10(${f.full} + 1) [Gal Fermion 3-0]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    if (hasElement(14)) {
        f.mul("Quark/sec (e14)", tmp.atom?.quarkGainSec || 1);
        f.gs(tmp.preQUGlobalSpeed);
        return f.done("/sec");
    }
    return f.done(" on atom reset");
}

function sbBuildParticleFormula(i) {
    const blocked = CHALS.inChal(9) || CHALS.inChal(14) || CHALS.inChal(19) || FERMIONS.onActive("12");
    if (!hasElement(30)) {
        return { expr: "Manual assign from Quarks", full: "Assigned manually from Unassigned Quarks (Elem 30 unlocks passive +quarks/10 per sec)", inactive: true };
    }
    if (blocked) return { expr: "0 (blocked in C9/14/19/F12)", full: "0 — Auto-assign blocked in C9/C14/C19/F12", inactive: true };
    const f = new FormulaBuilder("Quarks/10", "quarks / 10", player.atom.quarks.div(10));
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildParticlePowFormula(i) {
    const names = ["Proton", "Neutron", "Electron"];
    const p = player.atom.particles[i];
    const eff = sbSafe(() => tmp.atom?.particles?.[i]?.effect, E(0));
    const f = new FormulaBuilder(`${names[i]} Eff`, `${sbFormat(p)}^exp [= ${sbFormat(eff)}]`);
    if (player.mainUpg.atom.includes(7)) f.mul("Atom Upg 7", tmp.upgs?.main?.[3]?.[7]?.effect || 1);
    if (QCs.active()) f.pow("QC4 Nerf", tmp.qu?.qc_eff?.[4] || 1);
    f.pow(`Gal ${names[i]}s`, player.galParticles[i].add(1).log10().add(1).pow(3));
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildMDParticlesFormula() {
    const pen = sbSafe(() => tmp.md?.pen, E(0.8));
    const baseMass = player.md.active ? player.mass : (hasTree("qol3") ? expMult(player.mass, pen) : E(0));
    if (!player.md.active && !hasTree("qol3")) {
        return { expr: "0 (dilate mass to gain; qol3 for passive)", full: "0 — Dilate Mass active or Tree qol3 required", inactive: true };
    }
    if (baseMass.lt(1e50)) {
        return { expr: "0 (req 1e50 g in dilation)", full: "0 — Requires >= 1e50 g Mass in Mass Dilation", inactive: true };
    }
    const f = new FormulaBuilder("Base", `((log10(mass/1e50)/50)^${sbFormat(tmp.md?.rp_exp_gain || 1)} + 1) × ${sbFormat(tmp.md?.rp_mult_gain || 1)}`);
    f.gs(tmp.preQUGlobalSpeed);
    return f.done(player.md.active ? " on cancel" : "/sec (passive qol3)");
}

function sbBuildMDMassFormula() {
    if (!player.md.active && !hasTree("qol3")) {
        return { expr: "0 (inactive)", full: "0 — Requires Mass Dilation active or Tree qol3", inactive: true };
    }
    const f = new FormulaBuilder("RP", sbFormat(player.md.particles));
    f.mul("MD Upg 1", tmp.md?.upgs?.[0]?.eff || 1);
    if (hasElement(40)) f.mul("Elem 40", tmp.elements.effect[40] || 1);
    if (hasElement(37)) f.pow("Elem 37", tmp.elements.effect[37] || 1);
    if (player.ranks.hex.gte(37)) f.pow("Hex 37", tmp.elements.effect[37] || 1);
    if (hasElement(328)) f.pow("Elem 328", tmp.elements.effect[328] || 1);
    if (hasPrestige(0, 62)) f.pow("Prestige 62", sbSafe(() => prestigeEff(0, 62), 1));
    if (player.md.mass.gte(mlt(1e12)) && !hasElement(158)) f.softcap("DM Softcap", mlt(1e12), 0.1);
    if (sbSafe(() => tmp.md?.mass_gain, E(0)).gte("e5e28")) f.overflow("DM Overflow", "e5e28", hasUpgrade("atom", 23) ? 0.5 : 0.35);
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildBDEnergyFormula() {
    if (!player.md.break.active) return { expr: "0 (Break Dilation inactive)", full: "0 — Break Dilation must be active", inactive: true };
    const f = new FormulaBuilder("Base", "log10(dilatedMass/e3500 + 1)^0.5", player.md.mass.div("e3500").add(1).log10().sqrt());
    f.mul("BD Upg 6", tmp.bd?.upgs?.[5]?.eff || 1);
    if (hasUpgrade("br", 17)) f.mul("BR Upg 17", tmp.upgs?.main?.[4]?.[17]?.effect || 1);
    if (hasElement(173)) f.mul("Elem 173", tmp.elements.effect[173] || 1);
    if (!hasUpgrade("br", 9)) f.note("Need BR Upg 9 for passive/sec");
    return f.done("/sec");
}

function sbBuildBDMassFormula() {
    if (!player.md.break.active) return { expr: "0 (Break Dilation inactive)", full: "0 — Break Dilation must be active", inactive: true };
    const f = new FormulaBuilder("Energy", "(energy + 1)^2 - 1", player.md.break.energy.add(1).pow(2).sub(1));
    if (player.md.break.upgs[7].gte(1)) f.mul("BD Upg 8", tmp.bd?.upgs?.[7]?.eff || 1);
    if (player.md.break.upgs[8].gte(1)) f.mul("BD Upg 9", tmp.bd?.upgs?.[8]?.eff || 1);
    if (hasUpgrade("br", 18)) f.mul("BR Upg 18", tmp.upgs?.main?.[4]?.[18]?.effect || 1);
    return f.done("/sec");
}

function sbBuildStarsFormula() {
    if (!STARS.unlocked()) return { expr: "0 (Stars locked)", full: "0 — Unlock Stars first", inactive: true };
    const f = new FormulaBuilder("Star Gen 1", sbFormat(player.stars.generators[0]));
    if (player.md.upgs[8].gte(1)) f.mul("MD Upg 9", tmp.md?.upgs?.[8]?.eff || 1);
    if (hasPrestige(1, 1)) f.pow("Honor 1", 2);
    f.pow("Gal Fermion 3-0", tmp.fermions?.effs?.[3]?.[0] || 1);
    if (sbSafe(() => tmp.stars?.gain, E(0)).gte(tmp.stars?.softGain || EINF)) f.softcap("Star Softcap", tmp.stars.softGain, tmp.stars.softPower);
    if (hasUpgrade("exotic", 18)) f.expMult("Star Exotic Boost", tmp.ex?.exb_eff?.[3] || 1);
    if (hasChargedElement(36)) f.expMult("Charged e36", 1.1);
    if (hasTree("qp31")) f.expMult("Tree qp31", sbSafe(() => treeEff("qp31"), 1));
    if (hasElement(503)) f.expMult("Elem 503", tmp.fermions?.effs2?.[3]?.[0] || 1);
    if (FERMIONS.onActive("33")) {
        f.expr = `log10(${f.expr} + 1)`;
        f.full = `log10(${f.full} + 1) [Gal Fermion 3-3]`;
    }
    if (player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active) f.gc(tmp.gc?.nerf || 0);
    if (!hasUpgrade("exotic", 1) && sbSafe(() => tmp.stars?.gain, E(0)).gte("ee43")) f.overflow("Star Overflow", "ee43", tmp.starOverflowPower || 0.8);
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildStarGenFormula(i) {
    if (player.stars.unls <= i) return { expr: `0 (Gen ${i + 1} locked)`, full: `0 — Star Generator ${i + 1} locked`, inactive: true };
    let pow = E(1.5);
    if (FERMIONS.onActive("13")) pow = E(0.5);
    else {
        if (hasElement(50)) pow = pow.mul(1.05);
        if (player.ranks.hex.gte(50)) pow = pow.mul(1.05);
        if (hasTree("s3")) pow = pow.mul(tmp.supernova?.tree_eff?.s3 || 1);
    }
    if (QCs.active() && pow.gte(1)) pow = pow.pow(tmp.qu?.qc_eff?.[0]?.[1] || 1);
    const nextGen = player.stars.generators[i + 1] || E(0);
    const f = new FormulaBuilder("Base", `(1 + ${sbFormat(nextGen)})^${sbFormat(pow)}`, E(1).add(nextGen).pow(pow));
    if (hasElement(49) && i === 4) f.mul("Elem 49", tmp.elements.effect[49] || 1);
    if (hasTree("s1") && i === 4) f.mul("Tree s1", tmp.supernova?.tree_eff?.s1 || 1);
    if (player.md.upgs[8].gte(1)) f.mul("MD Upg 9", tmp.md?.upgs?.[8]?.eff || 1);
    if (hasElement(54) && !hasChargedElement(54)) f.mul("Elem 54", tmp.elements.effect[54] || 1);
    f.mul("Star Boost", tmp.stars?.generator_boost_eff || 1);
    if (hasChargedElement(54)) f.pow("Charged e54", tmp.elements.effect[54] || 1);
    if (hasElement(404)) f.pow("Photon Upg 4 (e404)", tmp.bosons?.upgs?.photon?.[3]?.effect || 1);
    else f.mul("Photon Upg 4", tmp.bosons?.upgs?.photon?.[3]?.effect || 1);
    if (hasPrestige(1, 1)) f.pow("Honor 1", 2);
    if (hasTree("qp36")) f.pow("Tree qp36", tmp.chal?.eff?.[20] || 1);
    if (hasUpgrade("atom", 22)) f.expMult("Atom Upg 22", 1.005);
    if (hasChargedElement(49)) f.expMult("Charged e49", 1.02);
    if (hasChargedElement(50)) f.expMult("Charged e50", 1.02);
    if (hasElement(444)) f.expMult("Elem 444 Exotic", tmp.ex?.exb_eff?.[3] || 1);
    if (QCs.active()) f.expMult("QC0 Nerf", tmp.qu?.qc_eff?.[0]?.[0] || 1);
    if (hasTree("qp33")) f.expMult("Tree qp33", sbSafe(() => treeEff("qp31"), 1));
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildPrestigeMassFormula() {
    if (player.prestiges[1].lt(10) || CHALS.inChal(16) || CHALS.inChal(19)) {
        return { expr: "0 (req Honor 10, inactive in C16/19)", full: "0 — Requires Honor 10 and not in C16/C19", inactive: true };
    }
    const f = new FormulaBuilder("Base", "log10(PBase+10) × P0^a × P1^b × ... / 400000");
    if (hasPrestige(2, 1)) f.pow("Glory", player.prestiges[2].div(10).add(1));
    if (hasPrestige(3, 30)) f.pow("Renown", player.prestiges[3].div(29));
    if (hasPrestige(4, 30)) f.pow("Valor", player.prestiges[4].div(29));
    if (hasChargedElement(145)) f.pow("Charged e145", 1.1);
    f.mul("Prestige Mass Upg 1", tmp.upgs?.prestigeMass?.[1]?.eff?.eff || 1);
    if (player.prestiges[2].gte(165)) f.mul("Prestige Tickspeed", tmp.prestigeTickspeedEffect?.eff || 1);
    f.mul("Prestige BH", sbSafe(() => prestigeBHEffect(), 1));
    return f.done("/sec");
}

function sbBuildPrestigeRPFormula() {
    if (player.prestiges[2].lt(165)) return { expr: "0 (req Glory 165)", full: "0 — Requires Glory 165", inactive: true };
    const p = player.prestigeMass.add(1).log10().div(20).pow(0.5);
    const f = new FormulaBuilder("Base", "10^(sqrt(log10(PMass+1)/20))", Decimal.pow(10, p));
    if (hasPrestige(4, 4)) f.mul("Valor 4", sbSafe(() => prestigeEff(4, 4, E(1)), 1));
    return f.done("/sec");
}

function sbBuildPrestigeBHFormula() {
    if (player.prestiges[3].lt(34)) return { expr: "0 (req Renown 34)", full: "0 — Requires Renown 34", inactive: true };
    const f = new FormulaBuilder("Base", "(log10(PMass+1)+1)^2 × (PBH+1)^0.33");
    if (player.prestiges[3].gte(37)) f.mul("Prestige BHC", tmp.prestigeBHCEffect?.eff || 1);
    return f.done("/sec");
}

function sbBuildPrestigeDMFormula() {
    if (player.prestiges[3].lt(37)) return { expr: "0 (req Renown 37)", full: "0 — Requires Renown 37", inactive: true };
    const p = player.prestigeRP.add(1).log10().div(20).pow(0.5).sub(3);
    const f = new FormulaBuilder("Base", "10^(sqrt(log10(PRP+1)/20) - 3)", Decimal.pow(10, p));
    if (player.ranks.enne.gte(1)) f.mul("Enne 1", 10);
    if (hasPrestige(4, 4)) f.mul("Valor 4", sbSafe(() => prestigeEff(4, 4, E(1)), 1));
    return f.done("/sec");
}

function sbBuildAscensionMassFormula() {
    if (player.ascensions[1].lt(3)) return { expr: "0 (req Transcension 3)", full: "0 — Requires Transcension Level 3", inactive: true };
    const f = new FormulaBuilder("Base", "log10(ABase+10) × A0^a × A1^b)^(A1/10)");
    if (hasAscension(2, 6)) f.pow("Recursion 6", player.ascensions[2].div(5));
    f.mul("Ascension Upg 1", tmp.upgs?.ascensionMass?.[1]?.eff?.eff || 1);
    return f.done("/sec");
}

function sbBuildSupernovaFormula() {
    const bulk = sbSafe(() => tmp.supernova?.bulk, E(0)).sub(player.supernova.times).max(0);
    const maxlim = sbSafe(() => tmp.supernova?.maxlimit, EINF);
    const passive = hasElement(291) || hasTree("qu_qol4");
    const f = new FormulaBuilder("Pending SN", `${sbFormat(bulk, 0)} (next at ${sbFormat(maxlim)} stars)`);
    if (hasElement(291)) f.note("Auto-gained passively (e291)");
    else if (hasTree("qu_qol4")) f.note("Auto-reset active (qu_qol4)");
    return f.done(passive ? " pending" : " on Supernova reset");
}

function sbBuildNeutronStarFormula() {
    if (player.supernova.times.lt(1) && !quUnl()) return { expr: "0 (Supernova locked)", full: "0 — Unlock Supernova first", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    if (hasTree("c")) f.mul("Tree c", tmp.supernova?.tree_eff?.c || 1);
    if (hasTree("sn1")) f.mul("Tree sn1", tmp.supernova?.tree_eff?.sn1 || 1);
    if (hasTree("sn2")) f.mul("Tree sn2", tmp.supernova?.tree_eff?.sn2 || 1);
    if (hasTree("sn3")) f.mul("Tree sn3", tmp.supernova?.tree_eff?.sn3 || 1);
    if (hasTree("bs3")) f.mul("Tree bs3", tmp.supernova?.tree_eff?.bs3 || 1);
    if (hasTree("sn5")) f.mul("Tree sn5", tmp.supernova?.tree_eff?.sn5 || 1);
    if (hasUpgrade("exotic", 12)) f.expMult("SN Exotic Boost", tmp.ex?.exb_eff?.[4] || 1);
    if (tmp.qu?.mil_reached?.[6]) f.mul("QU Milestone 7", E(5).pow(player.qu.times.min(50)));
    return f.done("/sec");
}

function sbBuildBosonFormula(key) {
    if (!player.supernova.post_10 && player.superGal.lt(1)) return { expr: "0 (req 10 SN)", full: "0 — Unlocked at 10 Supernovas", inactive: true };
    const gravSpeed = sbSafe(() => tmp.bosons?.effect?.graviton?.[0], E(1));
    const galPow3 = sbSafe(() => SUPERNOVA_GALAXY.galPow3_eff(), E(1));
    let f;
    if (key === "pos_w") {
        f = new FormulaBuilder("Base", "0.01", 0.01);
        f.mul("Z0 Eff 1", tmp.bosons?.effect?.z_boson?.[1] || 1);
        f.mul("W- Eff 1", tmp.bosons?.effect?.neg_w?.[1] || 1);
        f.mul("Graviton Speed", gravSpeed);
    } else if (key === "neg_w") {
        f = new FormulaBuilder("Base", "0.01", 0.01);
        f.mul("Z0 Eff 1", tmp.bosons?.effect?.z_boson?.[1] || 1);
        f.mul("W+ Eff 1", tmp.bosons?.effect?.pos_w?.[1] || 1);
        f.mul("Graviton Speed", gravSpeed);
    } else if (key === "z_boson") {
        f = new FormulaBuilder("Base", "0.01", 0.01);
        f.mul("Graviton Speed", gravSpeed);
    } else if (key === "photon" || key === "gluon") {
        f = new FormulaBuilder("Base", "0.01", 0.01);
        f.mul("Graviton Speed", gravSpeed);
        if (hasTree("bs2") && tmp.supernova?.tree_eff?.bs2) f.mul("Tree bs2", tmp.supernova.tree_eff.bs2[key === "photon" ? 0 : 1]);
        if (hasTree("bs4")) f.pow("Tree bs4", 1.5);
    } else if (key === "graviton") {
        f = new FormulaBuilder("Base", "0.01", 0.01);
        f.mul("Graviton Speed", gravSpeed);
        f.mul("Rad Boost 7", tmp.radiation?.bs?.eff?.[6] || 1);
    } else if (key === "hb") {
        f = new FormulaBuilder("Base", "0.01", 0.01);
        if (hasTree("bs1")) f.mul("Tree bs1", tmp.supernova?.tree_eff?.bs1 || 1);
        f.mul("Graviton Speed", gravSpeed);
        f.mul("Rad Boost 7", tmp.radiation?.bs?.eff?.[6] || 1);
    }
    if (hasPrestige(0, 77)) f.pow("Prestige 77", sbSafe(() => prestigeEff(0, 77), 1));
    f.pow("Gal Bosons", galPow3);
    if (player.qu.rip.active) f.mul("Big Rip", 1);
    return f.done("/sec");
}

function sbBuildFermionFormula(i) {
    if (!player.supernova.fermions.unl) return { expr: "0 (Fermions locked)", full: "0 — Unlock Fermions first", inactive: true };
    const f = new FormulaBuilder("Base", i === 0 ? "1" : "1");
    f.mul("Frequency Eff", tmp.radiation?.hz_effect || 1);
    if (hasTree("fn1")) f.mul("Tree fn1", tmp.supernova?.tree_eff?.fn1 || 1);
    if (hasTree("fn5") && i === 0) f.mul("Tree fn5", tmp.supernova?.tree_eff?.fn5 || 1);
    if (hasTree("fn6") && i === 1) f.mul("Tree fn6", tmp.supernova?.tree_eff?.fn6 || 1);
    f.pow("Gal U-Fermions", sbSafe(() => SUPERNOVA_GALAXY.galPow4_eff(), 1));
    return f.done("/sec");
}

function sbBuildRadHzFormula() {
    if (!hasTree("unl1")) return { expr: "0 (Radiation locked)", full: "0 — Requires Tree unl1", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    f.mul("Radio Eff", tmp.radiation?.ds_eff?.[0] || 1);
    if (hasTree("rad1")) f.mul("Tree rad1", tmp.supernova?.tree_eff?.rad1 || 1);
    if (player.ranks.pent.gte(2)) f.mul("Pent 2", sbSafe(() => RANKS.effect.pent[2](), 1));
    if (hasTree("rad6")) f.pow("Tree rad6", 1.25);
    f.pow("Gal Radiation", sbSafe(() => SUPERNOVA_GALAXY.galPow5_eff(), 1));
    if (player.qu.en.eth[0]) f.note("Paused: Evaporating for Enthalpy");
    else f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildRadDistFormula(x) {
    if (!hasTree("unl1") || (x > 0 && player.supernova.radiation.hz.lt(RADIATION.unls[x] || EINF))) {
        return { expr: "0 (wavelength locked)", full: "0 — Wavelength locked", inactive: true };
    }
    const f = new FormulaBuilder("Base", "1");
    if (x < 6) f.mul(`${RADIATION.names[x + 1]} Eff`, tmp.radiation?.ds_eff?.[x + 1] || 1);
    if (hasTree("rad2")) f.mul("Tree rad2", tmp.supernova?.tree_eff?.rad2 || 1);
    if (hasTree("rad3")) f.mul("Tree rad3", tmp.supernova?.tree_eff?.rad3 || 1);
    if (hasTree("rad4")) f.mul("Tree rad4", tmp.supernova?.tree_eff?.rad4 || 1);
    f.pow("Gal Radiation", sbSafe(() => SUPERNOVA_GALAXY.galPow5_eff(), 1));
    f.gs(tmp.preQUGlobalSpeed);
    return f.done("/sec");
}

function sbBuildGalPowFormula(i) {
    const names = ["Neutron Star", "Atoms", "Dark Matter", "Photon+Gluon", "U-Quark+U-Lepton", "Frequency", "Supernova Galaxies"];
    const reqs = [1, 1, 1, 3, 5, 7, 1];
    const isCluster = i === 6;
    if (isCluster ? player.superCluster.lt(1) : player.superGal.lt(reqs[i])) {
        return { expr: `0 (req ${reqs[i]} ${isCluster ? "SC" : "SG"})`, full: `0 — Requires ${reqs[i]} ${isCluster ? "Supernova Cluster" : "Supernova Galaxy"}`, inactive: true };
    }
    const f = new FormulaBuilder(`From ${names[i]}`, sbFormat(sbSafe(() => SUPERNOVA_GALAXY[`galPow${i}_gain`](), 0)));
    if (i < 6 && player.superCluster.gte(1)) f.mul("Galactic Mass Eff", sbSafe(() => SUPERNOVA_GALAXY.galPow6_eff(), 1));
    if (i === 0) f.pow("Galactic Shards", sbSafe(() => GSeffect(), 1));
    return f.done("/sec");
}

function sbBuildGalQkFormula() {
    if (player.superGal.lt(10)) return { expr: "0 (req 10 SG)", full: "0 — Requires 10 Supernova Galaxies", inactive: true };
    const f = new FormulaBuilder("Quark+U-Quark", "log10(quarks+1)×log10(uQuark+1)/1e5");
    if (player.superCluster.gte(15)) f.mul("Cluster 15 Eff", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
    if (player.superCluster.gte(21)) f.mul("Stellar Eff", sbSafe(() => SUPERNOVA_CLUSTER.stellarEff(), 1));
    if (hasElement(486)) f.mul("Purple Matter", sbSafe(() => MATTERS.eff(3), 1));
    return f.done("/sec");
}

function sbBuildGCShardFormula() {
    if (!hasElement(267)) return { expr: "0 (req Elem 267)", full: "0 — Requires Element 267", inactive: true };
    const pend = sbSafe(() => tmp.gc?.shards, E(0));
    const goal = sbSafe(() => GC.goal(), 1e6);
    const f = new FormulaBuilder("Potential Shards", `${sbFormat(pend)} (goal: ${sbFormat(goal)} SN @ D${player.gc.depth})`);
    return f.done(player.gc.active ? " on exit GC" : " (enter GC)");
}

function sbBuildStardustFormula() {
    if (player.superCluster.lt(14)) return { expr: "0 (req 14 SC)", full: "0 — Requires 14 Supernova Clusters", inactive: true };
    const f = new FormulaBuilder("Base", `log10(SN+1)^(${sbFormat(player.superCluster)}^${player.superCluster.gte(24) ? 0.6 : 0.5})`);
    if (hasElement(517)) f.mul("Elem 517 (Purple Matter)", sbSafe(() => MATTERS.eff(3), 1));
    if (hasAscension(2, 10)) f.mul("Recursion 10", sbSafe(() => ascensionEff(2, 10), 1));
    if (hasElement(554)) f.mul("Z Axions", player.exotic.ax[2].add(1));
    if (player.ranks.enne.gte(300)) f.mul("Enne 300", sbSafe(() => RANKS.effect.enne[300](), 1));
    return f.done("/sec");
}

function sbBuildStellarFormula() {
    if (player.superCluster.lt(21)) return { expr: "0 (req 21 SC)", full: "0 — Requires 21 Supernova Clusters", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    if (tmp.stellar?.gen_eff) f.mul("Stellar Generator", tmp.stellar.gen_eff);
    return f.done("/sec");
}

function sbBuildQuantumFormula() {
    if (CHALS.inChal(13) || CHALS.inChal(19)) return { expr: "0 (inactive in C13/19)", full: "0 — Disabled in C13/C19", inactive: true };
    const base = player.mass.max(1).log10().div(1e13);
    if (base.lt(1)) return { expr: "0 (req e1e13 g)", full: "0 — Requires e1e13 g Mass", inactive: true };
    const p = hasTree("qp1") ? 5 : hasTree("qu11") ? 3 : 1.5;
    const f = new FormulaBuilder("Base", `(log10(mass) / 1e13)^${p}`, base.pow(p));
    if (player.exotic.times.gte(1) && player.qu.times.gte(1e295)) f.pow("Exotic + QU 1e295", 1.5);
    if (hasUpgrade("br", 25)) f.pow("BR Upg 25", 16 / 9);
    f.mul("QC Shard Eff", tmp.qu?.qc_s_eff || 1);
    if (tmp.qu?.mil_reached?.[4]) f.mul("QU Milestone 5", 2);
    if (hasTree("qf1")) f.mul("Tree qf1", sbSafe(() => treeEff("qf1"), 1));
    if (hasTree("qf2")) f.mul("Tree qf2", sbSafe(() => treeEff("qf2"), 1));
    if (hasTree("qf3")) f.mul("Tree qf3", sbSafe(() => treeEff("qf3"), 1));
    if (hasPrestige(0, 2)) f.mul("Prestige 2", 4);
    if (hasPrestige(0, 55)) f.mul("Prestige 55", player.prestiges[0].max(1));
    if (hasPrestige(0, 89)) f.mul("Prestige 89", sbSafe(() => prestigeEff(0, 89, [E(1), E(1)])[0], 1));
    if (hasUpgrade("inf", 1)) f.mul("Inf Upg 1", sbSafe(() => upgEffect(5, 1), 1));
    if (hasElement(474)) f.pow("Elem 474 (DS)", sbSafe(() => EXOTIC.dsEff().qf, 1));
    if (hasElement(486)) f.pow("Green Matter", sbSafe(() => MATTERS.eff(6), 1));
    if (hasUpgrade("exotic", 24)) f.expMult("Quantum Exotic Boost", tmp.ex?.exb_eff?.[5] || 1);
    return f.done(hasTree("qu_qol7a") ? " (passive/reset)" : " on Quantum reset");
}

function sbBuildQUTimesFormula() {
    if (CHALS.inChal(13) || CHALS.inChal(19)) return { expr: "0 (inactive in C13/19)", full: "0 — Disabled in C13/C19", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    if (hasTree("qu7")) f.mul("Tree qu7", sbSafe(() => treeEff("qu7"), 1));
    if (hasTree("qu9")) f.mul("Tree qu9", sbSafe(() => treeEff("qu9"), 1));
    if (hasTree("qu_qol11")) f.mul("Tree qu_qol11", 10);
    if (hasUpgrade("inf", 1)) f.mul("Inf Upg 1", player.inf.times.add(200));
    if (hasElement(216)) f.mul("Elem 216", tmp.elements.effect[216] || 1);
    if (player.exotic.times.gte(3)) f.mul("Exotic Resets", player.exotic.times);
    f.mul("Galaxy QU Times", sbSafe(() => SUPERNOVA_GALAXY.effects.qut2(), 1));
    if (hasUpgrade("exotic", 5)) f.mul("QU Count Booster", tmp.ex?.rcb_eff?.[0]?.eff || 1);
    if (hasPrestige(2, 146)) f.mul("Glory 146", sbSafe(() => prestigeEff(2, 146, E(1)), 1));
    return f.done(hasTree("qu_qol11") ? " (passive × reset)" : " per Quantum reset");
}

function sbBuildBPFormula() {
    if (CHALS.inChal(13) || CHALS.inChal(19)) return { expr: "0 (inactive in C13/19)", full: "0 — Disabled in C13/C19", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    if (tmp.qu?.mil_reached?.[5]) f.mul("QU Milestone 6 (GS)", tmp.preQUGlobalSpeed.root(2).softcap(1e50, 0.95, 2));
    if (hasTree("qu5")) f.mul("Tree qu5", tmp.supernova?.tree_eff?.qu5 || 1);
    f.mul("Cosmic Strings", tmp.qu?.cosmic_str_eff?.eff || 1);
    if (hasPrestige(0, 88)) f.mul("Prestige 88", sbSafe(() => prestigeEff(0, 88, [E(1), E(1)])[0], 1));
    if (hasElement(400)) f.pow("Elem 400 (DS)", sbSafe(() => EXOTIC.dsEff().bp, 1));
    return f.done("/sec");
}

function sbBuildChromaFormula(i) {
    if (CHALS.inChal(13) || CHALS.inChal(19)) return { expr: "0 (inactive in C13/19)", full: "0 — Disabled in C13/C19", inactive: true };
    if (!player.qu.chr_get.includes(i)) return { expr: "0 (not unlocked)", full: "0 — Select this Chroma with Quantum Theory first", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    if (tmp.qu?.mil_reached?.[5]) f.mul("QU Milestone 6", tmp.preQUGlobalSpeed.root(2));
    if (hasTree("qu5")) f.mul("Tree qu5", tmp.supernova?.tree_eff?.qu5 || 1);
    if (hasTree("qu8")) f.mul("Tree qu8", tmp.supernova?.tree_eff?.qu8 || 1);
    if (hasElement(155) && !player.qu.rip.active) f.pow("Elem 155 (C13)", tmp.chal?.eff?.[13] || 1);
    return f.done("/sec");
}

function sbBuildQCShardFormula() {
    if (!hasTree("unl3")) return { expr: "0 (QC locked)", full: "0 — Requires Tree unl3", inactive: true };
    const modsSum = (player.qu.qc.mods || []).reduce((a, b) => a + b, 0);
    const qcb = sbSafe(() => tmp.qu?.qc_s_bouns, 0);
    const f = new FormulaBuilder("QC Mods Sum", `${modsSum} (Bonus: +${qcb})`);
    if (QCs.active()) f.note("Active in QC — Quantum to claim");
    return f.done(" max shards");
}

function sbBuildPrimTheoremsFormula() {
    if (!PRIM.unl()) return { expr: "0 (Primordium locked)", full: "0 — Unlock Primordium first", inactive: true };
    const f = new FormulaBuilder("From BP", `floor((log10(BP+1)/5)^0.5) [next at ${sbFormat(sbSafe(() => tmp.prim?.next_theorem, E(1e5)))} BP]`);
    return f.done(" total theorems");
}

function sbBuildEntropyFormula(which) {
    if (!player.qu.en.unl) return { expr: "0 (Entropy locked)", full: "0 — Unlock Entropy first", inactive: true };
    if (which === "eth") {
        const f = new FormulaBuilder("From Frequency", "10^(log10(hz/1e15 + 1)^0.5)");
        if (!player.qu.en.eth[0]) f.note("Inactive: click Evaporate Frequency");
        return f.done(" target");
    }
    if (which === "hr") {
        const f = new FormulaBuilder("From BH Mass", "10^(log10(bh/1e156 + 1)^0.5)");
        if (!player.qu.en.hr[0]) f.note("Inactive: click Evaporate BH");
        return f.done(" target");
    }
    const f = new FormulaBuilder("Base", "2");
    if (hasElement(106)) f.mul("Elem 106", tmp.elements.effect[106] || 1);
    if (player.md.break.upgs[6].gte(1)) f.mul("BD Upg 7", tmp.bd?.upgs?.[6]?.eff?.[0] || 1);
    if (hasElement(110)) f.pow("Elem 110", 1.25);
    if (hasTree("en1")) f.pow("Tree en1", 1.5);
    f.pow("Enthalpy Eff", tmp.en?.eff?.eth || 1);
    f.note(`Cap: ${sbFormat(tmp.en?.cap || E(100))}`);
    return f.done("/sec");
}

function sbBuildRipFormula() {
    const base = player.mass.add(1).log10().div(2e5).max(0);
    if (!(player.qu.rip.active || hasTree("qu_qol12")) || CHALS.inChal(13) || CHALS.inChal(19) || base.lt(1)) {
        return { expr: "0 (enter Big Rip / need ee200000 g)", full: "0 — Requires Big Rip (or qu_qol12) and >= 10^2e5 g Mass", inactive: true };
    }
    const f = new FormulaBuilder("Base", "log10(mass) / 2e5", base);
    if (hasTree("br1")) f.mul("Tree br1", sbSafe(() => treeEff("br1"), 1));
    if (hasElement(90)) f.mul("Elem 90", tmp.elements.effect[90] || 1);
    if (hasElement(94)) f.mul("Elem 94", tmp.elements.effect[94] || 1);
    if (hasPrestige(0, 2)) f.mul("Prestige 2", 4);
    if (player.md.break.upgs[6].gte(1)) f.mul("BD Upg 7", tmp.bd?.upgs?.[6]?.eff?.[1] || 1);
    if (hasUpgrade("br", 13)) f.mul("BR Upg 13", sbSafe(() => upgEffect(4, 13), 1));
    if (hasPrestige(0, 55)) f.mul("Prestige 55", player.prestiges[0].max(1));
    if (hasPrestige(0, 98)) f.mul("Prestige 98", sbSafe(() => prestigeEff(0, 98, [E(1), E(1)])[0], 1));
    if (hasUpgrade("inf", 3) && !hasChargedElement(211)) f.mul("Inf Upg 3", sbSafe(() => upgEffect(5, 3), 1));
    if (hasUpgrade("br", 22)) f.pow("BR Upg 22 (C14)", tmp.chal?.eff?.[14] || 1);
    if (hasChargedElement(90)) f.pow("Charged e90", tmp.elements.ceffect[90] || 1);
    if (hasChargedElement(130)) f.pow("Charged e130", 2);
    if (hasChargedElement(179)) f.pow("Charged e179", 2.5);
    if (hasChargedElement(203)) f.pow("Charged e203", 2);
    if (hasChargedElement(211)) f.pow("Charged e211", sbSafe(() => UPGS.main[5][3].effect(), 1));
    if (!hasUpgrade("br", 21) && sbSafe(() => tmp.rip?.gain, E(0)).gte(Number.MAX_VALUE)) f.overflow("Death Shard Overflow", Number.MAX_VALUE, 0.25);
    return f.done(hasTree("qu_qol12") ? " (passive/exit)" : " on exit Big Rip");
}

function sbBuildInfFormula(isTimes = false) {
    if (isTimes) {
        const f = new FormulaBuilder("Base", "1");
        if (hasUpgrade("exotic", 5)) f.mul("Inf Count Booster", tmp.ex?.rcb_eff?.[1]?.eff || 1);
        if (hasPrestige(2, 146)) f.mul("Glory 146", sbSafe(() => prestigeEff(2, 146, E(1)), 1));
        return f.done(" per Infinity reset");
    }
    const base = player.mass.max(1).log10().div(1e120);
    if (base.lt(1)) return { expr: "0 (req e1e120 g)", full: "0 — Requires e1e120 g Mass", inactive: true };
    const f = new FormulaBuilder("Base", "log10(mass) / 1e120", base);
    let exp = E(2);
    if (hasElement(486)) exp = exp.add(sbSafe(() => MATTERS.eff(10), 0));
    f.pow("Inf Exponent", exp);
    if (hasElement(171)) f.mul("Elem 171", tmp.elements.effect[171] || 1);
    if (hasElement(174)) f.mul("Elem 174", tmp.elements.effect[174] || 1);
    if (hasPrestige(0, 72)) f.mul("Prestige 72", sbSafe(() => prestigeEff(0, 72), 1));
    if (hasPrestige(1, 21)) f.mul("Honor 21", sbSafe(() => prestigeEff(1, 21), 1));
    if (hasElement(393)) f.mul("Elem 393", sbSafe(() => EXOTIC.gainTimes(), 1));
    return f.done(hasElement(200) ? " (passive/reset)" : " on Infinity reset");
}

function sbBuildEtFormula(isTimes = false) {
    if (isTimes) {
        const f = new FormulaBuilder("Base", "1");
        if (hasUpgrade("exotic", 5)) f.mul("Et Count Booster", tmp.ex?.rcb_eff?.[2]?.eff || 1);
        if (hasPrestige(2, 146)) f.mul("Glory 146", sbSafe(() => prestigeEff(2, 146, E(1)), 1));
        return f.done(" per Eternity reset");
    }
    const base = player.inf.points.max(1).log10().div(1000);
    if (base.lt(1)) return { expr: "0 (req 1e1000 Inf)", full: "0 — Requires 1e1000 Infinity Mass", inactive: true };
    const f = new FormulaBuilder("Base", "log10(Inf) / 1000", base);
    let exp = E(2);
    if (hasElement(486)) exp = exp.add(sbSafe(() => MATTERS.eff(2), 0));
    f.pow("Et Exponent", exp);
    if (hasElement(221)) f.mul("Elem 221", tmp.elements.effect[221] || 1);
    if (hasPrestige(2, 85)) f.mul("Glory 85", sbSafe(() => prestigeEff(2, 85), 1));
    if (hasElement(393)) f.mul("Elem 393", sbSafe(() => EXOTIC.gainTimes(), 1));
    return f.done(hasElement(228) ? " (passive/reset)" : " on Eternity reset");
}

function sbBuildTimeshardsFormula() {
    if (player.et.times.lt(1)) return { expr: "0 (Eternity locked)", full: "0 — Complete 1 Eternity first", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    f.mul("Shard Gen Eff", sbSafe(() => tmp.et?.shard_gen_eff, 1));
    if (hasUpgrade("inf", 17)) f.mul("Inf Upg 17", sbSafe(() => upgEffect(5, 17), 1));
    if (hasElement(212)) f.mul("Elem 212", tmp.elements.effect[212] || 1);
    if (hasElement(249)) f.mul("Elem 249", tmp.elements.effect[249] || 1);
    if (hasElement(294)) f.mul("Elem 294", tmp.elements.effect[294] || 1);
    if (hasElement(341)) f.mul("Elem 341", tmp.elements.effect[341] || 1);
    return f.done("/sec");
}

function sbBuildExoticFormula(isTimes = false) {
    if (isTimes) {
        const f = new FormulaBuilder("Base", "1");
        if (hasElement(402)) f.mul("Exotic Count Booster", tmp.ex?.rcb_eff?.[3]?.eff || 1);
        if (player.superCluster.gte(8)) f.mul("Cluster 8 Eff", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
        return f.done(" per Exotic reset");
    }
    const base = player.mass.max(1).log10().max(1).log10().div(1e12);
    if (base.lt(1)) return { expr: "0 (req eee12 g)", full: "0 — Requires 1e1e1e12 g Mass", inactive: true };
    const exp = (tmp.chal?.eff?.[24] || E(0)).add(hasUpgrade("exotic", 22) ? 3 : 2);
    const f = new FormulaBuilder("Base", `(log10(log10(mass)) / 1e12)^${sbFormat(exp)}`, base.pow(exp));
    if (player.qu.times.gte(1e255) && player.exotic.times.gte(1)) f.mul("QU 1e255", 3);
    if (player.qu.times.gte(1e295) && player.exotic.times.gte(1)) f.mul("QU 1e295", 5);
    if (hasPrestige(2, 141)) f.mul("Glory 141", sbSafe(() => prestigeEff(2, 141, E(1)), 1));
    if (hasPrestige(3, 21)) f.mul("Renown 21", sbSafe(() => prestigeEff(3, 21, E(1)), 1));
    if (hasPrestige(3, 22)) f.mul("Renown 22", sbSafe(() => prestigeEff(3, 22, E(1)), 1));
    if (hasPrestige(4, 15)) f.mul("Valor 15", sbSafe(() => prestigeEff(4, 15, E(1)), 1));
    if (player.ranks.oct.gte(34)) f.mul("Oct 34", sbSafe(() => RANKS.effect.oct[34](), 1));
    if (player.ranks.enne.gte(5)) f.mul("Enne 5", sbSafe(() => RANKS.effect.enne[5](), 1));
    if (player.ranks.enne.gte(101)) f.mul("Enne 101", sbSafe(() => RANKS.effect.enne[101](), 1));
    if (hasUpgrade("exotic", 15)) f.mul("Dark Shadow", tmp.ex?.dsEff?.ex || 1);
    if (hasUpgrade("exotic", 17)) f.mul("Exotic Resets", player.exotic.times.add(1));
    if (hasUpgrade("br", 23)) f.mul("BR Upg 23", sbSafe(() => upgEffect(4, 23), 1));
    if (hasUpgrade("inf", 24)) f.mul("Inf Upg 24", sbSafe(() => upgEffect(5, 24), 1));
    if (hasUpgrade("bh", 25)) f.mul("BH Upg 25", sbSafe(() => upgEffect(2, 25), 1));
    if (hasAscension(0, 2)) f.mul("Ascension 2", sbSafe(() => ascensionEff(0, 2, E(1)), 1));
    if (hasAscension(1, 1)) f.mul("Transcension 1", sbSafe(() => ascensionEff(1, 1, E(1)), 1));
    if (hasChargedElement(6)) f.mul("Charged e6", tmp.elements.ceffect[6] || 1);
    f.mul("Cluster Eff 1", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
    if (hasElement(395)) f.mul("Elem 395", tmp.elements.effect[395] || 1);
    if (hasElement(406)) f.mul("Dark Ray", tmp.ex?.drEff?.ex || 1);
    if (player.exotic.dark_run.upgs[10].gte(1)) f.mul("DR Upg 11", tmp.dark_run?.upgs?.[10]?.eff || 1);
    f.mul("Galaxy Exotic", sbSafe(() => SUPERNOVA_GALAXY.effects.em(), 1));
    if (hasChargedElement(120)) f.mul("Charged e120", tmp.elements.ceffect[120] || 1);
    if (hasElement(486)) f.mul("Red Matter", sbSafe(() => MATTERS.eff(0), 1));
    if (hasElement(534)) f.mul("X Axions", player.exotic.ax[0].add(1));
    return f.done(" on Exotic reset");
}

function sbBuildExoticBPFormula() {
    if (!hasUpgrade("exotic", 10)) return { expr: "0 (req Exotic Upg 10)", full: "0 — Requires Exotic Upgrade 10", inactive: true };
    return new FormulaBuilder("From Best Exotic", `floor(log(bestExotic + 1, 2)) [= ${sbFormat(sbSafe(() => EXOTIC_BOOST.gain(), 0), 0)}]`).done(" total BP");
}

function sbBuildDarkFormula(which) {
    if (which === "dr") {
        if (!hasUpgrade("exotic", 15)) return { expr: "0 (req Exotic Upg 15)", full: "0 — Requires Exotic Upgrade 15", inactive: true };
        const f = new FormulaBuilder("Base", "1");
        f.mul("Dark Shadow", tmp.ex?.dsEff?.ex || 1);
        if (hasElement(372)) f.mul("Elem 372", tmp.elements.effect[372] || 1);
        if (hasAscension(0, 11)) f.mul("Ascension 11", sbSafe(() => ascensionEff(0, 11, E(1)), 1));
        if (hasElement(389)) f.mul("Elem 389", tmp.elements.effect[389] || 1);
        if (player.superCluster.gte(4)) f.mul("Cluster 4 Eff", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
        if (hasElement(426)) f.mul("Abyssal Blot", tmp.ex?.abEff?.ds || 1);
        if (hasElement(486)) f.mul("Fading Matter", sbSafe(() => MATTERS.eff(12), 1));
        if (hasElement(540)) f.mul("Y Axions", player.exotic.ax[1].add(1));
        if (player.ranks.enne.gte(250)) f.mul("Enne 250", sbSafe(() => RANKS.effect.enne[250](), 1));
        return f.done(" on Exotic reset");
    }
    if (which === "ds") {
        if (!hasUpgrade("exotic", 15)) return { expr: "0 (req Exotic Upg 15)", full: "0 — Requires Exotic Upgrade 15", inactive: true };
        const f = new FormulaBuilder("Base", "1");
        f.mul("Dark Ray", tmp.ex?.drEff?.ds || 1);
        if (hasElement(414)) f.mul("Abyssal Blot", tmp.ex?.abEff?.ds || 1);
        if (hasElement(370)) f.mul("Elem 370", tmp.elements.effect[370] || 1);
        if (hasElement(388)) f.mul("Elem 388", tmp.elements.effect[388] || 1);
        if (hasElement(401)) f.mul("Elem 401", tmp.elements.effect[401] || 1);
        if (hasElement(405)) f.mul("Elem 405", tmp.elements.effect[405] || 1);
        if (player.superCluster.gte(3)) f.mul("Cluster 3 Eff", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
        if (hasAscension(0, 20)) f.mul("Ascension 20", sbSafe(() => ascensionEff(0, 20, E(1)), 1));
        if (player.ranks.enne.gte(10)) f.mul("Enne 10", sbSafe(() => RANKS.effect.enne[10](), 1));
        return f.done("/sec");
    }
    if (!hasElement(414)) return { expr: "0 (req Elem 414)", full: "0 — Requires Element 414", inactive: true };
    const f = new FormulaBuilder("Base", "1");
    f.mul("Dark Shadow", sbSafe(() => EXOTIC.dsEff().ab, 1));
    if (hasElement(442)) f.mul("Elem 442", tmp.elements.effect[442] || 1);
    if (hasElement(445)) f.mul("Elem 445", tmp.elements.effect[445] || 1);
    if (player.superCluster.gte(7)) f.mul("Cluster 7 Eff", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
    if (player.exotic.dark_run.upgs[9].gte(1)) f.mul("DR Upg 10", tmp.dark_run?.upgs?.[9]?.eff || 1);
    if (hasElement(486)) f.mul("White Matter", sbSafe(() => MATTERS.eff(11), 1));
    return f.done("/sec");
}

function sbBuildGlyphicFormula() {
    if (!player.exotic.dark_run.active) return { expr: "0 (enter Dark Run)", full: "0 — Enter Dark Run to generate Glyphic Mass", inactive: true };
    const powExp = hasAscension(1, 15) ? 12 : 10;
    const base = Decimal.pow(10, player.mass.add(1000).slog().sub(2).max(0).pow(powExp).sub(3));
    const f = new FormulaBuilder("Base", `10^((slog(mass+1000)-2)^${powExp} - 3)`, base);
    if (player.exotic.dark_run.upgs[0].gte(1)) f.mul("DR Upg 1", tmp.dark_run?.upgs?.[0]?.eff || 1);
    if (player.exotic.dark_run.upgs[1].gte(1)) f.mul("DR Upg 2", tmp.dark_run?.upgs?.[1]?.eff || 1);
    if (player.exotic.dark_run.upgs[8].gte(1)) f.mul("DR Upg 9", tmp.dark_run?.upgs?.[8]?.eff || 1);
    if (hasElement(451)) f.mul("Elem 451", tmp.elements.effect[451] || 1);
    if (player.superCluster.gte(7)) f.mul("Cluster 7 Eff", sbSafe(() => SUPERNOVA_CLUSTER.effects.eff1(), 1));
    if (hasElement(456)) f.mul("Dark Ray", tmp.ex?.drEff?.gm || 1);
    if (hasElement(464)) f.mul("Elem 464", tmp.elements.effect[464] || 1);
    if (hasPrestige(4, 12)) f.mul("Valor 12", sbSafe(() => prestigeEff(4, 12, E(1)), 1));
    if (hasAscension(1, 14)) f.mul("Transcension 14", sbSafe(() => ascensionEff(1, 14, E(1)), 1));
    if (hasElement(485)) f.mul("Elem 485", tmp.elements.effect[485] || 1);
    if (hasElement(554)) f.mul("Axionic Space", sbSafe(() => EXOTIC.axsEff(), 1));
    if (hasTree("ax8")) f.mul("Tree ax8", sbSafe(() => treeEff("ax8"), 1));
    if (hasTree("ax17")) f.mul("Tree ax17", sbSafe(() => treeEff("ax17"), 1));
    if (hasTree("ax20")) f.mul("W Axions", player.exotic.ax[3].add(1));
    f.mul("Galaxy EM", sbSafe(() => SUPERNOVA_GALAXY.effects.em(), 1));
    return f.done("/sec");
}

function sbBuildMatterFormula(i) {
    if (!hasElement(486)) return { expr: "0 (req Elem 486)", full: "0 — Requires Element 486", inactive: true };
    const prevName = i === 0 ? "Dark Matter" : MATTERS_NAMES_LOCAL[i - 1];
    const prevVal = i === 0 ? player.bh.dm : player.exotic.matters[i - 1];
    if (prevVal.slog().lt(2)) return { expr: `0 (req slog(${prevName}) >= 2)`, full: `0 — Requires slog(${prevName}) >= 2`, inactive: true };
    const mPow = sbSafe(() => MATTERS.pow(), E(1));
    const ax16 = hasTree("ax16") ? prevVal.slog().div(3).max(1) : E(1);
    const f = new FormulaBuilder("Base", `10^((slog(${prevName})-1)^(${sbFormat(mPow)}${hasTree("ax16") ? " × " + sbFormat(ax16) : ""})) - 10`);
    if (i === 1 && hasTree("qp15")) f.mul("Tree qp15", sbSafe(() => treeEff("qp15"), 1));
    if (i === 2 && hasElement(513)) f.mul("Elem 513", tmp.elements.effect[513] || 1);
    if (i < 12 && hasElement(548)) f.mul(`Next Matter^${sbFormat(MATTERS.extendPow())}`, player.exotic.matters[i + 1].add(1).pow(MATTERS.extendPow()));
    return f.done("/sec");
}

function sbBuildAxionFormula(i) {
    const names = ["X", "Y", "Z", "W"];
    const reqs = [534, 540, 554, 554];
    if (!hasElement(reqs[i]) && !(i === 3 && hasTree("ax20"))) {
        return { expr: `0 (${names[i]} Axions locked)`, full: `0 — ${names[i]} Axions locked`, inactive: true };
    }
    const eff = sbSafe(() => EXOTIC.ax.eff(i), { pow: E(0), eff: E(0) });
    return new FormulaBuilder(`${names[i]} Gen Eff`, `${sbFormat(player.exotic.axg[i], 0)} × ${sbFormat(eff.pow)}`).done("/sec");
}

const MATTERS_NAMES_LOCAL = [
    "Red Matter", "Pink Matter", "Magenta Matter", "Purple Matter", "Violet Matter",
    "Blue Matter", "Cyan Matter", "Green Matter", "Lime Matter", "Yellow Matter",
    "Orange Matter", "White Matter", "Fading Matter",
];

function buildSandboxCurrencies() {
    const list = [
        // Core
        { id: "mass", name: "Mass", cat: "Core", unit: "mass", unl: () => true, get: () => player.mass, set: v => { player.mass = v; }, gain: () => sbSafe(() => tmp.massGain.mul(tmp.preQUGlobalSpeed)), formula: sbBuildMassFormula },
        { id: "pre_qu_gs", name: "Pre-QU Global Speed", cat: "Core", unit: "mult", readOnlyCurrency: true, unl: () => quUnl(), get: () => sbSafe(() => tmp.preQUGlobalSpeed, E(1)), set: () => {}, gain: () => E(0), formula: sbBuildPreQUGSFormula },
        { id: "rp", name: "Rage Power", cat: "Core", unit: "num", unl: () => player.mass.gte(1e15) || player.rp.unl, get: () => player.rp.points, set: v => { player.rp.points = v; if (v.gt(0)) player.rp.unl = true; }, gain: () => (player.mainUpg.bh.includes(6) || player.mainUpg.atom.includes(6)) ? sbSafe(() => tmp.rp.gain.mul(tmp.preQUGlobalSpeed)) : sbSafe(() => tmp.rp.gain), formula: sbBuildRPFormula },
        { id: "dm", name: "Dark Matter", cat: "Core", unit: "num", unl: () => FORMS.bh.see(), get: () => player.bh.dm, set: v => { player.bh.dm = v; if (v.gt(0)) player.rp.unl = true; }, gain: () => player.mainUpg.atom.includes(6) ? sbSafe(() => tmp.bh.dm_gain.mul(tmp.preQUGlobalSpeed)) : sbSafe(() => tmp.bh.dm_gain), formula: sbBuildDMFormula },
        { id: "bh_mass", name: "Black Hole Mass", cat: "Core", unit: "mass", unl: () => player.bh.unl, get: () => player.bh.mass, set: v => { player.bh.mass = v; if (v.gt(0)) { player.rp.unl = true; player.bh.unl = true; } }, gain: () => (player.bh.unl && !player.qu.en.hr[0]) ? sbSafe(() => tmp.bh.mass_gain.mul(tmp.preQUGlobalSpeed)) : E(0), formula: sbBuildBHFormula },
        { id: "prestige_mass", name: "Prestige Mass", cat: "Core", unit: "mass", unl: () => player.prestiges[1].gte(10), get: () => player.prestigeMass, set: v => { player.prestigeMass = v; }, gain: () => sbSafe(() => tmp.prestigeMassGain), formula: sbBuildPrestigeMassFormula },
        { id: "prestige_rp", name: "Prestige Rage Power", cat: "Core", unit: "num", unl: () => player.prestiges[2].gte(165), get: () => player.prestigeRP, set: v => { player.prestigeRP = v; }, gain: () => sbSafe(() => tmp.prestigeRPGain), formula: sbBuildPrestigeRPFormula },
        { id: "prestige_bh", name: "Prestige Black Hole", cat: "Core", unit: "mass", unl: () => player.prestiges[3].gte(34), get: () => player.prestigeBH, set: v => { player.prestigeBH = v; }, gain: () => sbSafe(() => tmp.prestigeBHGain), formula: sbBuildPrestigeBHFormula },
        { id: "prestige_dm", name: "Prestige Dark Matter", cat: "Core", unit: "num", unl: () => player.prestiges[3].gte(37), get: () => player.prestigeDM, set: v => { player.prestigeDM = v; }, gain: () => sbSafe(() => tmp.prestigeDMGain), formula: sbBuildPrestigeDMFormula },
        { id: "ascension_mass", name: "Ascension Mass", cat: "Core", unit: "mass", unl: () => player.ascensions[1].gte(3), get: () => player.ascensionMass, set: v => { player.ascensionMass = v; }, gain: () => sbSafe(() => tmp.ascensionMassGain), formula: sbBuildAscensionMassFormula },

        // Atom & Dilation
        { id: "atom", name: "Atoms", cat: "Atom", unit: "num", unl: () => player.atom.unl || player.bh.unl, get: () => player.atom.points, set: v => { player.atom.points = v; if (v.gt(0)) { player.rp.unl = true; player.bh.unl = true; player.atom.unl = true; } }, gain: () => hasElement(24) ? sbSafe(() => tmp.atom.gain.mul(tmp.preQUGlobalSpeed)) : sbSafe(() => tmp.atom.gain), formula: sbBuildAtomFormula },
        { id: "atomic", name: "Atomic Power", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.atomic, set: v => { player.atom.atomic = v; if (v.gt(0)) player.atom.unl = true; }, gain: () => sbSafe(() => tmp.atom.atomicGain.mul(tmp.preQUGlobalSpeed)), formula: sbBuildAtomicFormula },
        { id: "quarks", name: "Quarks", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.quarks, set: v => { player.atom.quarks = v; if (v.gt(0)) player.atom.unl = true; }, gain: () => hasElement(14) ? sbSafe(() => tmp.atom.quarkGain.mul(tmp.atom.quarkGainSec).mul(tmp.preQUGlobalSpeed)) : sbSafe(() => tmp.atom.quarkGain), formula: sbBuildQuarksFormula },
        { id: "proton", name: "Protons", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.particles[0], set: v => { player.atom.particles[0] = v; }, gain: () => hasElement(30) ? player.atom.quarks.div(10).mul(sbSafe(() => tmp.preQUGlobalSpeed, 1)) : E(0), formula: () => sbBuildParticleFormula(0) },
        { id: "neutron", name: "Neutrons", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.particles[1], set: v => { player.atom.particles[1] = v; }, gain: () => hasElement(30) ? player.atom.quarks.div(10).mul(sbSafe(() => tmp.preQUGlobalSpeed, 1)) : E(0), formula: () => sbBuildParticleFormula(1) },
        { id: "electron", name: "Electrons", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.particles[2], set: v => { player.atom.particles[2] = v; }, gain: () => hasElement(30) ? player.atom.quarks.div(10).mul(sbSafe(() => tmp.preQUGlobalSpeed, 1)) : E(0), formula: () => sbBuildParticleFormula(2) },
        { id: "proton_pow", name: "Proton Power", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.powers[0], set: v => { player.atom.powers[0] = v; }, gain: () => sbSafe(() => tmp.atom.particles[0].powerGain.mul(tmp.preQUGlobalSpeed)), formula: () => sbBuildParticlePowFormula(0) },
        { id: "neutron_pow", name: "Neutron Power", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.powers[1], set: v => { player.atom.powers[1] = v; }, gain: () => sbSafe(() => tmp.atom.particles[1].powerGain.mul(tmp.preQUGlobalSpeed)), formula: () => sbBuildParticlePowFormula(1) },
        { id: "electron_pow", name: "Electron Power", cat: "Atom", unit: "num", unl: () => player.atom.unl, get: () => player.atom.powers[2], set: v => { player.atom.powers[2] = v; }, gain: () => sbSafe(() => tmp.atom.particles[2].powerGain.mul(tmp.preQUGlobalSpeed)), formula: () => sbBuildParticlePowFormula(2) },
        { id: "md_particles", name: "Relativistic Particles", cat: "Atom", unit: "num", unl: () => MASS_DILATION.unlocked(), get: () => player.md.particles, set: v => { player.md.particles = v; }, gain: () => sbSafe(() => (player.md.active ? tmp.md.rp_gain : tmp.md.passive_rp_gain).mul(tmp.preQUGlobalSpeed)), formula: sbBuildMDParticlesFormula },
        { id: "md_mass", name: "Dilated Mass", cat: "Atom", unit: "mass", unl: () => MASS_DILATION.unlocked(), get: () => player.md.mass, set: v => { player.md.mass = v; }, gain: () => sbSafe(() => tmp.md.mass_gain.mul(tmp.preQUGlobalSpeed)), formula: sbBuildMDMassFormula },
        { id: "bd_energy", name: "Relativistic Energy", cat: "Atom", unit: "num", unl: () => hasUpgrade("br", 9), get: () => player.md.break.energy, set: v => { player.md.break.energy = v; }, gain: () => sbSafe(() => tmp.bd.energyGain), formula: sbBuildBDEnergyFormula },
        { id: "bd_mass", name: "Relativistic Mass", cat: "Atom", unit: "mass", unl: () => hasUpgrade("br", 9), get: () => player.md.break.mass, set: v => { player.md.break.mass = v; }, gain: () => sbSafe(() => tmp.bd.massGain), formula: sbBuildBDMassFormula },
        { id: "stars", name: "Collapsed Stars", cat: "Atom", unit: "num", unl: () => STARS.unlocked(), get: () => player.stars.points, set: v => { player.stars.points = v; }, gain: () => sbSafe(() => tmp.stars.gain.mul(tmp.preQUGlobalSpeed)), formula: sbBuildStarsFormula },

        // Supernova
        { id: "supernova", name: "Supernovas", cat: "Supernova", unit: "num", unl: () => player.supernova.times.gte(1) || quUnl() || player.superGal.gte(1), get: () => player.supernova.times, set: v => { player.supernova.times = v; if (v.gte(10)) player.supernova.post_10 = true; }, gain: () => sbSafe(() => tmp.supernova.bulk.sub(player.supernova.times).max(0)), formula: sbBuildSupernovaFormula },
        { id: "neutron_star", name: "Neutron Stars", cat: "Supernova", unit: "num", unl: () => player.supernova.times.gte(1) || quUnl(), get: () => player.supernova.stars, set: v => { player.supernova.stars = v; }, gain: () => sbSafe(() => tmp.supernova.star_gain), formula: sbBuildNeutronStarFormula },
        { id: "pos_w", name: "W+ Boson", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.pos_w, set: v => { player.supernova.bosons.pos_w = v; }, gain: () => sbSafe(() => tmp.bosons.gain.pos_w), formula: () => sbBuildBosonFormula("pos_w") },
        { id: "neg_w", name: "W- Boson", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.neg_w, set: v => { player.supernova.bosons.neg_w = v; }, gain: () => sbSafe(() => tmp.bosons.gain.neg_w), formula: () => sbBuildBosonFormula("neg_w") },
        { id: "z_boson", name: "Z0 Boson", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.z_boson, set: v => { player.supernova.bosons.z_boson = v; }, gain: () => sbSafe(() => tmp.bosons.gain.z_boson), formula: () => sbBuildBosonFormula("z_boson") },
        { id: "photon", name: "Photon", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.photon, set: v => { player.supernova.bosons.photon = v; }, gain: () => sbSafe(() => tmp.bosons.gain.photon), formula: () => sbBuildBosonFormula("photon") },
        { id: "gluon", name: "Gluon", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.gluon, set: v => { player.supernova.bosons.gluon = v; }, gain: () => sbSafe(() => tmp.bosons.gain.gluon), formula: () => sbBuildBosonFormula("gluon") },
        { id: "graviton", name: "Graviton", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.graviton, set: v => { player.supernova.bosons.graviton = v; }, gain: () => sbSafe(() => tmp.bosons.gain.graviton), formula: () => sbBuildBosonFormula("graviton") },
        { id: "hb", name: "Higgs Boson", cat: "Supernova", unit: "num", unl: () => player.supernova.post_10 || player.superGal.gte(1), get: () => player.supernova.bosons.hb, set: v => { player.supernova.bosons.hb = v; }, gain: () => sbSafe(() => tmp.bosons.gain.hb), formula: () => sbBuildBosonFormula("hb") },
        { id: "f_quark", name: "U-Quark", cat: "Supernova", unit: "num", unl: () => player.supernova.fermions.unl, get: () => player.supernova.fermions.points[0], set: v => { player.supernova.fermions.points[0] = v; if (v.gt(0)) player.supernova.fermions.unl = true; }, gain: () => sbSafe(() => tmp.fermions.gains[0]), formula: () => sbBuildFermionFormula(0) },
        { id: "f_lepton", name: "U-Lepton", cat: "Supernova", unit: "num", unl: () => player.supernova.fermions.unl, get: () => player.supernova.fermions.points[1], set: v => { player.supernova.fermions.points[1] = v; if (v.gt(0)) player.supernova.fermions.unl = true; }, gain: () => sbSafe(() => tmp.fermions.gains[1]), formula: () => sbBuildFermionFormula(1) },
        { id: "rad_hz", name: "Radiation Frequency", cat: "Supernova", unit: "hz", unl: () => hasTree("unl1"), get: () => player.supernova.radiation.hz, set: v => { player.supernova.radiation.hz = v; }, gain: () => player.qu.en.eth[0] ? E(0) : sbSafe(() => tmp.radiation.hz_gain.mul(tmp.preQUGlobalSpeed)), formula: sbBuildRadHzFormula },

        // Galaxy & Cluster
        { id: "superGal", name: "Supernova Galaxies", cat: "Galaxy", unit: "num", unl: () => hasElement(218) || player.superGal.gte(1), get: () => player.superGal, set: v => { player.superGal = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.bulk().sub(player.superGal).max(0)), formula: () => new FormulaBuilder("Next SG", `${sbFormat(sbSafe(() => SUPERNOVA_GALAXY.req(), E(1e10)))} Supernovas`).done(" on SG reset") },
        { id: "galPow0", name: "Galactic Power", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(1), get: () => player.galPow[0], set: v => { player.galPow[0] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow0_gain()), formula: () => sbBuildGalPowFormula(0) },
        { id: "galPow1", name: "Galactic Atoms", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(1), get: () => player.galPow[1], set: v => { player.galPow[1] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow1_gain()), formula: () => sbBuildGalPowFormula(1) },
        { id: "galPow2", name: "Galactic Dark Energy", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(1), get: () => player.galPow[2], set: v => { player.galPow[2] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow2_gain()), formula: () => sbBuildGalPowFormula(2) },
        { id: "galPow3", name: "Galactic Bosons", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(3), get: () => player.galPow[3], set: v => { player.galPow[3] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow3_gain()), formula: () => sbBuildGalPowFormula(3) },
        { id: "galPow4", name: "Galactic U-Fermions", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(5), get: () => player.galPow[4], set: v => { player.galPow[4] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow4_gain()), formula: () => sbBuildGalPowFormula(4) },
        { id: "galPow5", name: "Galactic Radiation", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(7), get: () => player.galPow[5], set: v => { player.galPow[5] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow5_gain()), formula: () => sbBuildGalPowFormula(5) },
        { id: "galPow6", name: "Galactic Mass", cat: "Galaxy", unit: "num", unl: () => player.superCluster.gte(1), get: () => player.galPow[6], set: v => { player.galPow[6] = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galPow6_gain()), formula: () => sbBuildGalPowFormula(6) },
        { id: "galQk", name: "Galactic Quarks", cat: "Galaxy", unit: "num", unl: () => player.superGal.gte(10), get: () => player.galQk, set: v => { player.galQk = v; }, gain: () => sbSafe(() => SUPERNOVA_GALAXY.galQkGain()), formula: sbBuildGalQkFormula },
        { id: "g_proton", name: "Galactic Protons", cat: "Galaxy", unit: "num", unl: () => hasElement(251), get: () => player.galParticles[0], set: v => { player.galParticles[0] = v; }, gain: () => hasElement(312) ? player.galQk : E(0), formula: () => hasElement(312) ? new FormulaBuilder("Gal Quarks", sbFormat(player.galQk)).done("/sec") : { expr: "Manual assign from Gal Quarks", full: "Assigned from Galactic Quarks (Elem 312 grants passive +galQk/s)", inactive: true } },
        { id: "g_neutron", name: "Galactic Neutrons", cat: "Galaxy", unit: "num", unl: () => hasElement(251), get: () => player.galParticles[1], set: v => { player.galParticles[1] = v; }, gain: () => hasElement(312) ? player.galQk : E(0), formula: () => hasElement(312) ? new FormulaBuilder("Gal Quarks", sbFormat(player.galQk)).done("/sec") : { expr: "Manual assign from Gal Quarks", full: "Assigned from Galactic Quarks (Elem 312 grants passive +galQk/s)", inactive: true } },
        { id: "g_electron", name: "Galactic Electrons", cat: "Galaxy", unit: "num", unl: () => hasElement(251), get: () => player.galParticles[2], set: v => { player.galParticles[2] = v; }, gain: () => hasElement(312) ? player.galQk : E(0), formula: () => hasElement(312) ? new FormulaBuilder("Gal Quarks", sbFormat(player.galQk)).done("/sec") : { expr: "Manual assign from Gal Quarks", full: "Assigned from Galactic Quarks (Elem 312 grants passive +galQk/s)", inactive: true } },
        { id: "gc_shard", name: "Galactic Shards", cat: "Galaxy", unit: "num", unl: () => hasElement(267), get: () => player.gc.shard, set: v => { player.gc.shard = v; }, gain: () => sbSafe(() => tmp.gc.shards), formula: sbBuildGCShardFormula },
        { id: "superCluster", name: "Supernova Clusters", cat: "Galaxy", unit: "num", unl: () => hasElement(387) || player.superCluster.gte(1), get: () => player.superCluster, set: v => { player.superCluster = v; }, gain: () => player.superGal.gte(sbSafe(() => SUPERNOVA_CLUSTER.req(), E(1e10))) ? E(1) : E(0), formula: () => new FormulaBuilder("Next SC", `${sbFormat(sbSafe(() => SUPERNOVA_CLUSTER.req(), E(1e10)))} Supernova Galaxies`).done(" on SC reset") },
        { id: "stardust", name: "Stardust", cat: "Galaxy", unit: "num", unl: () => player.superCluster.gte(14), get: () => player.stardust, set: v => { player.stardust = v; }, gain: () => sbSafe(() => SUPERNOVA_CLUSTER.stardustGain()), formula: sbBuildStardustFormula },
        { id: "stellar", name: "Stellar Mass", cat: "Galaxy", unit: "mass", unl: () => player.superCluster.gte(21), get: () => player.stellar, set: v => { player.stellar = v; }, gain: () => sbSafe(() => tmp.stellar.gain), formula: sbBuildStellarFormula },
        { id: "nebDust", name: "Nebula Dust", cat: "Nebula", unit: "num", unl: () => player.nebula && player.nebula.unl, get: () => player.nebula.dust, set: v => { player.nebula.dust = v; }, gain: () => sbSafe(() => SUPERNOVA_NEBULA.dustGain()), formula: () => new FormulaBuilder("Next collapse", `${sbFormat(sbSafe(() => SUPERNOVA_NEBULA.dustGain(), E(0)))} Dust`).done(` at ${sbFormat(sbSafe(() => SUPERNOVA_NEBULA.req(), E(14)))} Clusters`) },
        { id: "nebTimes", name: "Nebula Collapses", cat: "Nebula", unit: "num", unl: () => player.nebula && player.nebula.unl, get: () => player.nebula.times, set: v => { player.nebula.times = v; }, gain: () => E(0), formula: () => new FormulaBuilder("Manual", "reset count").done("") },
        { id: "genSparks", name: "Genesis Sparks", cat: "Nebula", unit: "num", unl: () => !!(player.gen && player.gen.unl), get: () => player.gen.sparks, set: v => { player.gen.sparks = v; }, gain: () => sbSafe(() => GENESIS.sparkGain()), formula: () => new FormulaBuilder("Reforge", `${sbFormat(sbSafe(() => GENESIS.sparkGain(), E(0)))} Sparks`).done(` at run depth ${sbFormat(E(player.gen.runBest || 0))}`) },

        // Quantum
        { id: "qu", name: "Quantum Foam", cat: "Quantum", unit: "num", unl: () => quUnl(), get: () => player.qu.points, set: v => { player.qu.points = v; if (v.gt(0)) player.qu.reached = true; }, gain: () => sbSafe(() => tmp.qu.gain), formula: sbBuildQuantumFormula },
        { id: "qu_times", name: "Quantizes", cat: "Quantum", unit: "num", unl: () => quUnl(), get: () => player.qu.times, set: v => { player.qu.times = v; if (v.gt(0)) player.qu.reached = true; }, gain: () => sbSafe(() => tmp.qu.gainTimes), formula: () => sbBuildQUTimesFormula() },
        { id: "bp", name: "Blueprint Particles", cat: "Quantum", unit: "num", unl: () => quUnl(), get: () => player.qu.bp, set: v => { player.qu.bp = v; }, gain: () => sbSafe(() => tmp.qu.bpGain), formula: sbBuildBPFormula },
        { id: "chroma_0", name: "Red Chroma", cat: "Quantum", unit: "num", unl: () => quUnl(), get: () => player.qu.chroma[0], set: v => { player.qu.chroma[0] = v; }, gain: () => sbSafe(() => tmp.qu.chroma_gain[0]), formula: () => sbBuildChromaFormula(0) },
        { id: "chroma_1", name: "Green Chroma", cat: "Quantum", unit: "num", unl: () => quUnl(), get: () => player.qu.chroma[1], set: v => { player.qu.chroma[1] = v; }, gain: () => sbSafe(() => tmp.qu.chroma_gain[1]), formula: () => sbBuildChromaFormula(1) },
        { id: "chroma_2", name: "Blue Chroma", cat: "Quantum", unit: "num", unl: () => quUnl(), get: () => player.qu.chroma[2], set: v => { player.qu.chroma[2] = v; }, gain: () => sbSafe(() => tmp.qu.chroma_gain[2]), formula: () => sbBuildChromaFormula(2) },
        { id: "qc_shard", name: "Quantum Shards", cat: "Quantum", unit: "num", isNumber: true, unl: () => hasTree("unl3"), get: () => E(player.qu.qc.shard || 0), set: v => { player.qu.qc.shard = Math.floor(Math.max(0, Math.min(v.toNumber(), 1e308))); }, gain: () => E(sbSafe(() => tmp.qu.qc_s + tmp.qu.qc_s_bouns, 0)), formula: sbBuildQCShardFormula },
        { id: "prim_theorems", name: "Primordium Theorems", cat: "Quantum", unit: "num", unl: () => PRIM.unl(), get: () => player.qu.prim.theorems, set: v => { player.qu.prim.theorems = v; }, gain: () => sbSafe(() => tmp.prim.theorems), formula: sbBuildPrimTheoremsFormula },
        { id: "en_eth", name: "Enthalpy", cat: "Quantum", unit: "num", unl: () => player.qu.en.unl, get: () => player.qu.en.eth[2], set: v => { player.qu.en.eth[2] = v; if (v.gt(0)) player.qu.en.unl = true; }, gain: () => player.qu.en.eth[0] ? sbSafe(() => tmp.en.gain.eth) : E(0), formula: () => sbBuildEntropyFormula("eth") },
        { id: "en_amt", name: "Entropy", cat: "Quantum", unit: "num", unl: () => player.qu.en.unl, get: () => player.qu.en.amt, set: v => { player.qu.en.amt = v; if (v.gt(0)) player.qu.en.unl = true; }, gain: () => sbSafe(() => tmp.en.gain.amt), formula: () => sbBuildEntropyFormula("amt") },
        { id: "en_hr", name: "Hawking Radiation", cat: "Quantum", unit: "num", unl: () => player.qu.en.unl, get: () => player.qu.en.hr[2], set: v => { player.qu.en.hr[2] = v; if (v.gt(0)) player.qu.en.unl = true; }, gain: () => player.qu.en.hr[0] ? sbSafe(() => tmp.en.gain.hr) : E(0), formula: () => sbBuildEntropyFormula("hr") },
        { id: "rip", name: "Death Shards", cat: "Quantum", unit: "num", unl: () => player.qu.rip.first || player.qu.rip.active || player.superGal.gte(1), get: () => player.qu.rip.amt, set: v => { player.qu.rip.amt = v; if (v.gt(0)) player.qu.rip.first = true; }, gain: () => sbSafe(() => tmp.rip.gain), formula: sbBuildRipFormula },

        // Infinity & Eternity
        { id: "inf", name: "Infinity Mass", cat: "Infinity & Eternity", unit: "num", unl: () => player.inf.reached, get: () => player.inf.points, set: v => { player.inf.points = v; if (v.gt(0)) player.inf.reached = true; }, gain: () => sbSafe(() => tmp.inf.gain), formula: () => sbBuildInfFormula(false) },
        { id: "inf_times", name: "Infinities", cat: "Infinity & Eternity", unit: "num", unl: () => player.inf.reached, get: () => player.inf.times, set: v => { player.inf.times = v; if (v.gt(0)) player.inf.reached = true; }, gain: () => sbSafe(() => tmp.inf.gainTimes), formula: () => sbBuildInfFormula(true) },
        { id: "et", name: "Eternal Mass", cat: "Infinity & Eternity", unit: "num", unl: () => player.et.times.gt(0) || hasElement(202), get: () => player.et.points, set: v => { player.et.points = v; }, gain: () => sbSafe(() => tmp.et.gain), formula: () => sbBuildEtFormula(false) },
        { id: "et_times", name: "Eternities", cat: "Infinity & Eternity", unit: "num", unl: () => player.et.times.gt(0) || hasElement(202), get: () => player.et.times, set: v => { player.et.times = v; }, gain: () => sbSafe(() => tmp.et.gainTimes), formula: () => sbBuildEtFormula(true) },
        { id: "timeshards", name: "Timeshards", cat: "Infinity & Eternity", unit: "num", unl: () => player.et.times.gt(0), get: () => player.et.shards, set: v => { player.et.shards = v; }, gain: () => sbSafe(() => tmp.et.shards_gain), formula: sbBuildTimeshardsFormula },

        // Exotic, Dark & Matters
        { id: "exotic", name: "Exotic Matter", cat: "Exotic & Matters", unit: "num", unl: () => hasElement(359) || player.exotic.times.gte(1), get: () => player.exotic.points, set: v => { player.exotic.points = v; }, gain: () => sbSafe(() => tmp.ex.gain), formula: () => sbBuildExoticFormula(false) },
        { id: "exotic_times", name: "Exotic Resets", cat: "Exotic & Matters", unit: "num", unl: () => player.exotic.times.gte(1), get: () => player.exotic.times, set: v => { player.exotic.times = v; }, gain: () => sbSafe(() => tmp.ex.gainTimes), formula: () => sbBuildExoticFormula(true) },
        { id: "exotic_bp", name: "Exotic Boost Points", cat: "Exotic & Matters", unit: "num", unl: () => hasUpgrade("exotic", 10), get: () => player.exotic.bp, set: v => { player.exotic.bp = v; }, gain: () => sbSafe(() => EXOTIC_BOOST.gain()), formula: sbBuildExoticBPFormula },
        { id: "darkRay", name: "Dark Ray", cat: "Exotic & Matters", unit: "num", unl: () => hasUpgrade("exotic", 15), get: () => player.exotic.dr, set: v => { player.exotic.dr = v; }, gain: () => sbSafe(() => EXOTIC.drGain()), formula: () => sbBuildDarkFormula("dr") },
        { id: "darkShadow", name: "Dark Shadow", cat: "Exotic & Matters", unit: "num", unl: () => hasUpgrade("exotic", 15), get: () => player.exotic.ds, set: v => { player.exotic.ds = v; }, gain: () => sbSafe(() => EXOTIC.dsGain()), formula: () => sbBuildDarkFormula("ds") },
        { id: "abyssalBlot", name: "Abyssal Blot", cat: "Exotic & Matters", unit: "num", unl: () => hasElement(414), get: () => player.exotic.ab, set: v => { player.exotic.ab = v; }, gain: () => sbSafe(() => EXOTIC.abGain()), formula: () => sbBuildDarkFormula("ab") },
        { id: "dr_points", name: "Glyphic Mass", cat: "Exotic & Matters", unit: "num", unl: () => hasElement(450), get: () => player.exotic.dark_run.points, set: v => { player.exotic.dark_run.points = v; }, gain: () => sbSafe(() => DARK_RUN.gain()), formula: sbBuildGlyphicFormula },
        { id: "fss", name: "Final Star Shards", cat: "Exotic & Matters", unit: "num", unl: () => hasElement(486), get: () => player.exotic.fss, set: v => { player.exotic.fss = v; }, gain: () => sbSafe(() => MATTERS.fssBase().gte(MATTERS.fssReq()) ? E(1) : E(0)), formula: () => new FormulaBuilder("FSS Base Req", `${sbFormat(sbSafe(() => MATTERS.fssBase(), 0))} / ${sbFormat(sbSafe(() => MATTERS.fssReq(), 40))}`).done(" on FSS reset") },
    ];

    // Add 5 Star Generators after Stars
    const starIdx = list.findIndex(c => c.id === "stars") + 1;
    for (let i = 0; i < 5; i++) {
        list.splice(starIdx + i, 0, {
            id: "star_gen_" + i,
            name: "Star Generator #" + (i + 1),
            cat: "Atom",
            unit: "num",
            unl: () => STARS.unlocked() && player.stars.unls > i,
            get: () => player.stars.generators[i],
            set: v => {
                player.stars.generators[i] = v;
                if (v.gt(0) && player.stars.unls <= i) player.stars.unls = i + 1;
            },
            gain: () => sbSafe(() => tmp.stars.generators_gain[i].mul(tmp.preQUGlobalSpeed)),
            formula: () => sbBuildStarGenFormula(i),
        });
    }

    // Add 7 Radiation Wavelength Distances after rad_hz
    const radNames = ["Radio", "Microwave", "Infrared", "Visible", "Ultraviolet", "X-ray", "Gamma-ray"];
    const radIdx = list.findIndex(c => c.id === "rad_hz") + 1;
    for (let x = 0; x < 7; x++) {
        list.splice(radIdx + x, 0, {
            id: "rad_" + x,
            name: radNames[x] + " Distance",
            cat: "Supernova",
            unit: "m",
            unl: () => hasTree("unl1") && (x === 0 || player.supernova.radiation.hz.gte(RADIATION.unls[x] || EINF)),
            get: () => player.supernova.radiation.ds[x],
            set: v => { player.supernova.radiation.ds[x] = v; },
            gain: () => sbSafe(() => tmp.radiation.ds_gain[x].mul(tmp.preQUGlobalSpeed)),
            formula: () => sbBuildRadDistFormula(x),
        });
    }

    // Add 13 Matters
    for (let i = 0; i < MATTERS_NAMES_LOCAL.length; i++) {
        list.push({
            id: "matter_" + i,
            name: MATTERS_NAMES_LOCAL[i],
            cat: "Exotic & Matters",
            unit: "num",
            unl: () => hasElement(486),
            get: () => player.exotic.matters[i],
            set: v => { player.exotic.matters[i] = v; },
            gain: () => sbSafe(() => MATTERS.gain(i)),
            formula: () => sbBuildMatterFormula(i),
        });
    }

    // Add 4 Axions
    const axNames = ["X Axions", "Y Axions", "Z Axions", "W Axions"];
    const axReqs = [534, 540, 554, 554];
    for (let i = 0; i < 4; i++) {
        list.push({
            id: "ax_" + i,
            name: axNames[i],
            cat: "Exotic & Matters",
            unit: "num",
            unl: () => hasElement(axReqs[i]) || (i === 3 && hasTree("ax20")),
            get: () => player.exotic.ax[i],
            set: v => { player.exotic.ax[i] = v; },
            gain: () => sbSafe(() => tmp.ex.axg_eff[i]?.eff || 0),
            formula: () => sbBuildAxionFormula(i),
        });
    }

    return list;
}

const SANDBOX_CURRENCIES = buildSandboxCurrencies();
const SANDBOX_CURRENCY_MAP = {};
for (let i = 0; i < SANDBOX_CURRENCIES.length; i++) {
    SANDBOX_CURRENCY_MAP[SANDBOX_CURRENCIES[i].id] = SANDBOX_CURRENCIES[i];
}

function sbEnsureState() {
    if (!player) return null;
    if (!player.sandbox || typeof player.sandbox !== "object") {
        player.sandbox = { antiNan: true, caps: {} };
    }
    if (typeof player.sandbox.antiNan !== "boolean") player.sandbox.antiNan = true;
    if (!player.sandbox.caps || typeof player.sandbox.caps !== "object") player.sandbox.caps = {};
    return player.sandbox;
}

function sbResolveCapDec(id, rawVal, isNumber) {
    const key = `${id}|${rawVal}|${isNumber ? 1 : 0}`;
    if (SANDBOX_STATE.capObjCache[key]) return SANDBOX_STATE.capObjCache[key];
    const parsed = parseSandboxDecimal(rawVal, { isNumber });
    if (!parsed.ok) return null;
    SANDBOX_STATE.capObjCache[key] = parsed.value;
    return parsed.value;
}

function sbSnapshotPlayer(obj) {
    if (!obj || typeof obj !== "object") return null;
    if (Array.isArray(obj)) {
        const out = new Array(obj.length);
        for (let i = 0; i < obj.length; i++) {
            const v = obj[i];
            if (v === null || v === undefined) out[i] = v;
            else if (typeof v === "number") out[i] = Number.isFinite(v) ? v : 0;
            else if (v instanceof Decimal) {
                out[i] = sbIsFiniteDec(v) ? [v.sign, v.layer, v.mag] : null;
            } else if (typeof v === "object") {
                out[i] = sbSnapshotPlayer(v);
            } else {
                out[i] = v;
            }
        }
        return out;
    }
    const out = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k === "sandbox" || k === "options" || k === "confirms" || k === "reset_msg" || k === "main_upg_msg") continue;
        const v = obj[k];
        if (v === null || v === undefined) out[k] = v;
        else if (typeof v === "number") out[k] = Number.isFinite(v) ? v : 0;
        else if (v instanceof Decimal) {
            out[k] = sbIsFiniteDec(v) ? [v.sign, v.layer, v.mag] : null;
        } else if (typeof v === "object") {
            out[k] = sbSnapshotPlayer(v);
        } else {
            out[k] = v;
        }
    }
    return out;
}

function sbRestoreNaNFromSnap(obj, snap) {
    if (!obj || typeof obj !== "object") return;
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k === "sandbox" || k === "options" || k === "confirms") continue;
        const v = obj[k];
        const sv = snap ? snap[k] : undefined;
        if (typeof v === "number") {
            if (Number.isNaN(v)) {
                obj[k] = (typeof sv === "number" && Number.isFinite(sv)) ? sv : 0;
            } else if (!Number.isFinite(v)) {
                obj[k] = 1e308;
            }
        } else if (v instanceof Decimal) {
            if (Number.isNaN(v.mag) || Number.isNaN(v.layer) || Number.isNaN(v.sign)) {
                if (Array.isArray(sv)) obj[k] = Decimal.fromComponents(sv[0], sv[1], sv[2]);
                else obj[k] = E(0);
            } else if (v.mag === Infinity || v.layer === Infinity || v.gt(SANDBOX_MAX)) {
                obj[k] = new Decimal(SANDBOX_MAX);
            }
        } else if (v && typeof v === "object") {
            sbRestoreNaNFromSnap(v, sv);
        }
    }
}

const SANDBOX = {
    getCurrency(id) {
        return SANDBOX_CURRENCY_MAP[id] || null;
    },
    getCurrencies() {
        return SANDBOX_CURRENCIES;
    },
    hasAnyActiveHardcap() {
        const sb = sbEnsureState();
        if (!sb) return false;
        const caps = sb.caps;
        for (const id in caps) {
            if (caps[id] && caps[id].enabled) return true;
        }
        return false;
    },
    getCap(id) {
        const sb = sbEnsureState();
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!sb || !c) return { enabled: false, val: SANDBOX_MAX_STR, capDec: null };
        const entry = sb.caps[id];
        if (!entry || typeof entry !== "object") {
            return { enabled: false, val: c.isNumber ? "1e308" : SANDBOX_MAX_STR, capDec: null };
        }
        const valStr = typeof entry.val === "string" && entry.val ? entry.val : (c.isNumber ? "1e308" : SANDBOX_MAX_STR);
        const capDec = sbResolveCapDec(id, valStr, !!c.isNumber);
        return { enabled: !!entry.enabled && !!capDec, val: valStr, capDec };
    },
    enforceHardcaps() {
        const sb = sbEnsureState();
        if (!sb) return;
        for (let i = 0; i < SANDBOX_CURRENCIES.length; i++) {
            const c = SANDBOX_CURRENCIES[i];
            if (c.readOnlyCurrency) continue;
            const entry = sb.caps[c.id];
            if (!entry || !entry.enabled) continue;
            const capDec = sbResolveCapDec(c.id, entry.val, !!c.isNumber);
            if (!capDec) continue;
            let cur = sbSafe(() => c.get(), E(0));
            if (!sbIsFiniteDec(cur)) {
                if (E(cur).mag === Infinity || E(cur).layer === Infinity) cur = new Decimal(capDec);
                else cur = E(0);
                c.set(cur);
            }
            if (cur.gt(capDec)) {
                c.set(new Decimal(capDec));
            } else if (cur.lt(0)) {
                c.set(E(0));
            }
        }
    },
    beforeCalc() {
        const sb = sbEnsureState();
        if (!sb) return null;
        this.enforceHardcaps();
        if (sb.antiNan || this.hasAnyActiveHardcap()) {
            return sbSnapshotPlayer(player);
        }
        return null;
    },
    afterCalc(snap) {
        const sb = sbEnsureState();
        if (!sb) return;
        if (sb.antiNan || this.hasAnyActiveHardcap()) {
            sbRestoreNaNFromSnap(player, snap);
        }
        this.enforceHardcaps();
    },
    setCurrency(id, rawInput) {
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!c || c.readOnlyCurrency) return { ok: false, error: "Currency cannot be edited" };
        const parsed = parseSandboxDecimal(rawInput, { isNumber: !!c.isNumber });
        if (!parsed.ok) {
            SANDBOX_STATE.feedback[id] = { err: true, msg: parsed.error };
            this.updateRowFeedback(id);
            return parsed;
        }
        let val = parsed.value;
        let clampedCap = false;
        const cap = this.getCap(id);
        if (cap.enabled && cap.capDec && val.gt(cap.capDec)) {
            val = new Decimal(cap.capDec);
            clampedCap = true;
        }
        c.set(val);
        this.enforceHardcaps();
        const note = clampedCap
            ? `Set (clamped to active hardcap ${sbFormat(cap.capDec)})`
            : (parsed.clampedMax ? `Clamped to max (${c.isNumber ? "1e308" : SANDBOX_MAX_STR})` : `Set to ${c.unit === "mass" ? sbFormatMass(val) : sbFormat(val)}`);
        SANDBOX_STATE.feedback[id] = { err: false, msg: note };
        SANDBOX_STATE.draftValues[id] = rawInput;
        this.updateRowFeedback(id);
        return { ok: true, value: val, clampedMax: parsed.clampedMax, clampedCap };
    },
    setToMax(id) {
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!c || c.readOnlyCurrency) return;
        const maxInput = c.isNumber ? "1e308" : SANDBOX_MAX_STR;
        SANDBOX_STATE.draftValues[id] = maxInput;
        const inp = document.getElementById("sb_val_in_" + id);
        if (inp) inp.value = maxInput;
        return this.setCurrency(id, maxInput);
    },
    setToZero(id) {
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!c || c.readOnlyCurrency) return;
        SANDBOX_STATE.draftValues[id] = "0";
        const inp = document.getElementById("sb_val_in_" + id);
        if (inp) inp.value = "0";
        return this.setCurrency(id, "0");
    },
    setHardcap(id, rawInput, enable = true) {
        const sb = sbEnsureState();
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!sb || !c || c.readOnlyCurrency) return { ok: false, error: "Invalid currency" };
        const parsed = parseSandboxDecimal(rawInput, { isNumber: !!c.isNumber });
        if (!parsed.ok) {
            SANDBOX_STATE.feedback[id] = { err: true, msg: "Hardcap error: " + parsed.error };
            this.updateRowFeedback(id);
            return parsed;
        }
        const strVal = parsed.clampedMax ? (c.isNumber ? "1e308" : SANDBOX_MAX_STR) : String(rawInput).trim();
        sb.caps[id] = { enabled: !!enable, val: strVal };
        SANDBOX_STATE.draftCaps[id] = strVal;
        const capInp = document.getElementById("sb_cap_in_" + id);
        if (capInp) capInp.value = strVal;
        this.enforceHardcaps();
        SANDBOX_STATE.feedback[id] = {
            err: false,
            msg: enable ? `Hardcap ON @ ${sbFormat(parsed.value)}${parsed.clampedMax ? " (clamped to max)" : ""}` : `Hardcap saved @ ${sbFormat(parsed.value)} (OFF)`,
        };
        this.updateRowFeedback(id);
        this.updateHeaderSummary();
        return { ok: true, value: parsed.value, clampedMax: parsed.clampedMax };
    },
    toggleHardcap(id) {
        const sb = sbEnsureState();
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!sb || !c || c.readOnlyCurrency) return;
        const cur = this.getCap(id);
        const inp = document.getElementById("sb_cap_in_" + id);
        const raw = (inp && inp.value.trim()) || SANDBOX_STATE.draftCaps[id] || cur.val || (c.isNumber ? "1e308" : SANDBOX_MAX_STR);
        if (!cur.enabled) {
            this.setHardcap(id, raw, true);
        } else {
            sb.caps[id] = { enabled: false, val: cur.val };
            this.enforceHardcaps();
            SANDBOX_STATE.feedback[id] = { err: false, msg: "Hardcap disabled" };
            this.updateRowFeedback(id);
            this.updateHeaderSummary();
        }
    },
    applyBulkCap(filteredOnly, rawOverride) {
        const sb = sbEnsureState();
        if (!sb) return { ok: false, error: "No player state" };
        const inp = document.getElementById("sb_global_cap_in");
        const raw = rawOverride !== undefined
            ? String(rawOverride).trim()
            : ((inp && inp.value.trim()) || SANDBOX_STATE.globalCapInput || SANDBOX_MAX_STR);
        SANDBOX_STATE.globalCapInput = raw;
        if (inp && document.activeElement !== inp) inp.value = raw;
        const parsed = parseSandboxDecimal(raw, { isNumber: false });
        if (!parsed.ok) {
            SANDBOX_STATE.globalFeedback = "Global cap error: " + parsed.error;
            this.updateHeaderSummary();
            return parsed;
        }
        const targets = filteredOnly ? this.getFilteredCurrencies() : SANDBOX_CURRENCIES;
        let count = 0;
        for (let i = 0; i < targets.length; i++) {
            const c = targets[i];
            if (c.readOnlyCurrency) continue;
            const cParsed = parseSandboxDecimal(raw, { isNumber: !!c.isNumber });
            const valStr = cParsed.clampedMax ? (c.isNumber ? "1e308" : SANDBOX_MAX_STR) : raw;
            sb.caps[c.id] = { enabled: true, val: valStr };
            SANDBOX_STATE.draftCaps[c.id] = valStr;
            const capInp = document.getElementById("sb_cap_in_" + c.id);
            if (capInp && document.activeElement !== capInp) capInp.value = valStr;
            count++;
        }
        this.enforceHardcaps();
        SANDBOX_STATE.globalFeedback = `Enabled hardcap @ ${sbFormat(parsed.value)} for ${count} currencies`;
        this.updateHeaderSummary();
        this.updateLiveRows();
        return { ok: true, count };
    },
    disableAllCaps(resetValues = false) {
        const sb = sbEnsureState();
        if (!sb) return;
        if (resetValues) {
            sb.caps = {};
            SANDBOX_STATE.draftCaps = {};
            for (let i = 0; i < SANDBOX_CURRENCIES.length; i++) {
                const c = SANDBOX_CURRENCIES[i];
                const capInp = document.getElementById("sb_cap_in_" + c.id);
                if (capInp && document.activeElement !== capInp) {
                    capInp.value = c.isNumber ? "1e308" : SANDBOX_MAX_STR;
                }
            }
            SANDBOX_STATE.globalFeedback = "Reset all hardcaps to default (OFF)";
        } else {
            for (const id in sb.caps) {
                if (sb.caps[id]) sb.caps[id].enabled = false;
            }
            SANDBOX_STATE.globalFeedback = "Disabled all active hardcaps";
        }
        this.updateHeaderSummary();
        this.updateLiveRows();
    },
    toggleAntiNan() {
        const sb = sbEnsureState();
        if (!sb) return;
        sb.antiNan = !sb.antiNan;
        SANDBOX_STATE.globalFeedback = "Anti-NaN Guard set to " + (sb.antiNan ? "ON" : "OFF");
        this.updateHeaderSummary();
    },
    getFormula(id) {
        const c = SANDBOX_CURRENCY_MAP[id];
        if (!c || !c.formula) return { expr: "N/A", full: "Formula unavailable" };
        try {
            return c.formula();
        } catch (e) {
            return { expr: "N/A", full: "Formula unavailable" };
        }
    },
    getFilteredCurrencies() {
        const q = SANDBOX_STATE.query.trim().toLowerCase();
        const cat = SANDBOX_STATE.category;
        const onlyCapped = SANDBOX_STATE.onlyCapped;
        return SANDBOX_CURRENCIES.filter(c => {
            if (cat !== "all" && c.cat !== cat) return false;
            if (onlyCapped && !this.getCap(c.id).enabled) return false;
            if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !c.cat.toLowerCase().includes(q)) return false;
            return true;
        });
    },
    updateRowFeedback(id) {
        const el = document.getElementById("sb_fb_" + id);
        if (!el) return;
        const fb = SANDBOX_STATE.feedback[id];
        if (!fb) {
            el.textContent = "";
            el.className = "sb_feedback";
            return;
        }
        el.textContent = fb.msg;
        el.className = "sb_feedback " + (fb.err ? "err" : "ok");
    },
    updateHeaderSummary() {
        const sb = sbEnsureState();
        const activeCaps = SANDBOX_CURRENCIES.filter(c => this.getCap(c.id).enabled).length;
        const antiBtn = document.getElementById("sb_antinan_btn");
        if (antiBtn && sb) {
            antiBtn.textContent = "Anti-NaN Guard: " + (sb.antiNan ? "ON" : "OFF");
            antiBtn.className = "btn stats_btn_sm " + (sb.antiNan ? "sb_on" : "sb_off");
        }
        const badge = document.getElementById("sb_cap_summary");
        if (badge) {
            badge.textContent = `Active Hardcaps: ${activeCaps} / ${SANDBOX_CURRENCIES.length - 1} | Max Limit: ${SANDBOX_MAX_STR} (10^^1e308)`;
        }
        const gfb = document.getElementById("sb_global_fb");
        if (gfb) gfb.textContent = SANDBOX_STATE.globalFeedback || "";
    },
    setFilter(q) {
        SANDBOX_STATE.query = q || "";
        this.renderGrid(true);
    },
    setCategory(cat) {
        SANDBOX_STATE.category = cat;
        this.renderGrid(true);
    },
    toggleOnlyCapped() {
        SANDBOX_STATE.onlyCapped = !SANDBOX_STATE.onlyCapped;
        this.renderGrid(true);
    },
    renderGrid(force = false) {
        const root = document.getElementById("all_stats_sandbox");
        if (!root) return;
        const filtered = this.getFilteredCurrencies();
        const key = `${SANDBOX_STATE.category}|${SANDBOX_STATE.onlyCapped ? 1 : 0}|${filtered.map(c => c.id).join(",")}`;

        if (!document.getElementById("sb_toolbar")) {
            const sb = sbEnsureState();
            const catBtns = SANDBOX_CATEGORIES.map(c =>
                `<button class="btn stats_btn_sm sb_cat_btn" data-cat="${c.id}" onclick="SANDBOX.setCategory('${c.id}')">${c.label}</button>`
            ).join("");
            root.innerHTML = `
                <div id="sb_toolbar" class="sb_toolbar">
                    <div class="sb_toolbar_row">
                        <input id="sb_search" class="stats_search" type="text" placeholder="Filter currencies (e.g. mass, quark, entropy, matter)..." oninput="SANDBOX.setFilter(this.value)">
                        <button id="sb_only_capped_btn" class="btn stats_btn_sm" onclick="SANDBOX.toggleOnlyCapped()">Only Active Hardcaps: OFF</button>
                        <button id="sb_antinan_btn" class="btn stats_btn_sm" onclick="SANDBOX.toggleAntiNan()">Anti-NaN Guard: ${sb && !sb.antiNan ? "OFF" : "ON"}</button>
                        <span id="sb_cap_summary" class="sb_summary_pill"></span>
                    </div>
                    <div class="sb_toolbar_row sb_cats">${catBtns}</div>
                    <div class="sb_toolbar_row sb_bulk_row">
                        <span class="sb_bulk_label">Bulk Hardcap:</span>
                        <input id="sb_global_cap_in" class="sb_input" type="text" value="${sEsc(SANDBOX_STATE.globalCapInput)}" placeholder="e.g. Fe308, ee100, 1e1000" oninput="SANDBOX_STATE.globalCapInput = this.value">
                        <button class="btn stats_btn_sm" onclick="SANDBOX.applyBulkCap(true)">Cap Filtered</button>
                        <button class="btn stats_btn_sm" onclick="SANDBOX.applyBulkCap(false)">Cap All</button>
                        <button class="btn stats_btn_sm" onclick="SANDBOX.disableAllCaps(false)">Disable All Caps</button>
                        <button class="btn stats_btn_sm" onclick="SANDBOX.disableAllCaps(true)">Reset Caps</button>
                        <span id="sb_global_fb" class="sb_feedback ok"></span>
                    </div>
                    <div class="sb_help">
                        Formats: <code>1e100</code>, <code>ee50</code>, <code>eee10</code>, <code>Fe308</code> (= 10^^1e308 max), <code>10^^1e308</code>, <code>(e^L)M</code>.
                        Inputs preserve focus while live values &amp; formulas tick underneath. Values above <code>${SANDBOX_MAX_STR}</code> clamp to <code>${SANDBOX_MAX_STR}</code> to prevent <code>NaN</code>.
                    </div>
                </div>
                <div id="sb_grid" class="sb_grid"></div>
            `;
        }

        const capFilterBtn = document.getElementById("sb_only_capped_btn");
        if (capFilterBtn) {
            capFilterBtn.textContent = "Only Active Hardcaps: " + (SANDBOX_STATE.onlyCapped ? "ON" : "OFF");
            capFilterBtn.className = "btn stats_btn_sm " + (SANDBOX_STATE.onlyCapped ? "sb_on" : "");
        }
        const gCapInp = document.getElementById("sb_global_cap_in");
        if (gCapInp && document.activeElement !== gCapInp && gCapInp.value !== SANDBOX_STATE.globalCapInput) {
            gCapInp.value = SANDBOX_STATE.globalCapInput;
        }
        const catBtns = document.querySelectorAll(".sb_cat_btn");
        for (let i = 0; i < catBtns.length; i++) {
            const b = catBtns[i];
            const active = b.getAttribute("data-cat") === SANDBOX_STATE.category;
            b.className = "btn stats_btn_sm sb_cat_btn" + (active ? " sb_cat_active" : "");
        }

        if (force || SANDBOX_STATE.builtKey !== key) {
            SANDBOX_STATE.builtKey = key;
            const grid = document.getElementById("sb_grid");
            if (grid) {
                if (filtered.length === 0) {
                    grid.innerHTML = `<div class="stats_empty">No matching currencies found.</div>`;
                } else {
                    grid.innerHTML = filtered.map(c => this.buildCardHTML(c)).join("");
                }
            }
            SANDBOX_STATE.lastValCache = {};
            SANDBOX_STATE.lastGainCache = {};
            SANDBOX_STATE.lastCapBtnCache = {};
            SANDBOX_STATE.lastCapInfoCache = {};
        }

        this.updateHeaderSummary();
        this.updateLiveRows();
    },
    buildCardHTML(c) {
        const cap = this.getCap(c.id);
        const curVal = sbSafe(() => c.get(), E(0));
        const valDraft = SANDBOX_STATE.draftValues[c.id] !== undefined
            ? SANDBOX_STATE.draftValues[c.id]
            : (c.isNumber ? String(Math.floor(curVal.toNumber())) : sbFormat(curVal));
        const capDraft = SANDBOX_STATE.draftCaps[c.id] !== undefined ? SANDBOX_STATE.draftCaps[c.id] : cap.val;
        const maxHint = c.isNumber ? "1e308" : SANDBOX_MAX_STR;
        const fb = SANDBOX_STATE.feedback[c.id];
        const editControls = c.readOnlyCurrency
            ? `<div class="sb_readonly">Derived multiplier (not directly stored — edit boosting currencies or caps instead)</div>`
            : `<div class="sb_ctrl_row">
                    <label class="sb_lbl">Value:</label>
                    <input id="sb_val_in_${c.id}" class="sb_input" type="text" value="${sEsc(valDraft)}" placeholder="e.g. 1e100, ${maxHint}" oninput="SANDBOX_STATE.draftValues['${c.id}'] = this.value" onkeydown="if(event.key==='Enter')SANDBOX.applyValueInput('${c.id}')">
                    <button class="btn stats_btn_sm" onclick="SANDBOX.applyValueInput('${c.id}')">Set</button>
                    <button class="btn stats_btn_sm" onclick="SANDBOX.setToMax('${c.id}')">${maxHint}</button>
                    <button class="btn stats_btn_sm" onclick="SANDBOX.setToZero('${c.id}')">0</button>
                </div>
                <div class="sb_ctrl_row">
                    <button id="sb_cap_btn_${c.id}" class="btn stats_btn_sm ${cap.enabled ? "sb_on" : "sb_off"}" onclick="SANDBOX.toggleHardcap('${c.id}')">Cap: ${cap.enabled ? "ON" : "OFF"}</button>
                    <input id="sb_cap_in_${c.id}" class="sb_input" type="text" value="${sEsc(capDraft)}" placeholder="${maxHint}" oninput="SANDBOX_STATE.draftCaps['${c.id}'] = this.value" onkeydown="if(event.key==='Enter')SANDBOX.applyCapInput('${c.id}')">
                    <button class="btn stats_btn_sm" onclick="SANDBOX.applyCapInput('${c.id}')">Set Cap</button>
                    <span id="sb_cap_status_${c.id}" class="sb_cap_status"></span>
                </div>
                <div id="sb_fb_${c.id}" class="sb_feedback ${fb ? (fb.err ? "err" : "ok") : ""}">${fb ? sEsc(fb.msg) : ""}</div>`;
        return `<div class="sb_card" id="sb_card_${c.id}">
            <div class="sb_card_head">
                <div>
                    <span class="sb_name">${sEsc(c.name)}</span>
                    <span class="stats_badge info">${sEsc(c.cat)}</span>
                    ${c.isNumber ? `<span class="stats_badge">Max 1e308 (JS#)</span>` : ""}
                </div>
                <span id="sb_unl_${c.id}" class="stats_badge"></span>
            </div>
            <div class="sb_live_row">
                <div>Current: <b id="sb_val_${c.id}"></b></div>
                <div class="sb_gain">Gain: <span id="sb_gain_${c.id}"></span></div>
            </div>
            <div class="sb_formula_box">
                <div class="sb_formula_expr"><b>Formula:</b> <span id="sb_fexpr_${c.id}"></span></div>
                <div class="sb_formula_full" id="sb_ffull_${c.id}"></div>
            </div>
            ${editControls}
        </div>`;
    },
    applyValueInput(id) {
        const inp = document.getElementById("sb_val_in_" + id);
        const raw = inp ? inp.value : (SANDBOX_STATE.draftValues[id] || "");
        this.setCurrency(id, raw);
    },
    applyCapInput(id) {
        const inp = document.getElementById("sb_cap_in_" + id);
        const raw = inp ? inp.value : (SANDBOX_STATE.draftCaps[id] || SANDBOX_MAX_STR);
        const cur = this.getCap(id);
        this.setHardcap(id, raw, true || cur.enabled);
    },
    updateLiveRows() {
        const filtered = this.getFilteredCurrencies();
        for (let i = 0; i < filtered.length; i++) {
            const c = filtered[i];
            const id = c.id;
            const cur = sbSafe(() => c.get(), E(0));
            const valStr = c.unit === "mass" ? sbFormatMass(cur) : (c.unit === "hz" ? sbFormat(cur) + " Hz" : (c.unit === "m" ? sbFormat(cur) + " m" : (c.unit === "mult" ? sbFormat(cur) + "x" : sbFormat(cur))));
            const valEl = document.getElementById("sb_val_" + id);
            if (valEl && SANDBOX_STATE.lastValCache[id] !== valStr) {
                valEl.textContent = valStr;
                SANDBOX_STATE.lastValCache[id] = valStr;
            }
            const g = sbSafe(() => c.gain(), E(0));
            const gStr = c.unit === "mass" ? "+" + sbFormatMass(g) : (c.unit === "hz" ? "+" + sbFormat(g) + " Hz" : (c.unit === "m" ? "+" + sbFormat(g) + " m" : (c.unit === "mult" ? "derived" : "+" + sbFormat(g))));
            const gainEl = document.getElementById("sb_gain_" + id);
            if (gainEl && SANDBOX_STATE.lastGainCache[id] !== gStr) {
                gainEl.textContent = gStr;
                SANDBOX_STATE.lastGainCache[id] = gStr;
            }
            const unlEl = document.getElementById("sb_unl_" + id);
            if (unlEl) {
                const isUnl = c.unl ? !!sbSafe(() => c.unl(), false) : true;
                const unlTxt = isUnl ? "Unlocked" : "Locked";
                if (unlEl.textContent !== unlTxt) {
                    unlEl.textContent = unlTxt;
                    unlEl.className = "stats_badge " + (isUnl ? "unlocked" : "locked");
                }
            }
            const form = this.getFormula(id);
            const fExprEl = document.getElementById("sb_fexpr_" + id);
            const fFullEl = document.getElementById("sb_ffull_" + id);
            if (fExprEl && fExprEl.textContent !== form.expr) fExprEl.textContent = form.expr;
            if (fFullEl && fFullEl.textContent !== form.full) fFullEl.textContent = form.full;

            if (!c.readOnlyCurrency) {
                const cap = this.getCap(id);
                const capBtn = document.getElementById("sb_cap_btn_" + id);
                const capBtnTxt = "Cap: " + (cap.enabled ? "ON" : "OFF");
                if (capBtn && SANDBOX_STATE.lastCapBtnCache[id] !== capBtnTxt) {
                    capBtn.textContent = capBtnTxt;
                    capBtn.className = "btn stats_btn_sm " + (cap.enabled ? "sb_on" : "sb_off");
                    SANDBOX_STATE.lastCapBtnCache[id] = capBtnTxt;
                }
                const capInfo = cap.enabled && cap.capDec ? `Max <= ${c.unit === "mass" ? sbFormatMass(cap.capDec) : sbFormat(cap.capDec)}` : "Uncapped";
                const capInfoEl = document.getElementById("sb_cap_status_" + id);
                if (capInfoEl && SANDBOX_STATE.lastCapInfoCache[id] !== capInfo) {
                    capInfoEl.textContent = capInfo;
                    capInfoEl.className = "sb_cap_status " + (cap.enabled ? "active" : "");
                    SANDBOX_STATE.lastCapInfoCache[id] = capInfo;
                }
            }
        }
    },
    updateHTML() {
        this.renderGrid(false);
    },
};
